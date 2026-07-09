# BoboLog — plan projektu

Portal-aplikacja dla rodziców do rejestrowania parametrów małego dziecka (0–3 lata).
Osobny projekt w ramach repo draftlab, deployowany na `bobolog.draftlab.pl` (docelowo `bobolog.pl`).
Na draftlab.pl: kafelek aplikacji + podstrona + dziennik zmian ("powered by draftlab.pl").

## Decyzje produktowe (ustalone z właścicielem, 2026-07)

- **Publiczny portal** z kontami; pierwsi testerzy: rodzina właściciela.
- **Rodziny:** rodzic zakłada konto, zaprasza mailem/linkiem drugiego rodzica i innych opiekunów
  (dziadkowie, ciocie...). Rodzice = admini; pozostali dodają wpisy, bez usuwania.
  Widoczność wpisów medycznych sterowana ustawieniem rodziców.
- **Must have:** karmienie (pierś/butelka/rozszerzanie diety + reakcje), pieluchy, sen
  (timer + wpis ręczny), waga z siatką centylową WHO, szczepienia.
- **Nice to have:** interaktywny kalendarzyk szczepień (polski PSO) z przypomnieniami mail,
  leki, kamienie milowe (lista WHO + własne), notatki i 1 zdjęcie/wpis (kompresja).
- **Ciąża:** odliczanie do narodzin, potem startuje dziennik.
- **Dashboard** z naciskiem na dane: heatmapa snu, przewidywanie drzemki, korelacje,
  porównania tygodni, eksport PDF/CSV dla pediatry.
- **Stylistyka:** kierunek "Bąbelki" — pastelowa mięta + lawenda + róż, miękkie okrągłe
  kształty, bobas w bąbelku. Motyw wg płci (róż/błękit) + neutralny miętowy (domyślny),
  każdy z trybem nocnym. Mobile-first, skaluje się na desktop.
- **Język:** tylko polski na start.
- **RODO:** nie wdrażamy teraz, ale zostawiamy miejsce (eksport/usuwanie danych, strony prawne).

## Decyzje techniczne

- **Frontend:** React + Vite + Tailwind, statyczna PWA (offline, "ostatni zapis wygrywa").
- **Backend:** Supabase (auth: e-mail + Google + Apple; PostgreSQL + RLS dla rodzin;
  storage na zdjęcia; cron do maili). Frontend hostowany na home.pl (statyczny).
- **Maile:** SMTP ze skrzynki home.pl (np. powiadomienia@draftlab.pl).
- **Powiadomienia:** mail = standard, push (PWA) = opcja.
- Warstwa danych za interfejsem `src/data/store.js` — teraz localStorage,
  podmiana na Supabase bez przepisywania UI.

## Plan wydań

1. **v0.1 ✅ (2026-07-03):** szkielet UI Bąbelki, szybki wpis karmienie/sen/pielucha,
   timer snu, historia, zapis lokalny, motywy + tryb nocny.
2. **v0.2:** Supabase — konta, rodziny, zaproszenia, synchronizacja.
3. **v0.3:** waga + siatki centylowe WHO, dashboard statystyk (heatmapa snu itd.).
4. **v0.4:** kalendarz szczepień PSO + przypomnienia mail.
5. **v0.5:** zdjęcia, eksport PDF/CSV, kamienie milowe, tryb ciążowy, PWA offline sync.

Szczegółowe checklisty, schema SQL, konwencje i decyzje techniczne → **ROADMAP.md**

## Uruchamianie

```bash
cd bobolog && npm install && npm run dev   # dev
npm run build                              # dist/ → wgrać na subdomenę
```
