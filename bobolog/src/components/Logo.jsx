import { useId, useState, useEffect } from 'react';

export default function Logo({ size = 40 }) {
    const uid = useId().replace(/:/g, '');
    const clipId = `bbl${uid}`;
    const [onload, setOnload] = useState(true);

    useEffect(() => {
        // Usuń klasę intro po zakończeniu animacji (delay 0.35s + czas 0.65s + bufor)
        const t = setTimeout(() => setOnload(false), 1200);
        return () => clearTimeout(t);
    }, []);

    return (
        <div className={`bb-logo-wrap${onload ? ' bb-logo-onload' : ''}`}>
            <svg viewBox="0 0 52 70" width={size} height={size} aria-hidden="true">
                <defs>
                    <clipPath id={clipId}>
                        <rect x="10" y="25" width="32" height="41" rx="12" />
                    </clipPath>
                </defs>

                {/* Nipple dome */}
                <path d="M20 14 Q20 1 26 1 Q32 1 32 14"
                    fill="var(--bb-accent2)" stroke="var(--bb-text)" strokeWidth="2.2"
                    strokeLinecap="round" strokeLinejoin="round" />

                {/* Collar ring */}
                <rect x="17" y="12" width="18" height="7" rx="3.5"
                    fill="var(--bb-accent2)" stroke="var(--bb-text)" strokeWidth="2" />

                {/* Neck */}
                <path d="M19 19 L16 28 L36 28 L33 19 Z"
                    fill="var(--bb-card)" stroke="var(--bb-text)" strokeWidth="1.8"
                    strokeLinejoin="round" />

                {/* Bottle body */}
                <rect x="9" y="26" width="34" height="41" rx="13"
                    fill="var(--bb-card)" stroke="var(--bb-text)" strokeWidth="2.5" />

                {/* Liquid fill */}
                <rect x="9" y="47" width="34" height="21"
                    fill="var(--bb-primary)" clipPath={`url(#${clipId})`} />

                {/* Liquid surface shimmer */}
                <line x1="11" y1="47" x2="42" y2="47"
                    stroke="var(--bb-text)" strokeWidth="1" opacity="0.12"
                    clipPath={`url(#${clipId})`} />

                {/* Lab measurement ticks (right side) */}
                <line x1="39" y1="37" x2="43" y2="37"
                    stroke="var(--bb-text)" strokeWidth="1.8" strokeLinecap="round" opacity="0.4" />
                <line x1="39" y1="45" x2="43" y2="45"
                    stroke="var(--bb-text)" strokeWidth="1.8" strokeLinecap="round" opacity="0.4" />
                <line x1="39" y1="53" x2="43" y2="53"
                    stroke="var(--bb-text)" strokeWidth="1.8" strokeLinecap="round" opacity="0.4" />

                {/* Bubbles inside liquid */}
                <circle cx="20" cy="57" r="2.6" fill="white" opacity="0.45" />
                <circle cx="30" cy="61" r="1.8" fill="white" opacity="0.38" />
                <circle cx="26" cy="53" r="1.5" fill="white" opacity="0.32" />
            </svg>
        </div>
    );
}
