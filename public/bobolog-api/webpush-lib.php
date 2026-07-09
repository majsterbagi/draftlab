<?php
/**
 * BoboLog — minimalna biblioteka Web Push (VAPID + RFC 8291 aes128gcm) bez composera.
 * Wymaga PHP >= 7.3 z openssl (openssl_pkey_derive) — standard na home.pl.
 *
 * Użycie:
 *   $code = webpush_send($endpoint, $p256dh, $auth, $payloadJson, VAPID_PUBLIC, VAPID_PRIVATE, VAPID_SUBJECT);
 *   // 201 = wysłane, 404/410 = subskrypcja martwa (usuń z bazy)
 */

function b64url_encode(string $data): string {
    return rtrim(strtr(base64_encode($data), '+/', '-_'), '=');
}

function b64url_decode(string $data): string {
    return base64_decode(strtr($data, '-_', '+/') . str_repeat('=', (4 - strlen($data) % 4) % 4));
}

/** PEM klucza prywatnego EC (SEC1) z surowego skalara d + punktu publicznego. */
function ec_private_pem(string $d32, string $pub65): string {
    $der = "\x30\x77\x02\x01\x01\x04\x20" . $d32
         . "\xa0\x0a\x06\x08\x2a\x86\x48\xce\x3d\x03\x01\x07"
         . "\xa1\x44\x03\x42\x00" . $pub65;
    return "-----BEGIN EC PRIVATE KEY-----\n" . chunk_split(base64_encode($der), 64, "\n") . "-----END EC PRIVATE KEY-----\n";
}

/** PEM klucza publicznego EC (SubjectPublicKeyInfo) z surowego punktu 65 B. */
function ec_public_pem(string $pub65): string {
    $der = hex2bin('3059301306072a8648ce3d020106082a8648ce3d030107034200') . $pub65;
    return "-----BEGIN PUBLIC KEY-----\n" . chunk_split(base64_encode($der), 64, "\n") . "-----END PUBLIC KEY-----\n";
}

/** Podpis DER (openssl) → surowe r||s (64 B) wymagane w JWT ES256. */
function der_sig_to_raw(string $der): string {
    $offset = 2;
    if (ord($der[1]) & 0x80) $offset += ord($der[1]) & 0x7f; // długość wieloBajtowa
    $rLen = ord($der[$offset + 1]);
    $r = substr($der, $offset + 2, $rLen);
    $offset += 2 + $rLen;
    $sLen = ord($der[$offset + 1]);
    $s = substr($der, $offset + 2, $sLen);
    $pad = fn(string $x) => str_pad(ltrim($x, "\x00"), 32, "\x00", STR_PAD_LEFT);
    return $pad($r) . $pad($s);
}

/** Token VAPID (JWT ES256) dla danego origin endpointu push. */
function vapid_jwt(string $audience, string $subject, string $privB64u, string $pubB64u): string {
    $header = b64url_encode(json_encode(['typ' => 'JWT', 'alg' => 'ES256']));
    $claims = b64url_encode(json_encode(['aud' => $audience, 'exp' => time() + 12 * 3600, 'sub' => $subject]));
    $data = "$header.$claims";
    $pem = ec_private_pem(b64url_decode($privB64u), b64url_decode($pubB64u));
    if (!openssl_sign($data, $der, $pem, OPENSSL_ALGO_SHA256)) {
        throw new RuntimeException('VAPID: openssl_sign failed');
    }
    return "$data." . b64url_encode(der_sig_to_raw($der));
}

/** Szyfrowanie payloadu wg RFC 8291 (aes128gcm). Zwraca gotowe body żądania. */
function webpush_encrypt(string $payload, string $p256dhB64u, string $authB64u): string {
    $uaPublic   = b64url_decode($p256dhB64u);  // 65 B punkt odbiorcy
    $authSecret = b64url_decode($authB64u);    // 16 B

    // Efemeryczna para kluczy nadawcy (AS)
    $asKey = openssl_pkey_new(['curve_name' => 'prime256v1', 'private_key_type' => OPENSSL_KEYTYPE_EC]);
    if (!$asKey) throw new RuntimeException('webpush: nie można wygenerować klucza EC');
    $det = openssl_pkey_get_details($asKey);
    $asPublic = "\x04" . str_pad($det['ec']['x'], 32, "\x00", STR_PAD_LEFT)
                        . str_pad($det['ec']['y'], 32, "\x00", STR_PAD_LEFT);

    // ECDH → wspólny sekret
    $shared = openssl_pkey_derive(ec_public_pem($uaPublic), $asKey, 32);
    if ($shared === false) throw new RuntimeException('webpush: openssl_pkey_derive failed');

    // HKDF wg RFC 8291
    $ikm   = hash_hkdf('sha256', $shared, 32, "WebPush: info\x00" . $uaPublic . $asPublic, $authSecret);
    $salt  = random_bytes(16);
    $cek   = hash_hkdf('sha256', $ikm, 16, "Content-Encoding: aes128gcm\x00", $salt);
    $nonce = hash_hkdf('sha256', $ikm, 12, "Content-Encoding: nonce\x00", $salt);

    // Padding delimiter ostatniego rekordu: 0x02
    $cipher = openssl_encrypt($payload . "\x02", 'aes-128-gcm', $cek, OPENSSL_RAW_DATA, $nonce, $tag);
    if ($cipher === false) throw new RuntimeException('webpush: szyfrowanie nie powiodło się');

    // Nagłówek aes128gcm: salt(16) | rs(4) | idlen(1) | as_public(65) | ciphertext+tag
    return $salt . pack('N', 4096) . chr(65) . $asPublic . $cipher . $tag;
}

/** Wyślij powiadomienie push. Zwraca kod HTTP (201 = OK, 404/410 = usuń subskrypcję). */
function webpush_send(string $endpoint, string $p256dh, string $auth, string $payload,
                      string $vapidPub, string $vapidPriv, string $vapidSubject): int {
    $body = webpush_encrypt($payload, $p256dh, $auth);
    $aud  = parse_url($endpoint, PHP_URL_SCHEME) . '://' . parse_url($endpoint, PHP_URL_HOST);
    $jwt  = vapid_jwt($aud, $vapidSubject, $vapidPriv, $vapidPub);

    $ch = curl_init($endpoint);
    curl_setopt_array($ch, [
        CURLOPT_POST => true,
        CURLOPT_POSTFIELDS => $body,
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_TIMEOUT => 15,
        CURLOPT_HTTPHEADER => [
            'Content-Type: application/octet-stream',
            'Content-Encoding: aes128gcm',
            'Content-Length: ' . strlen($body),
            'TTL: 86400',
            'Urgency: normal',
            'Authorization: vapid t=' . $jwt . ', k=' . $vapidPub,
        ],
    ]);
    curl_exec($ch);
    $code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);
    return $code;
}
