import { Milk, MoonStar, Droplets, ChartLine, Users } from 'lucide-react';
import Logo from '../components/Logo.jsx';

const FEATURES = [
    { Icon: Milk,      text: 'Karmienie pierś, butelka, posiłki' },
    { Icon: MoonStar,  text: 'Sen z timerem i statystykami' },
    { Icon: Droplets,  text: 'Pieluchy jednym dotknięciem' },
    { Icon: ChartLine, text: 'Wykresy i siatki centylowe WHO' },
    { Icon: Users,     text: 'Cała rodzina na jednym koncie' },
];

export default function WelcomeScreen({ onSignIn, onDemo }) {
    return (
        <div className="min-h-screen max-w-lg mx-auto flex flex-col px-6 pt-14 pb-10">
            <div className="flex flex-col items-center text-center gap-3 mb-10">
                <Logo size={72} />
                <h1 className="font-display text-4xl font-bold tracking-tight">BoboLab</h1>
                <p className="text-bb-muted font-semibold text-lg leading-snug max-w-xs">
                    Dziennik Twojego dziecka – karmienia, sny i pieluchy pod kontrolą.
                </p>
            </div>

            <ul className="space-y-3 mb-10">
                {FEATURES.map(({ Icon, text }) => (
                    <li key={text} className="flex items-center gap-3 bg-bb-card border-2 border-bb-border rounded-bubble px-4 py-3">
                        <span className="bg-bb-primary rounded-full p-2 shrink-0"><Icon size={18} aria-hidden="true" /></span>
                        <span className="font-semibold text-sm">{text}</span>
                    </li>
                ))}
            </ul>

            <div className="mt-auto space-y-3">
                <button
                    onClick={onSignIn}
                    className="w-full bg-bb-text text-bb-bg rounded-bubble py-4 font-display font-bold text-lg active:scale-95 transition-transform">
                    Zaloguj się / Zarejestruj
                </button>
                <button
                    onClick={onDemo}
                    className="w-full bg-bb-card border-2 border-bb-border rounded-bubble py-4 font-display font-semibold text-lg active:scale-95 transition-transform">
                    Wypróbuj demo
                </button>
                <p className="text-center text-xs text-bb-muted pt-1">
                    Demo działa bez rejestracji – dane nie są zapisywane.
                </p>
            </div>
        </div>
    );
}
