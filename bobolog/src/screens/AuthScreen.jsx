import { useState } from 'react';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { supabase } from '../data/supabase.js';
import Logo from '../components/Logo.jsx';

function Input({ icon: Icon, type, placeholder, value, onChange, showToggle, onToggle, show }) {
    return (
        <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-bb-muted"><Icon size={18} /></span>
            <input
                type={showToggle ? (show ? 'text' : 'password') : type}
                placeholder={placeholder}
                value={value}
                onChange={onChange}
                className="w-full pl-11 pr-11 py-3.5 rounded-2xl border-2 border-bb-border bg-bb-card outline-none focus:border-bb-text/30 font-body text-bb-text placeholder:text-bb-muted"
            />
            {showToggle && (
                <button type="button" onClick={onToggle} className="absolute right-4 top-1/2 -translate-y-1/2 text-bb-muted">
                    {show ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
            )}
        </div>
    );
}

// Włącz po skonfigurowaniu providerów w Supabase (Authentication → Providers)
// Wymagania: Google Cloud Console (OAuth Client ID) / Apple Developer Program
const OAUTH_ENABLED = false;

export default function AuthScreen({ inviteToken }) {
    const [tab, setTab] = useState('login');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPwd, setShowPwd] = useState(false);
    const [error, setError] = useState('');
    const [info, setInfo] = useState('');
    const [loading, setLoading] = useState(false);

    const reset = () => { setError(''); setInfo(''); };

    async function handleLogin(e) {
        e.preventDefault(); reset(); setLoading(true);
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) setError('Nieprawidłowy e-mail lub hasło.');
        setLoading(false);
    }

    async function handleRegister(e) {
        e.preventDefault(); reset(); setLoading(true);
        const base = `${window.location.origin}${window.location.pathname}`;
        const emailRedirectTo = inviteToken ? `${base}?invite=${inviteToken}` : base;
        const { error } = await supabase.auth.signUp({ email, password, options: { emailRedirectTo } });
        if (error) setError(error.message);
        else setInfo('Sprawdź skrzynkę e-mail i kliknij link aktywacyjny.');
        setLoading(false);
    }

    async function handleReset(e) {
        e.preventDefault(); reset(); setLoading(true);
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: `${window.location.origin}/?reset=1`
        });
        if (error) setError(error.message);
        else setInfo('Link do resetowania hasła wysłany na podany adres.');
        setLoading(false);
    }

    async function handleOAuth(provider) {
        reset();
        const redirectTo = `${window.location.origin}${window.location.pathname}`;
        const { error } = await supabase.auth.signInWithOAuth({ provider, options: { redirectTo } });
        if (error) setError(`Logowanie przez ${provider === 'google' ? 'Google' : 'Apple'} jest chwilowo niedostępne.`);
    }

    return (
        <div className="min-h-screen flex flex-col items-center justify-center px-5 py-12">
            <div className="w-full max-w-sm space-y-6">

                <div className="text-center space-y-2">
                    <div className="flex justify-center"><Logo size={56} /></div>
                    <h1 className="font-display text-2xl font-bold">BoboLab</h1>
                    <p className="text-bb-muted text-sm">Pastelowy dziennik rodzica</p>
                </div>

                {/* OAuth – ukryte do czasu konfiguracji providerów w Supabase */}
                {OAUTH_ENABLED && (
                    <>
                        <div className="space-y-2">
                            <button onClick={() => handleOAuth('google')}
                                className="w-full py-3 rounded-2xl border-2 border-bb-border bg-bb-card font-semibold flex items-center justify-center gap-2 hover:border-bb-text/20 transition-colors">
                                <svg width="18" height="18" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
                                Kontynuuj przez Google
                            </button>
                            <button onClick={() => handleOAuth('apple')}
                                className="w-full py-3 rounded-2xl border-2 border-bb-border bg-bb-card font-semibold flex items-center justify-center gap-2 hover:border-bb-text/20 transition-colors">
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/></svg>
                                Kontynuuj przez Apple
                            </button>
                        </div>

                        <div className="flex items-center gap-3 text-bb-muted text-sm font-semibold">
                            <span className="flex-1 border-t border-bb-border" />lub przez e-mail<span className="flex-1 border-t border-bb-border" />
                        </div>
                    </>
                )}

                {/* Tabs */}
                <div className="flex bg-bb-soft rounded-2xl p-1">
                    {[['login','Zaloguj'],['register','Zarejestruj']].map(([id, label]) => (
                        <button key={id} onClick={() => { setTab(id); reset(); }}
                            className={`flex-1 py-2 rounded-xl font-semibold text-sm transition-colors ${tab === id ? 'bg-bb-card text-bb-text' : 'text-bb-muted'}`}>
                            {label}
                        </button>
                    ))}
                </div>

                {inviteToken && (
                    <div className="bg-bb-primary rounded-2xl px-4 py-3 text-sm font-semibold text-center">
                        Masz zaproszenie do rodziny – zaloguj się lub utwórz konto, aby dołączyć.
                    </div>
                )}

                {error && <p className="text-red-500 text-sm font-semibold text-center">{error}</p>}
                {info && <p className="text-green-600 text-sm font-semibold text-center">{info}</p>}

                {tab !== 'reset' && (
                    <form onSubmit={tab === 'login' ? handleLogin : handleRegister} className="space-y-3">
                        <Input icon={Mail} type="email" placeholder="adres@email.com" value={email} onChange={e => setEmail(e.target.value)} />
                        <Input icon={Lock} showToggle show={showPwd} onToggle={() => setShowPwd(p => !p)} placeholder="hasło" value={password} onChange={e => setPassword(e.target.value)} />
                        <button type="submit" disabled={loading}
                            className="w-full py-3.5 rounded-bubble bg-bb-primary font-display font-semibold text-lg disabled:opacity-60">
                            {loading ? 'Chwilka…' : tab === 'login' ? 'Zaloguj się' : 'Utwórz konto'}
                        </button>
                        {tab === 'login' && (
                            <button type="button" onClick={() => { setTab('reset'); reset(); }}
                                className="w-full text-center text-sm text-bb-muted hover:text-bb-text transition-colors">
                                Zapomniałeś hasła?
                            </button>
                        )}
                    </form>
                )}

                {tab === 'reset' && (
                    <form onSubmit={handleReset} className="space-y-3">
                        <Input icon={Mail} type="email" placeholder="adres@email.com" value={email} onChange={e => setEmail(e.target.value)} />
                        <button type="submit" disabled={loading}
                            className="w-full py-3.5 rounded-bubble bg-bb-primary font-display font-semibold text-lg disabled:opacity-60">
                            {loading ? 'Wysyłam…' : 'Wyślij link resetowania'}
                        </button>
                        <button type="button" onClick={() => { setTab('login'); reset(); }}
                            className="w-full text-center text-sm text-bb-muted hover:text-bb-text transition-colors">
                            ← Wróć do logowania
                        </button>
                    </form>
                )}

                <p className="text-center text-xs text-bb-muted pt-2">
                    powered by <a href="https://draftlab.pl" className="underline">draftlab.pl</a>
                </p>
            </div>
        </div>
    );
}
