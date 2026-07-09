import { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceDot } from 'recharts';
import {
    WHO_WEIGHT_GIRLS, WHO_WEIGHT_BOYS,
    WHO_HEIGHT_GIRLS, WHO_HEIGHT_BOYS,
    getAgeMonths, interpolate,
} from '../data/who_charts.js';

const METRICS = [
    { id: 'weight', label: 'Waga', unit: 'kg', field: 'weightKg' },
    { id: 'height', label: 'Wzrost', unit: 'cm', field: 'heightCm' },
];

function getWhoData(gender, metric) {
    if (metric === 'weight') return gender === 'boy' ? WHO_WEIGHT_BOYS : WHO_WEIGHT_GIRLS;
    return gender === 'boy' ? WHO_HEIGHT_BOYS : WHO_HEIGHT_GIRLS;
}

function buildChartData(gender, metric, ageMonths) {
    const dataset = getWhoData(gender, metric);
    const maxM = Math.min(Math.max(ageMonths + 3, 12), 24);
    const points = dataset.filter(d => d.m <= maxM);
    if (points[points.length - 1]?.m < maxM) {
        const extra = interpolate(dataset, maxM);
        if (extra) points.push(extra);
    }
    return points;
}

function ChartTooltip({ active, payload, label, unit }) {
    if (!active || !payload?.length) return null;
    return (
        <div className="bg-bb-card border-2 border-bb-border rounded-2xl px-3 py-2 text-xs shadow-lg space-y-0.5">
            <p className="font-bold">{label} mies.</p>
            {payload.map(p => (
                <p key={p.dataKey} className="font-semibold" style={{ color: p.color }}>
                    {p.name}: {Number(p.value).toFixed(1)} {unit}
                </p>
            ))}
        </div>
    );
}

export default function CentileChart({ measurements = [], gender = 'neutral', birthDate }) {
    const [metric, setMetric] = useState('weight');
    const ageMonths = getAgeMonths(birthDate) ?? 12;
    const m = METRICS.find(x => x.id === metric);
    const chartData = buildChartData(gender, metric, ageMonths);

    const dots = measurements
        .map(e => ({
            ageM: birthDate
                ? Math.round((new Date(e.at) - new Date(birthDate)) / (1000 * 60 * 60 * 24 * 30.44))
                : null,
            val: e.data?.[m.field],
        }))
        .filter(d => d.ageM != null && d.ageM >= 0 && d.val != null);

    return (
        <div className="space-y-3">
            <div className="flex bg-bb-soft rounded-2xl p-1">
                {METRICS.map(x => (
                    <button key={x.id} onClick={() => setMetric(x.id)}
                        className={`flex-1 py-2 rounded-xl text-sm font-semibold transition-colors
                            ${metric === x.id ? 'bg-bb-card text-bb-text' : 'text-bb-muted'}`}>
                        {x.label} ({x.unit})
                    </button>
                ))}
            </div>

            <div className="h-52">
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData} margin={{ top: 4, right: 8, bottom: 0, left: -16 }}>
                        <XAxis dataKey="m" tick={{ fontSize: 10 }} tickFormatter={v => `${v}m`} />
                        <YAxis tick={{ fontSize: 10 }} domain={['auto', 'auto']} />
                        <Tooltip content={<ChartTooltip unit={m.unit} />} />
                        <Line dataKey="p97" name="P97" stroke="var(--bb-border)"   strokeWidth={1} dot={false} strokeDasharray="4 2" />
                        <Line dataKey="p85" name="P85" stroke="var(--bb-muted)"    strokeWidth={1} dot={false} />
                        <Line dataKey="p50" name="P50" stroke="var(--bb-primary)"  strokeWidth={2.5} dot={false} />
                        <Line dataKey="p15" name="P15" stroke="var(--bb-muted)"    strokeWidth={1} dot={false} />
                        <Line dataKey="p3"  name="P3"  stroke="var(--bb-border)"   strokeWidth={1} dot={false} strokeDasharray="4 2" />
                        {dots.map((d, i) => (
                            <ReferenceDot key={i} x={d.ageM} y={d.val}
                                r={5} fill="var(--bb-text)" stroke="var(--bb-card)" strokeWidth={2} />
                        ))}
                    </LineChart>
                </ResponsiveContainer>
            </div>

            <div className="flex flex-wrap gap-3 text-xs font-semibold text-bb-muted justify-center">
                <span className="flex items-center gap-1.5"><span className="w-5 border-t-2 border-dashed border-bb-border" />P3 / P97</span>
                <span className="flex items-center gap-1.5"><span className="w-5 border-t border-bb-muted" />P15 / P85</span>
                <span className="flex items-center gap-1.5"><span className="w-5 border-t-2 border-bb-primary" />P50</span>
                <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-bb-text" />pomiar</span>
            </div>
        </div>
    );
}
