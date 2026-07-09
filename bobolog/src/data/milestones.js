// Kamienie milowe wg WHO/CDC (wiek w tygodniach)

export const MILESTONES = [
    // 1 miesiąc
    { id: 'm01', weekMin: 0,  weekMax: 6,  category: 'ruch',      label: 'Unosi głowę na brzuchu' },
    { id: 'm02', weekMin: 0,  weekMax: 6,  category: 'wzrok',     label: 'Śledzi wzrokiem poruszający się obiekt' },
    { id: 'm03', weekMin: 0,  weekMax: 8,  category: 'kontakt',   label: 'Reaguje na głos rodzica' },
    // 2 miesiące
    { id: 'm04', weekMin: 6,  weekMax: 10, category: 'kontakt',   label: 'Uśmiecha się do twarzy' },
    { id: 'm05', weekMin: 6,  weekMax: 12, category: 'komunikacja', label: 'Wydaje dźwięki (gruchanie)' },
    // 3–4 miesiące
    { id: 'm06', weekMin: 10, weekMax: 16, category: 'ruch',      label: 'Trzyma głowę stabilnie' },
    { id: 'm07', weekMin: 12, weekMax: 20, category: 'ruch',      label: 'Przewraca się z brzucha na plecy' },
    { id: 'm08', weekMin: 12, weekMax: 20, category: 'kontakt',   label: 'Śmieje się na głos' },
    // 6 miesięcy
    { id: 'm09', weekMin: 20, weekMax: 28, category: 'ruch',      label: 'Siedzi z podparciem' },
    { id: 'm10', weekMin: 20, weekMax: 28, category: 'jedzenie',  label: 'Gotowość do rozszerzania diety' },
    { id: 'm11', weekMin: 22, weekMax: 30, category: 'komunikacja', label: 'Reaguje na swoje imię' },
    // 9 miesięcy
    { id: 'm12', weekMin: 28, weekMax: 40, category: 'ruch',      label: 'Raczkuje lub pełza' },
    { id: 'm13', weekMin: 30, weekMax: 42, category: 'ruch',      label: 'Wstaje przytrzymując się mebli' },
    { id: 'm14', weekMin: 32, weekMax: 44, category: 'komunikacja', label: 'Mówi "mama" / "tata" (niezróżnicowane)' },
    // 12 miesięcy
    { id: 'm15', weekMin: 44, weekMax: 56, category: 'ruch',      label: 'Pierwsze samodzielne kroki' },
    { id: 'm16', weekMin: 44, weekMax: 60, category: 'komunikacja', label: 'Pierwsze słowo ze znaczeniem' },
    { id: 'm17', weekMin: 48, weekMax: 60, category: 'kontakt',   label: 'Naśladuje gesty (pa pa, kosi kosi)' },
    // 18 miesięcy
    { id: 'm18', weekMin: 60, weekMax: 80, category: 'komunikacja', label: 'Słownik 5–10 słów' },
    { id: 'm19', weekMin: 65, weekMax: 85, category: 'ruch',      label: 'Wchodzi po schodach z pomocą' },
    { id: 'm20', weekMin: 70, weekMax: 90, category: 'kontakt',   label: 'Wskazuje na obrazki w książce' },
    // 24 miesiące
    { id: 'm21', weekMin: 88,  weekMax: 104, category: 'komunikacja', label: 'Łączy dwa słowa w zdanie' },
    { id: 'm22', weekMin: 90,  weekMax: 108, category: 'ruch',       label: 'Biega stabilnie' },
    { id: 'm23', weekMin: 95,  weekMax: 110, category: 'kontakt',    label: 'Bawi się z innymi dziećmi' },
    // 36 miesięcy
    { id: 'm24', weekMin: 130, weekMax: 160, category: 'komunikacja', label: 'Mówi proste zdania (3+ słowa)' },
    { id: 'm25', weekMin: 135, weekMax: 165, category: 'ruch',       label: 'Jeździ na rowerku biegowym' },
    { id: 'm26', weekMin: 140, weekMax: 165, category: 'kontakt',    label: 'Rozumie zasady prostych zabaw' },
];

export const CATEGORIES = {
    ruch:         { label: 'Ruch',         color: '#86efac' },
    wzrok:        { label: 'Wzrok',        color: '#7dd3fc' },
    kontakt:      { label: 'Kontakt',      color: '#f9a8d4' },
    komunikacja:  { label: 'Komunikacja',  color: '#fcd34d' },
    jedzenie:     { label: 'Jedzenie',     color: '#c4b5fd' },
};
