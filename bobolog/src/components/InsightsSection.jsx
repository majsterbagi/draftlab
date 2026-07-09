import { useMemo } from 'react';
import { Milk, MoonStar, Sparkles, TrendingUp, TrendingDown, Cake } from 'lucide-react';
import { predictNextFeed, predictSleep, dayRhythm, weekSummary, feedSleepCorrelation, nextMonthiversary, fmtMinShort } from '../utils/insights.js';

function clockShort(ms) {
    return new Date(ms).toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' });
}

function PredictionChip({ Icon, label, value, sub, tile }) {
    return (
        <div className={`${tile} rounded-bubble p-3.5 flex items-center gap-3 min-w-0`}>
            <Icon size={20} className="shrink-0" aria-hidden="true" />
            <div className="min-w-0">
                <p className="text-xs font-semibold opacity-70 truncate">{label}</p>
                <p className="font-display font-bold leading-tight">{value}</p>
                {sub && <p className="text-[10px] opacity-60 truncate">{sub}</p>}
            </div>
        </div>
    );
}

function RhythmCard({ rhythm, now }) {
    const nowH = new Date(now).getHours();
    const maxFeeds = Math.max(...rhythm.hourly.map(h => h.feeds), 1);
    return (
        <div className="bg-bb-card rounded-bubble border-2 border-bb-border p-4 space-y-2">
            <div>
                <p className="text-sm font-semibold text-bb-muted">Rytm dnia <span className="font-normal">(ostatnie {rhythm.daysCovered} dni)</span></p>
                <p className="text-[10px] text-bb-muted mt-0.5">Każda kolumna = 1 godzina doby. Wyższy słupek = więcej snu o tej porze.</p>
            </div>
            <div className="flex items-end gap-[2px]" style={{ height: 44 }}>
                {rhythm.hourly.map(({ h, sleepPct, feeds }) => (
                    <div key={h} className="flex-1 flex flex-col justify-end gap-[2px] h-full relative">
                        <div className="rounded-sm bg-bb-accent" style={{ height: `${Math.max(sleepPct * 100, 4)}%`, opacity: 0.4 + sleepPct * 0.6 }} />
                        <div className="rounded-full bg-bb-primary mx-auto"
                            style={{ width: 4, height: 4, opacity: feeds ? 0.35 + (feeds / maxFeeds) * 0.65 : 0.12 }} />
                        {h === nowH && <div className="absolute -top-1 inset-x-0 flex justify-center"><span className="w-1 h-1 rounded-full bg-bb-text" /></div>}
                    </div>
                ))}
            </div>
            <div className="flex justify-between text-[9px] text-bb-muted font-semibold">
                <span>0</span><span>6</span><span>12</span><span>18</span><span>24</span>
            </div>
            <div className="flex items-center gap-3 text-[10px] text-bb-muted">
                <span className="flex items-center gap-1">
                    <span className="w-3 h-2 rounded-sm bg-bb-accent opacity-75 inline-block shrink-0" />
                    sen
                </span>
                <span className="flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-bb-primary opacity-75 inline-block shrink-0" />
                    karmienie
                </span>
                <span className="flex items-center gap-1 ml-auto">
                    <span className="w-1.5 h-1.5 rounded-full bg-bb-text inline-block shrink-0" />
                    teraz
                </span>
            </div>
            {rhythm.napWindows.length > 0 && (
                <p className="text-xs text-bb-muted">
                    Drzemki zwykle: <span className="font-semibold text-bb-text">
                        {rhythm.napWindows.map(w => `${w.fromH}–${w.toH}`).join(', ')}
                    </span>
                </p>
            )}
        </div>
    );
}

function WeekCard({ week }) {
    const items = [
        ['Sen', fmtMinShort(week.cur.sleepMin), week.delta.sleepMin],
        ['Karmienia', week.cur.feeds, week.delta.feeds],
        ['Pieluchy', week.cur.diapers, week.delta.diapers],
    ];
    return (
        <div className="bg-bb-card rounded-bubble border-2 border-bb-border p-4 space-y-3">
            <div>
                <p className="text-sm font-semibold text-bb-muted">Ostatnie 7 dni <span className="font-normal">vs poprzednie</span></p>
                <p className="text-[10px] text-bb-muted mt-0.5">Łączne wartości z tego tygodnia. Strzałka pokazuje zmianę względem poprzednich 7 dni.</p>
            </div>
            <div className="grid grid-cols-3 gap-2">
                {items.map(([label, value, delta]) => (
                    <div key={label} className="text-center">
                        <p className="font-display font-bold leading-tight">{value}</p>
                        <p className="text-[10px] text-bb-muted font-semibold">{label}</p>
                        {delta !== null && delta !== 0 ? (
                            <p className={`text-[10px] font-bold flex items-center justify-center gap-0.5 ${delta > 0 ? 'text-emerald-500' : 'text-rose-400'}`}>
                                {delta > 0 ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
                                {delta > 0 ? '+' : ''}{delta}%
                            </p>
                        ) : (
                            <p className="text-[10px] text-bb-muted">bez zmian</p>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}

export default function InsightsSection({ entries, activeChild, sleepStartedAt, now }) {
    const nowMs = new Date(now).getTime();
    const name = activeChild?.name || 'Bobo';

    const feed    = useMemo(() => predictNextFeed(entries, nowMs), [entries, nowMs]);
    const sleep   = useMemo(() => predictSleep(entries, sleepStartedAt, nowMs), [entries, sleepStartedAt, nowMs]);
    const rhythm  = useMemo(() => dayRhythm(entries, nowMs), [entries, nowMs]);
    const week    = useMemo(() => weekSummary(entries, nowMs), [entries, nowMs]);
    const corr    = useMemo(() => feedSleepCorrelation(entries, nowMs), [entries, nowMs]);
    const mversary = useMemo(() => nextMonthiversary(activeChild?.birth_date, new Date(nowMs)), [activeChild?.birth_date, nowMs]);

    if (!feed && !sleep && !rhythm && !week && !mversary) return null;

    return (
        <div className="space-y-3">
            {mversary && (
                <div className="bg-bb-accent2 rounded-bubble p-4 flex items-center gap-3">
                    <Cake size={22} className="shrink-0" aria-hidden="true" />
                    <p className="font-semibold text-sm">
                        {mversary.inDays === 0
                            ? <>Dziś {name} kończy <span className="font-display font-bold">{mversary.isBirthday ? `${mversary.years} ${mversary.years === 1 ? 'rok' : mversary.years < 5 ? 'lata' : 'lat'}` : `${mversary.months} mies.`}</span> 🎉</>
                            : <>Za {mversary.inDays} {mversary.inDays === 1 ? 'dzień' : 'dni'} {name} kończy {mversary.isBirthday ? `${mversary.years} ${mversary.years === 1 ? 'rok' : mversary.years < 5 ? 'lata' : 'lat'}` : `${mversary.months} mies.`}</>}
                    </p>
                </div>
            )}

            {(feed || sleep) && (
                <div className="grid grid-cols-2 gap-3">
                    {feed && (
                        <PredictionChip Icon={Milk} tile="bg-bb-primary"
                            label="Nast. karmienie"
                            value={feed.inMin > 0 ? `za ~${fmtMinShort(feed.inMin)}` : `ok. ${clockShort(feed.at)}`}
                            sub={`co ~${fmtMinShort(feed.gapMin)}`} />
                    )}
                    {sleep && (
                        <PredictionChip Icon={MoonStar} tile="bg-bb-accent"
                            label={sleep.kind === 'wake' ? 'Pobudka (est.)' : 'Nast. drzemka'}
                            value={sleep.inMin > 0 ? `za ~${fmtMinShort(sleep.inMin)}` : `ok. ${clockShort(sleep.at)}`}
                            sub={sleep.kind === 'wake' ? `śr. sesja ${fmtMinShort(sleep.medianMin)}` : `okno ~${fmtMinShort(sleep.medianMin)}`} />
                    )}
                </div>
            )}

            {rhythm && <RhythmCard rhythm={rhythm} now={nowMs} />}
            {week && <WeekCard week={week} />}

            {corr && (
                <div className="bg-bb-soft rounded-bubble p-4 flex items-start gap-3">
                    <Sparkles size={18} className="shrink-0 mt-0.5 text-bb-muted" aria-hidden="true" />
                    <p className="text-sm text-bb-muted">
                        <span className="font-semibold text-bb-text">Zauważona zależność:</span>{' '}
                        w dni z większą liczbą karmień {name} śpi zwykle{' '}
                        {corr.direction === 'more' ? 'dłużej' : 'krócej'}{' '}
                        <span className="text-xs">(r={corr.r}, {corr.days} dni)</span>
                    </p>
                </div>
            )}
        </div>
    );
}
