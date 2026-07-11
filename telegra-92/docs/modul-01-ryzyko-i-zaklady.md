# Moduł 01: Ryzyko i zakłady — specyfikacja mechaniki

> Status: **zaprojektowany na papierze** (sesja 2026-07-11), do implementacji w Etapie 2.
> Wszystkie decyzje podjęte przez właściciela projektu; wartości liczbowe (stawki, mnożniki,
> czasy) to punkt startowy do strojenia po pierwszych testach na żywo.

## Sedno gry

Stawiasz żetony **w ciemno** — widzisz tylko kategorię i trudność pytania, nie jego treść.
Nagroda za odwagę i samoświadomość, nie tylko wiedzę. Przegrane stawki zasilają rosnący
na ekranie **Bank**, który pada w kulminacji każdego aktu.

## Ekonomia

- **Jedna waluta**: żetony = punkty = wynik końcowy. Startowa pula: **100 żetonów** (do strojenia).
- **Stawianie**: trzy stałe progi **10 / 25 / 50** + osobny dramatyczny przycisk **VA BANQUE**
  (cała pula). Progi rosną wraz z aktami (patrz dramaturgia).
- **Wygrana (hybryda)**: zwrot stawki + wygrana × waga trudności:
  łatwe **×1**, średnie **×1.5**, trudne **×2** (np. stawka 25 na trudne: dobra odpowiedź = +50, pula rośnie o 50).
- **Przegrana**: stawka przepada i **zasila Bank** widoczny cały czas na ekranie TV.
- **Bank**: kumuluje przegrane stawki aktu; pada w **Pytaniu o Bank** na końcu każdego
  z trzech aktów — zwycięzca zgarnia całość (remis = podział).
- **Bankructwo z ratunkiem**: gracz na zerze nie odpada — co pytanie dostaje "ostatnią
  szansę" (przymusowa stawka minimalna 10 finansowana przez bank gry), więc zawsze gra
  i zawsze może wrócić przez Pytanie o Bank.

## Przebieg rundy (pojedyncze pytanie)

1. **Zapowiedź**: ekran TV pokazuje kategorię + trudność (i jej wagę). Telefony: wybór stawki.
2. **Zakłady**: gracze stawiają w ciemno (limit czasu ~15 s). TV pokazuje kto już postawił
   (bez kwot!) — kwoty ujawniają się dopiero przy rozstrzygnięciu, z fanfarą przy VA BANQUE.
3. **Pytanie**: treść + interfejs odpowiedzi na telefonach (limit czasu zależny od typu).
4. **Rozstrzygnięcie**: poprawna odpowiedź, ujawnienie stawek, przepływ żetonów, aktualizacja
   Banku i tabeli. Moment dramaturgiczny — pauza przed ujawnieniem.

## Typy pytań (wszystkie w v1)

| Typ | Odpowiedź na telefonie | Uwagi |
|---|---|---|
| Zamknięte ABCD | 4 przyciski | fundament biblioteki treści |
| Szacowanie liczby | pole liczbowe / suwak | wygrywa najbliższy; idealne pod zakłady w ciemno |
| Prawda / fałsz | 2 przyciski | rozgrzewkowe, serie błyskawiczne |
| Uporządkuj | przeciąganie 4 elementów | najbardziej złożone UX — projekt ekranu wymaga uwagi |

## Dramaturgia: trzy akty (domyślnie 5 + 5 + 3 pytań, ≈25-30 min)

Host może zmieniać liczbę pytań w konfiguratorze sesji.

| | Akt I — Rozgrzewka | Akt II — Gra właściwa | Akt III — Finał |
|---|---|---|---|
| Pytań | 5 | 5 | 3 |
| Progi stawek | 10 / 25 / 50 | 20 / 50 / 100 | 40 / 100 / 200 |
| Wybór kategorii | **koło fortuny** (losowo — rytuał TV, nauka zasad) | **rotacyjnie**: kolejny gracz wybiera z 3 wylosowanych kategorii (gra pod siebie albo sabotuje) | **licytacja żetonami** o prawo wyboru kategorii |
| Wydarzenia specjalne | — | **runda sabotażu**: obstawiasz, czy wskazany gracz odpowie dobrze | — |
| Kulminacja | Pytanie o Bank I | Pytanie o Bank II | Pytanie o Bank III (finałowe) |

Eskalacja decyzyjności: od czystego losu, przez wybór, po licytację — im bliżej finału,
tym bardziej gra się ludźmi, nie pytaniami.

## Format graczy

Moduł działa w obu trybach platformy:
- **Indywidualnie**: każdy telefon = gracz z własną pulą.
- **Drużynowo**: pula wspólna drużyny; szczegóły podejmowania decyzji w drużynie
  (kapitan? głosowanie? konsensus stawki?) — **do zaprojektowania** (otwarte pytanie).

## Otwarte pytania (na kolejne sesje projektowe)

1. **Tryb drużynowy** — kto w drużynie stawia i odpowiada (kapitan rotacyjny / średnia głosów)?
2. **Runda sabotażu** — dokładny przebieg: kto kogo wskazuje, jakie stawki, co widzi ofiara?
3. **Licytacja w akcie III** — format (jawna po kolei / w ciemno jedna runda)? minimalne postąpienie?
4. **Pytanie o Bank** — jaki typ pytania (szacowanie wydaje się naturalne — zawsze wyłania zwycięzcę)? czy stawia się na nie dodatkowo?
5. **Czasy** — limity na zakład i odpowiedź per typ pytania (do strojenia na testach).
6. **Koniec modułu** — sam wynik, czy ceremonia zwycięzcy z podium?
