import { useEffect, useState } from 'react';
import { supabase } from '../data/supabase.js';
import { useApp } from '../contexts/AppContext.jsx';
import Logo from '../components/Logo.jsx';

export default function JoinFamilyScreen({ token }) {
    const { loadFamily, signOut } = useApp();
    const [invitation, setInvitation] = useState(null);
    const [status, setStatus] = useState('loading'); // loading | ready | joining | error | done
    const [error, setError] = useState('');

    useEffect(() => {
        (async () => {
            const { data, error } = await supabase
                .from('invitations')
                .select('*, families(name)')
                .eq('token', token)
                .is('used_at', null)
                .gt('expires_at', new Date().toISOString())
                .single();
            if (error || !data) { setStatus('error'); setError('Link jest nieważny lub już wygasł.'); return; }
            setInvitation(data);
            setStatus('ready');
        })();
    }, [token]);

    async function join() {
        setStatus('joining');
        const { data: { user } } = await supabase.auth.getUser();
        const { error: memErr } = await supabase.from('family_members').upsert({
            family_id: invitation.family_id,
            user_id: user.id,
            role: invitation.role,
            invited_by: invitation.created_by,
        }, { onConflict: 'family_id,user_id' });

        if (memErr) { setStatus('error'); setError('Nie udało się dołączyć do rodziny.'); return; }

        await supabase.from('invitations').update({ used_at: new Date().toISOString(), used_by: user.id }).eq('id', invitation.id);

        // Wyczyść token z URL i sessionStorage
        sessionStorage.removeItem('bobolog.pendingInvite');
        window.history.replaceState({}, '', window.location.pathname);
        await loadFamily();
        setStatus('done');
    }

    return (
        <div className="min-h-screen flex flex-col items-center justify-center px-5 py-12">
            <div className="w-full max-w-sm space-y-6 text-center">
                <div className="flex justify-center"><Logo size={56} /></div>

                {(status === 'loading' || status === 'done') && <p className="text-bb-muted font-semibold">Chwileczkę…</p>}

                {status === 'ready' && (
                    <>
                        <h1 className="font-display text-xl font-bold">Masz zaproszenie!</h1>
                        <div className="bg-bb-soft rounded-bubble p-5 space-y-1">
                            <p className="text-bb-muted text-sm">Dołącz do rodziny</p>
                            <p className="font-display text-2xl font-bold">{invitation.families?.name ?? 'BoboLab'}</p>
                        </div>
                        <button onClick={join} className="w-full py-3.5 rounded-bubble bg-bb-primary font-display font-semibold text-lg">
                            Dołącz do rodziny
                        </button>
                        <button onClick={signOut} className="w-full text-sm text-bb-muted hover:text-bb-text transition-colors">
                            Zaloguj się na inne konto
                        </button>
                    </>
                )}

                {status === 'joining' && <p className="text-bb-muted font-semibold">Dołączam…</p>}

                {status === 'error' && (
                    <>
                        <p className="text-red-500 font-semibold">{error}</p>
                        <a href="/" className="block w-full py-3.5 rounded-bubble bg-bb-primary font-display font-semibold text-lg">
                            Przejdź do BoboLab
                        </a>
                    </>
                )}
            </div>
        </div>
    );
}
