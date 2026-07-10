# Bezpieczeństwo

## Zasady

- Nie commituj `.env`, kluczy prywatnych, sekretów cron/VAPID ani kluczy Supabase service-role.
- Klucz Firebase po stronie klienta nie jest sekretem. Ochrona danych musi wynikać z reguł Firebase i kontroli dostępu.
- Endpointy PHP są publiczne i wymagają walidacji wejścia, limitów rozmiaru, autoryzacji oraz bezpiecznych uprawnień katalogów.
- Dane zapisywane przez API (`stats.json`, `atmosphere_data.json`, uploady) powinny być traktowane jako stan serwera, a nie jako kod źródłowy.

## Rzeczy do sprawdzenia przed wdrożeniem

1. `api/upload.php` — walidacja `fileId`, limit liczby chunków i rozmiaru pliku, ochrona przed nadużyciem.
2. `api/atmosphere.php` — autoryzacja zapisu, limity i blokada współbieżnego zapisu JSON.
3. `neon-quiz-86/database.rules.json` — ograniczenie zapisu do właściwych użytkowników/pokoi.
4. `public/bobolog-api/` — brak wartości domyślnych dla sekretów; konfiguracja ma kończyć działanie przy brakujących zmiennych.

Przy zmianach bezpieczeństwa trzeba przetestować zarówno ścieżkę poprawną, jak i odrzucanie niepoprawnych żądań.
