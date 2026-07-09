// Ciekawostki o rozwoju płodu per tydzień ciąży (4–42).
// size = porównanie wielkości, fact = jedno zdanie o rozwoju.

export const PREGNANCY_WEEKS = {
    4:  { size: 'ziarnko maku',        fact: 'Zarodek zagnieżdża się w macicy — zaczyna się formować łożysko.' },
    5:  { size: 'ziarnko sezamu',      fact: 'Rurka nerwowa się zamyka — powstaje zawiązek mózgu i rdzenia.' },
    6:  { size: 'ziarnko soczewicy',   fact: 'Serduszko zaczyna bić — ok. 110 uderzeń na minutę!' },
    7:  { size: 'jagoda',              fact: 'Formują się zawiązki rączek i nóżek.' },
    8:  { size: 'malina',              fact: 'Pojawiają się paluszki, a twarz nabiera kształtu.' },
    9:  { size: 'wisienka',            fact: 'Wszystkie najważniejsze narządy już się uformowały.' },
    10: { size: 'truskawka',           fact: 'Koniec okresu zarodkowego — od teraz to oficjalnie płód.' },
    11: { size: 'figa',                fact: 'Maluch zaczyna się ruszać, choć jeszcze tego nie czujesz.' },
    12: { size: 'limonka',             fact: 'Odruchy już działają — potrafi zaciskać piąstki.' },
    13: { size: 'strąk grochu',        fact: 'Pojawiają się linie papilarne — unikalne odciski palców.' },
    14: { size: 'cytryna',             fact: 'Maluch robi minki: marszczy brwi i może ssać kciuk.' },
    15: { size: 'jabłko',              fact: 'Słyszy pierwsze dźwięki — bicie Twojego serca.' },
    16: { size: 'awokado',             fact: 'Oczy stają się wrażliwe na światło.' },
    17: { size: 'gruszka',             fact: 'Rozwija się tkanka tłuszczowa — zapas energii na start.' },
    18: { size: 'papryka',             fact: 'Możesz już poczuć pierwsze ruchy — jak motylki w brzuchu.' },
    19: { size: 'pomidor (duży)',      fact: 'Skórę pokrywa maź płodowa — naturalny krem ochronny.' },
    20: { size: 'banan',               fact: 'Półmetek! Maluch przełyka i trenuje układ pokarmowy.' },
    21: { size: 'marchewka',           fact: 'Rytm dnia: śpi i budzi się w regularnych cyklach.' },
    22: { size: 'papaja',              fact: 'Reaguje na dźwięki z zewnątrz — mów i śpiewaj do brzucha!' },
    23: { size: 'duże mango',          fact: 'Słuch jest już tak dobry, że rozpoznaje Twój głos.' },
    24: { size: 'kolba kukurydzy',     fact: 'Płuca zaczynają produkować surfaktant potrzebny do oddychania.' },
    25: { size: 'kalarepa',            fact: 'W dłoniach pojawia się odruch chwytania.' },
    26: { size: 'sałata lodowa',       fact: 'Otwiera oczka! Zaczyna też „oddychać" płynem owodniowym.' },
    27: { size: 'kalafior',            fact: 'Trzeci trymestr — mózg rośnie teraz najszybciej.' },
    28: { size: 'bakłażan',            fact: 'Śni! Pojawia się faza REM snu.' },
    29: { size: 'dynia piżmowa',       fact: 'Kości twardnieją — maluch potrzebuje dużo wapnia.' },
    30: { size: 'kapusta',             fact: 'Kopnięcia są coraz mocniejsze i bardziej wyczuwalne.' },
    31: { size: 'kokos',               fact: 'Wszystkie pięć zmysłów już działa.' },
    32: { size: 'jicama',              fact: 'Maluch najpewniej ułożył się już główką w dół.' },
    33: { size: 'ananas',              fact: 'Układ odpornościowy pobiera przeciwciała od mamy.' },
    34: { size: 'melon kantalupa',     fact: 'Paznokcie dorosły już do końców palców.' },
    35: { size: 'melon spadziowy',     fact: 'Nabiera ok. 30 g dziennie — rośnie jak na drożdżach.' },
    36: { size: 'papaja (duża)',       fact: 'Płuca są prawie gotowe do pierwszego oddechu.' },
    37: { size: 'główka sałaty rzymskiej', fact: 'Ciąża donoszona wcześnie — maluch szlifuje odruch ssania.' },
    38: { size: 'por',                 fact: 'Mózg i wątroba wciąż intensywnie dojrzewają.' },
    39: { size: 'mały arbuz',          fact: 'Pełna gotowość! Czekamy na sygnał startu.' },
    40: { size: 'arbuz',               fact: 'Termin! Ale spokojnie — tylko 5% dzieci rodzi się w wyznaczonym dniu.' },
    41: { size: 'arbuz (i to spory)',  fact: 'Maluch każe na siebie czekać — to zupełnie normalne.' },
    42: { size: 'arbuz XXL',           fact: 'Lekarze na pewno już czuwają — do zobaczenia lada moment!' },
};

// Najbliższa ciekawostka dla danego tygodnia (w dół).
export function weekInfo(week) {
    for (let w = Math.min(42, Math.max(4, week)); w >= 4; w--) {
        if (PREGNANCY_WEEKS[w]) return { week: w, ...PREGNANCY_WEEKS[w] };
    }
    return null;
}
