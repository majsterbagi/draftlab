// Polski Program Szczepień Ochronnych 2024
// offsetDays = liczba dni od daty urodzenia
// required: true = obowiązkowe, false = zalecane

export const PSO_VACCINES = [
    // --- Urodzenie ---
    {
        id: 'hbv-0', name: 'WZW B (dawka 0)', shortName: 'WZW B',
        offsetDays: 0, required: true,
        description: 'Pierwsza dawka przeciw wirusowemu zapaleniu wątroby typu B. Podawana w ciągu 24h od urodzenia.',
    },
    {
        id: 'bcg', name: 'Gruźlica (BCG)', shortName: 'BCG',
        offsetDays: 1, required: true,
        description: 'Szczepionka przeciw gruźlicy. Podawana do 24h od urodzenia, najpóźniej przed wypisem ze szpitala.',
    },

    // --- 6 tygodni ---
    {
        id: 'hbv-1', name: 'WZW B (dawka 1)', shortName: 'WZW B',
        offsetDays: 42, required: true,
        description: 'Druga dawka szczepionki przeciw WZW B.',
    },

    // --- 2 miesiące ---
    {
        id: 'dtap-1', name: 'DTPa+IPV+Hib (dawka 1)', shortName: 'DTPa',
        offsetDays: 56, required: true,
        description: 'Szczepionka skojarzona: błonica, tężec, krztusiec, polio, Hib. Pierwsza z serii trzech dawek.',
    },
    {
        id: 'pcv-1', name: 'Pneumokoki PCV (dawka 1)', shortName: 'PCV',
        offsetDays: 56, required: true,
        description: 'Szczepionka przeciw pneumokokom. Chroní przed zapaleniem płuc, opon mózgowych i sepsą.',
    },
    {
        id: 'rv-1', name: 'Rotawirusy (dawka 1)', shortName: 'RV',
        offsetDays: 56, required: false,
        description: 'Zalecana szczepionka doustna przeciw rotawirusom (główna przyczyna biegunek u niemowląt).',
    },

    // --- 3–4 miesiące ---
    {
        id: 'dtap-2', name: 'DTPa+IPV+Hib (dawka 2)', shortName: 'DTPa',
        offsetDays: 105, required: true,
        description: 'Druga dawka szczepionki skojarzonej DTPa+IPV+Hib.',
    },
    {
        id: 'pcv-2', name: 'Pneumokoki PCV (dawka 2)', shortName: 'PCV',
        offsetDays: 105, required: true,
        description: 'Druga dawka szczepionki przeciw pneumokokom.',
    },
    {
        id: 'rv-2', name: 'Rotawirusy (dawka 2)', shortName: 'RV',
        offsetDays: 105, required: false,
        description: 'Druga dawka doustna przeciw rotawirusom.',
    },

    // --- 5–6 miesięcy ---
    {
        id: 'dtap-3', name: 'DTPa+IPV+Hib (dawka 3)', shortName: 'DTPa',
        offsetDays: 154, required: true,
        description: 'Trzecia dawka szczepionki skojarzonej DTPa+IPV+Hib.',
    },
    {
        id: 'rv-3', name: 'Rotawirusy (dawka 3)', shortName: 'RV',
        offsetDays: 154, required: false,
        description: 'Trzecia (ostatnia) dawka doustna przeciw rotawirusom.',
    },

    // --- 6 miesięcy ---
    {
        id: 'hbv-2', name: 'WZW B (dawka 2)', shortName: 'WZW B',
        offsetDays: 182, required: true,
        description: 'Trzecia i ostatnia dawka szczepionki przeciw WZW B.',
    },
    {
        id: 'flu-1', name: 'Grypa (sezon 1)', shortName: 'Grypa',
        offsetDays: 182, required: false,
        description: 'Zalecane coroczne szczepienie przeciw grypie od 6. miesiąca życia.',
    },

    // --- 12–13 miesięcy ---
    {
        id: 'mmr-1', name: 'MMR (dawka 1) — odra, świnka, różyczka', shortName: 'MMR',
        offsetDays: 365, required: true,
        description: 'Szczepionka skojarzona MMR. Pierwsza dawka po ukończeniu 12 miesiąca życia.',
    },
    {
        id: 'pcv-b', name: 'Pneumokoki PCV (dawka przypominająca)', shortName: 'PCV',
        offsetDays: 365, required: true,
        description: 'Dawka przypominająca szczepionki przeciw pneumokokom.',
    },
    {
        id: 'vzv-1', name: 'Ospa wietrzna (dawka 1)', shortName: 'VZV',
        offsetDays: 365, required: false,
        description: 'Zalecana szczepionka przeciw ospie wietrznej.',
    },
    {
        id: 'men-c', name: 'Meningokoki C', shortName: 'MenC',
        offsetDays: 365, required: false,
        description: 'Zalecana szczepionka przeciw meningokokom grupy C.',
    },

    // --- 16–18 miesięcy ---
    {
        id: 'dtap-b', name: 'DTPa+IPV+Hib (dawka przypominająca)', shortName: 'DTPa',
        offsetDays: 510, required: true,
        description: 'Dawka przypominająca szczepionki skojarzonej DTPa+IPV+Hib.',
    },
    {
        id: 'vzv-2', name: 'Ospa wietrzna (dawka 2)', shortName: 'VZV',
        offsetDays: 552, required: false,
        description: 'Druga dawka szczepionki przeciw ospie wietrznej (min. 6 tygodni po dawce 1).',
    },
];

// Tylko szczepienia w pierwszych 3 latach (≤1095 dni) — do użycia w generatorze
export const PSO_FIRST_3_YEARS = PSO_VACCINES.filter(v => v.offsetDays <= 1095);

export function addDays(dateStr, days) {
    const d = new Date(dateStr);
    d.setDate(d.getDate() + days);
    return d.toISOString().slice(0, 10);
}
