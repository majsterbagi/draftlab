<?php
/**
 * BoboLog — Cron przypomnienia o szczepieniach
 * Uruchamiany codziennie o 08:00 przez panel home.pl:
 *   0 8 * * * curl "https://draftlab.pl/bobolog-api/vaccine-reminders.php?token=TWOJ_SECRET"
 *
 * Wysyła e-mail do admina rodziny 7 dni przed zaplanowanym szczepieniem.
 */

// ── Konfiguracja ─────────────────────────────────────────────────────────────
define('CRON_SECRET',       getenv('BOBOLOG_CRON_SECRET') ?: 'ZMIEN_NA_SWOJ_SECRET');
define('SUPABASE_URL',      getenv('SUPABASE_URL')        ?: 'https://TWOJ_PROJEKT.supabase.co');
define('SUPABASE_KEY',      getenv('SUPABASE_SERVICE_KEY') ?: 'TWOJ_SERVICE_ROLE_KEY');
define('SMTP_FROM',         'powiadomienia@draftlab.pl');
define('SMTP_FROM_NAME',    'BoboLog');
define('DAYS_BEFORE',       7);   // ile dni przed szczepieniem wysłać przypomnienie
// ─────────────────────────────────────────────────────────────────────────────

// Weryfikacja tokenu
if (($_GET['token'] ?? '') !== CRON_SECRET) {
    http_response_code(403);
    exit('Forbidden');
}

$targetDate = date('Y-m-d', strtotime('+' . DAYS_BEFORE . ' days'));

// Zapytanie do Supabase — szczepienia za 7 dni, niewykonane
$url = SUPABASE_URL . '/rest/v1/vaccine_records'
    . '?select=id,vaccine_id,custom_name,scheduled_date,child_id,family_id,children(name),families(name)'
    . '&scheduled_date=eq.' . $targetDate
    . '&done_date=is.null';

$ch = curl_init($url);
curl_setopt_array($ch, [
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_HTTPHEADER => [
        'apikey: '        . SUPABASE_KEY,
        'Authorization: Bearer ' . SUPABASE_KEY,
        'Content-Type: application/json',
    ],
]);
$body = curl_exec($ch);
$code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

if ($code !== 200) {
    http_response_code(500);
    exit("Supabase error: $code — $body");
}

$records = json_decode($body, true);
if (empty($records)) {
    echo "Brak przypomnień na $targetDate.";
    exit;
}

// Grupuj po rodzinie — wyślij jeden mail per rodzina
$byFamily = [];
foreach ($records as $r) {
    $fid = $r['family_id'];
    if (!isset($byFamily[$fid])) {
        $byFamily[$fid] = [
            'familyName' => $r['families']['name'] ?? 'Twoja rodzina',
            'childName'  => $r['children']['name'] ?? 'Twoje dziecko',
            'familyId'   => $fid,
            'vaccines'   => [],
        ];
    }
    $byFamily[$fid]['vaccines'][] = $r['custom_name'] ?: psoName($r['vaccine_id']);
}

// Pobierz e-maile adminów rodzin
$sent = 0;
foreach ($byFamily as $fid => $data) {
    $adminEmail = getAdminEmail($fid);
    if (!$adminEmail) continue;

    $subject = "💉 Przypomnienie o szczepieniu — {$data['childName']}";
    $html = buildMailHtml($data['childName'], $data['familyName'], $data['vaccines'], $targetDate);
    sendMail($adminEmail, $subject, $html);
    $sent++;
}

echo "Wysłano $sent przypomnień na $targetDate.";

// ── Funkcje pomocnicze ────────────────────────────────────────────────────────

function getAdminEmail(string $familyId): ?string {
    $url = SUPABASE_URL . '/rest/v1/family_members'
        . '?select=profiles(email)'
        . '&family_id=eq.' . urlencode($familyId)
        . '&role=eq.admin'
        . '&limit=1';

    $ch = curl_init($url);
    curl_setopt_array($ch, [
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_HTTPHEADER => [
            'apikey: ' . SUPABASE_KEY,
            'Authorization: Bearer ' . SUPABASE_KEY,
        ],
    ]);
    $data = json_decode(curl_exec($ch), true);
    curl_close($ch);
    return $data[0]['profiles']['email'] ?? null;
}

function sendMail(string $to, string $subject, string $html): void {
    $headers = implode("\r\n", [
        'MIME-Version: 1.0',
        'Content-Type: text/html; charset=UTF-8',
        'From: ' . SMTP_FROM_NAME . ' <' . SMTP_FROM . '>',
        'X-Mailer: BoboLog/1.0',
    ]);
    mail($to, $subject, $html, $headers);
}

function psoName(string $id): string {
    $names = [
        'hbv-0'  => 'WZW B (dawka 0)',   'bcg'    => 'Gruźlica (BCG)',
        'hbv-1'  => 'WZW B (dawka 1)',   'dtap-1' => 'DTPa+IPV+Hib (d1)',
        'pcv-1'  => 'Pneumokoki (d1)',   'rv-1'   => 'Rotawirusy (d1)',
        'dtap-2' => 'DTPa+IPV+Hib (d2)','pcv-2'  => 'Pneumokoki (d2)',
        'rv-2'   => 'Rotawirusy (d2)',   'dtap-3' => 'DTPa+IPV+Hib (d3)',
        'rv-3'   => 'Rotawirusy (d3)',   'hbv-2'  => 'WZW B (dawka 2)',
        'flu-1'  => 'Grypa',             'mmr-1'  => 'MMR (odra, świnka, różyczka)',
        'pcv-b'  => 'Pneumokoki (booster)', 'vzv-1' => 'Ospa wietrzna (d1)',
        'men-c'  => 'Meningokoki C',     'dtap-b' => 'DTPa+IPV+Hib (booster)',
        'vzv-2'  => 'Ospa wietrzna (d2)',
    ];
    return $names[$id] ?? $id;
}

function buildMailHtml(string $child, string $family, array $vaccines, string $date): string {
    $dateFormatted = (new DateTime($date))->format('j F Y');
    $list = implode('', array_map(fn($v) => "<li style='padding:4px 0'>💉 $v</li>", $vaccines));
    return <<<HTML
<!DOCTYPE html>
<html lang="pl">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f0faf5;font-family:'Nunito',Arial,sans-serif;">
  <div style="max-width:520px;margin:32px auto;background:#fff;border-radius:24px;overflow:hidden;box-shadow:0 2px 16px rgba(0,0,0,.08)">
    <div style="background:#C9EBDB;padding:24px 32px;text-align:center">
      <div style="font-size:40px">💉</div>
      <h1 style="margin:8px 0 0;font-size:22px;color:#1a3a2a">Przypomnienie o szczepieniu</h1>
    </div>
    <div style="padding:28px 32px;color:#2d2d2d">
      <p style="margin:0 0 16px;font-size:16px">
        Hej! Zbliża się termin szczepienia dla <strong>$child</strong> ({$family}).
      </p>
      <div style="background:#f0faf5;border-radius:16px;padding:16px 20px;margin-bottom:20px">
        <p style="margin:0 0 8px;font-size:13px;color:#6b8f7a;font-weight:600">Planowane za 7 dni — $dateFormatted</p>
        <ul style="margin:0;padding-left:16px;font-size:15px;font-weight:600">$list</ul>
      </div>
      <p style="margin:0 0 20px;font-size:14px;color:#6b8f7a">
        Umów wizytę u pediatry lub w przychodni POZ.
      </p>
      <a href="https://draftlab.pl/bobolog/" style="display:inline-block;background:#C9EBDB;color:#1a3a2a;font-weight:700;text-decoration:none;padding:12px 28px;border-radius:100px;font-size:15px">
        Otwórz BoboLog
      </a>
    </div>
    <div style="padding:16px 32px;text-align:center;font-size:12px;color:#9db8aa;border-top:1px solid #e8f5ef">
      BoboLog · powered by draftlab.pl · <a href="https://draftlab.pl/bobolog/" style="color:#9db8aa">wypisz się</a>
    </div>
  </div>
</body>
</html>
HTML;
}
