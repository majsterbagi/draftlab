<?php
/**
 * BoboLog — Cron powiadomień push (Web Push / VAPID)
 * Uruchamiany codziennie o 08:30 przez panel home.pl:
 *   30 8 * * * curl "https://draftlab.pl/bobolog-api/push-notifications.php?token=TWOJ_SECRET"
 *
 * Wysyła:
 *  - przypomnienia o szczepieniach (jutro oraz za 7 dni),
 *  - miesięcznice / urodziny dziecka (dziś).
 * Martwe subskrypcje (404/410) są usuwane z bazy.
 */

require __DIR__ . '/webpush-lib.php';

// ── Konfiguracja ─────────────────────────────────────────────────────────────
define('CRON_SECRET',   getenv('BOBOLOG_CRON_SECRET')   ?: 'ZMIEN_NA_SWOJ_SECRET');
define('SUPABASE_URL',  getenv('SUPABASE_URL')          ?: 'https://TWOJ_PROJEKT.supabase.co');
define('SUPABASE_KEY',  getenv('SUPABASE_SERVICE_KEY')  ?: 'TWOJ_SERVICE_ROLE_KEY');
define('VAPID_PUBLIC',  getenv('BOBOLOG_VAPID_PUBLIC')  ?: 'KLUCZ_PUBLICZNY_VAPID');
define('VAPID_PRIVATE', getenv('BOBOLOG_VAPID_PRIVATE') ?: 'KLUCZ_PRYWATNY_VAPID');
define('VAPID_SUBJECT', 'mailto:powiadomienia@draftlab.pl');
define('APP_URL',       'https://draftlab.pl/bobolog/');
// ─────────────────────────────────────────────────────────────────────────────

if (($_GET['token'] ?? '') !== CRON_SECRET) {
    http_response_code(403);
    exit('Forbidden');
}

function sb_get(string $pathQuery): array {
    $ch = curl_init(SUPABASE_URL . '/rest/v1/' . $pathQuery);
    curl_setopt_array($ch, [
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_HTTPHEADER => [
            'apikey: ' . SUPABASE_KEY,
            'Authorization: Bearer ' . SUPABASE_KEY,
        ],
    ]);
    $body = curl_exec($ch);
    $code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);
    if ($code !== 200) { echo "Supabase error $code: $body\n"; return []; }
    return json_decode($body, true) ?: [];
}

function sb_delete_subscription(string $endpoint): void {
    $ch = curl_init(SUPABASE_URL . '/rest/v1/push_subscriptions?endpoint=eq.' . urlencode($endpoint));
    curl_setopt_array($ch, [
        CURLOPT_CUSTOMREQUEST => 'DELETE',
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_HTTPHEADER => [
            'apikey: ' . SUPABASE_KEY,
            'Authorization: Bearer ' . SUPABASE_KEY,
        ],
    ]);
    curl_exec($ch);
    curl_close($ch);
}

/** Wyślij payload do wszystkich subskrypcji rodziny; zwraca liczbę wysłanych. */
function notify_family(string $familyId, array $payload): int {
    $subs = sb_get('push_subscriptions?select=endpoint,p256dh,auth&family_id=eq.' . urlencode($familyId));
    $sent = 0;
    foreach ($subs as $s) {
        try {
            $code = webpush_send($s['endpoint'], $s['p256dh'], $s['auth'],
                json_encode($payload, JSON_UNESCAPED_UNICODE),
                VAPID_PUBLIC, VAPID_PRIVATE, VAPID_SUBJECT);
        } catch (Throwable $e) {
            echo "webpush error: {$e->getMessage()}\n";
            continue;
        }
        if (in_array($code, [404, 410], true)) {
            sb_delete_subscription($s['endpoint']);
        } elseif ($code >= 200 && $code < 300) {
            $sent++;
        } else {
            echo "push HTTP $code dla {$s['endpoint']}\n";
        }
    }
    return $sent;
}

$totalSent = 0;

// ── 1. Szczepienia: jutro oraz za 7 dni ──────────────────────────────────────
foreach ([1 => 'jutro', 7 => 'za tydzień'] as $days => $when) {
    $date = date('Y-m-d', strtotime("+$days days"));
    $records = sb_get('vaccine_records?select=vaccine_id,custom_name,family_id,children(name)'
        . '&scheduled_date=eq.' . $date . '&done_date=is.null');

    $byFamily = [];
    foreach ($records as $r) {
        $byFamily[$r['family_id']]['child'] = $r['children']['name'] ?? 'Dziecko';
        $byFamily[$r['family_id']]['names'][] = $r['custom_name'] ?: $r['vaccine_id'];
    }
    foreach ($byFamily as $fid => $d) {
        $totalSent += notify_family($fid, [
            'title' => "💉 Szczepienie $when",
            'body'  => $d['child'] . ': ' . implode(', ', $d['names']) . ' — ' . $date,
            'url'   => APP_URL,
        ]);
    }
}

// ── 2. Miesięcznice i urodziny (dziś) ────────────────────────────────────────
$children = sb_get('children?select=name,birth_date,family_id&birth_date=not.is.null');
$today = new DateTime('today');
foreach ($children as $c) {
    $birth = new DateTime($c['birth_date']);
    if ($birth >= $today) continue;
    $months = ($today->format('Y') - $birth->format('Y')) * 12 + ($today->format('n') - $birth->format('n'));
    if ($months < 1 || (int)$birth->format('j') !== (int)$today->format('j')) continue;

    if ($months % 12 === 0) {
        $y = intdiv($months, 12);
        $label = $y . ' ' . ($y === 1 ? 'rok' : ($y < 5 ? 'lata' : 'lat'));
    } else {
        $label = $months . ' mies.';
    }
    $totalSent += notify_family($c['family_id'], [
        'title' => "🎂 {$c['name']} kończy dziś $label!",
        'body'  => 'Uwiecznij ten dzień — dodaj zdjęcie w zakładce Chwile 📸',
        'url'   => APP_URL,
    ]);
}

echo "Wysłano $totalSent powiadomień push.\n";
