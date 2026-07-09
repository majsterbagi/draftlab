import { useEffect, useState } from 'react';
import { Copy, Check, UserPlus, X } from 'lucide-react';
import { supabase } from '../data/supabase.js';
import { useApp } from '../contexts/AppContext.jsx';

const ROLE_LABELS = { admin: 'Admin (rodzic)', member: 'Opiekun' };

export default function InviteScreen({ onClose }) {
    const { family, members, isAdmin, loadFamily } = useApp();
    const [link, setLink] = useState('');
    const [copied, setCopied] = useState(false);
    const [loading, setLoading] = useState(false);

    useEffect(() => { generateLink(); }, []);

    async function generateLink() {
        setLoading(true);
        const raw = crypto.getRandomValues(new Uint8Array(24));
        const token = btoa(String.fromCharCode(...raw))
            .replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
        const { data: { user } } = await supabase.auth.getUser();
        const { error } = await supabase.from('invitations').insert({
            family_id: family.id, role: 'member', created_by: user.id, token,
        });
        if (!error) setLink(`${window.location.origin}${window.location.pathname}?invite=${token}`);
        else console.error('generateLink error:', error);
        setLoading(false);
    }

    async function copy() {
        await navigator.clipboard.writeText(link);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    }

    async function changeRole(userId, role) {
        await supabase.from('family_members').update({ role }).eq('user_id', userId).eq('family_id', family.id);
        loadFamily();
    }

    async function removeMember(userId) {
        if (!confirm('Usunąć tę osobę z rodziny?')) return;
        await supabase.from('family_members').delete().eq('user_id', userId).eq('family_id', family.id);
        loadFamily();
    }

    return (
        <div className="fixed inset-0 z-40 flex items-end sm:items-center sm:justify-center">
            <div className="absolute inset-0 bg-black/30" onClick={onClose} />
            <div className="relative w-full sm:max-w-md bg-bb-card rounded-t-bubble sm:rounded-bubble p-6 pb-8 shadow-xl max-h-[80vh] overflow-y-auto">
                <div className="flex items-center justify-between mb-5">
                    <h2 className="font-display text-xl font-semibold">Rodzina</h2>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-bb-soft"><X size={20} /></button>
                </div>

                {isAdmin && (
                    <div className="mb-6 space-y-3">
                        <p className="text-sm text-bb-muted font-semibold">Link zaproszenia <span className="font-normal">(ważny 7 dni)</span></p>
                        <div className="flex gap-2">
                            <input readOnly value={loading ? 'Generuję…' : link}
                                className="flex-1 px-3 py-2.5 rounded-2xl border-2 border-bb-border bg-bb-bg text-sm font-body truncate" />
                            <button onClick={copy} disabled={!link}
                                className="px-4 py-2.5 rounded-2xl border-2 border-bb-border bg-bb-card font-semibold flex items-center gap-1.5 text-sm disabled:opacity-40">
                                {copied ? <Check size={16} /> : <Copy size={16} />}
                                {copied ? 'Skopiowano' : 'Kopiuj'}
                            </button>
                        </div>
                        <p className="text-xs text-bb-muted">Wyślij ten link dowolnej osobie – po kliknięciu dołączy do Twojej rodziny.</p>
                    </div>
                )}

                <div className="space-y-2">
                    <p className="text-sm text-bb-muted font-semibold">Członkowie rodziny</p>
                    {members.map(m => (
                        <div key={m.user_id} className="flex items-center gap-3 bg-bb-soft rounded-2xl px-3 py-2.5">
                            <div className="w-9 h-9 rounded-full bg-bb-primary flex items-center justify-center font-bold text-sm shrink-0">
                                {(m.profiles?.display_name || m.profiles?.email || '?')[0].toUpperCase()}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="font-semibold text-sm truncate">{m.profiles?.display_name || m.profiles?.email || 'Użytkownik'}</p>
                                <p className="text-xs text-bb-muted">{ROLE_LABELS[m.role]}</p>
                            </div>
                            {isAdmin && (
                                <div className="flex gap-1">
                                    <select value={m.role} onChange={e => changeRole(m.user_id, e.target.value)}
                                        className="text-xs border border-bb-border rounded-xl px-2 py-1 bg-bb-card">
                                        <option value="admin">Admin</option>
                                        <option value="member">Opiekun</option>
                                    </select>
                                    <button onClick={() => removeMember(m.user_id)}
                                        className="p-1.5 rounded-xl text-bb-muted hover:text-red-500 hover:bg-red-50 transition-colors">
                                        <X size={14} />
                                    </button>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
