# Przewodnik: Git & GitHub dla DraftLab

Wprowadzenie systemu Git to przejście z "amatorskiego kopiowania folderów" na "profesjonalne wersjonowanie kodu".

## 1. Słowniczek (Co to jest?)
- **Git:** Twoja osobista "Maszyna Czasu". Pozwala zapisywać stan projektu w dowolnym momencie. Jeśli coś zepsujesz, jedno kliknięcie wystarczy, by wrócić do wersji sprzed godziny.
- **Commit:** "Migawka" (zdjęcie) projektu. Każdy commit ma swoją nazwę (np. "Naprawa logo") i opisuje, co się zmieniło.
- **GitHub:** Bezpieczny, "chmurowy" sejf na Twoje commity. Zamiast wysyłać pliki mailem, wysyłasz je na GitHub.

## 2. Dlaczego GitHub jest lepszy od backupu ZIP?
1. **Historia:** Widzisz dokładnie, co zmieniłeś w każdym pliku 3 miesiące temu.
2. **Bezpieczeństwo:** Jeśli Twój komputer padnie, cały kod ocalał na serwerach GitHub.
3. **Współpraca:** Możesz łatwo udostępnić projekt innym (lub mi, Twojemu AI), a my możemy dodawać kod bez psucia Twojej pracy.

## 3. Twoja pierwsza misja (Zrób to teraz!)
Zanim przejdziemy do komend, musisz mieć "miejsce w chmurze":
1. Wejdź na [github.com](https://github.com/) i załóż darmowe konto.
2. Zweryfikuj e-mail.
3. **Daj mi znać, jak będziesz gotowy.**

---
## 4. Codzienna Praca (Twoja nowa rutyna)

Wyobraź sobie, że Twój projekt to kolekcja dokumentów w biurze. Oto jak działają te trzy magiczne komendy:

1. **`git add .`** (Pakowanie do pudełka)
   - *Co to robi:* Mówisz Gitowi: "Te zmiany, które właśnie zrobiłem, są ważne. Chcę je przygotować do zapisu".
   - *Analogia:* WKŁADASZ dokumenty do pudełka.

2. **`git commit -m "opis zmian"`** (Opisanie i schowanie do szafy)
   - *Co to robi:* Tworzysz trwały punkt w historii na swoim komputerze. Musisz dodać krótki opis, np. `git commit -m "Poprawa koloru nagłówka"`.
   - *Analogia:* LAKIERUJESZ pudełko, podpisujesz je i chumasz do swojej lokalnej SZAFY.

3. **`git push`** (Wysyłka do sejfu w chmurze)
   - *Co to robi:* Kopiuje Twoje lokalne "szafy" na serwery GitHub. Od tego momentu Twój kod jest bezpieczny w chmurze.
   - *Analogia:* Wysyłasz pudełka KONWOJEM do bankowego sejfu (GitHub).

### Kompletna komenda "na koniec dnia":
```bash
git add .
git commit -m "Opis tego co zrobiłeś"
git push
```
---
## 5. Przycisk Paniki (Co robić, gdy coś się zepsuje?)

To jest największa zaleta Gita. Jeśli zepsujesz kod tak bardzo, że nie wiesz jak wrócić:

### Scenariusz A: Chcę cofnąć niezapisane zmiany (Reset)
Jeśli edytowałeś pliki, strona przestała działać, ale **nie zrobiłeś jeszcze commit**, wpisz:
```bash
git restore .
```
To usunie wszystkie niezapisane zmiany w śledzonych plikach. Przed wykonaniem sprawdź `git status`; nie używaj tej komendy, jeśli chcesz zachować lokalną pracę.

### Scenariusz B: Chcę wrócić do konkretnej wersji z przeszłości
Każdy commit ma swój identyfikator. Możesz podejrzeć historię:
```bash
git log --oneline
```
A potem wrócić do dowolnego punktu.

### Scenariusz C: "Skasowałem coś przez przypadek"
Dopóki Twój kod jest na GitHubie, jesteś bezpieczny. Nawet jeśli spalisz komputer, po prostu pobierasz kopię z chmury:
```bash
git clone https://github.com/majsterbagi/draftlab.git
```

---
*Pamiętaj: Git jest po to, żebyś mógł eksperymentować bez strachu!*
