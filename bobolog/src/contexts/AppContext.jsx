import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../data/supabase.js';

const AppContext = createContext(null);

const DEMO_FAMILY = { id: 'demo-family', name: 'Rodzina Demo', role: 'admin' };
const DEMO_CHILD  = { id: 'demo-child',  name: 'Maja', gender: 'girl' };

export function AppProvider({ children }) {
    const [session, setSession] = useState(undefined); // undefined = loading
    const [family, setFamily] = useState(null);
    const [familyChildren, setFamilyChildren] = useState([]);
    const [activeChild, setActiveChild] = useState(null);
    const [members, setMembers] = useState([]);
    const [isDemo, setIsDemo] = useState(false);

    // Auth state
    useEffect(() => {
        supabase.auth.getSession().then(({ data }) => setSession(data.session));
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, s) => setSession(s));
        return () => subscription.unsubscribe();
    }, []);

    // Load family when logged in
    useEffect(() => {
        if (!session) { setFamily(null); setFamilyChildren([]); setActiveChild(null); return; }
        loadFamily();
    }, [session]);

    async function loadFamily() {
        const { data: mem } = await supabase
            .from('family_members')
            .select('family_id, role, families(id, name)')
            .eq('user_id', session.user.id)
            .limit(1)
            .single();

        if (!mem) { setFamily(null); return; }

        setFamily({ id: mem.family_id, ...mem.families, role: mem.role });

        const { data: kids } = await supabase
            .from('children')
            .select('*')
            .eq('family_id', mem.family_id)
            .order('created_at');

        setFamilyChildren(kids || []);
        setActiveChild(prev => prev ? (kids?.find(k => k.id === prev.id) || kids?.[0]) : kids?.[0]);

        const { data: mems } = await supabase
            .from('family_members')
            .select('user_id, role, profiles(display_name, email)')
            .eq('family_id', mem.family_id);
        setMembers(mems || []);
    }

    async function signOut() {
        if (isDemo) { setIsDemo(false); return; }
        await supabase.auth.signOut();
    }

    const value = {
        session:        isDemo ? { user: { id: 'demo-user' } } : session,
        user:           isDemo ? { id: 'demo-user' }           : (session?.user ?? null),
        family:         isDemo ? DEMO_FAMILY                   : family,
        familyChildren: isDemo ? [DEMO_CHILD]                  : familyChildren,
        activeChild:    isDemo ? DEMO_CHILD                    : activeChild,
        setActiveChild: isDemo ? () => {}                      : setActiveChild,
        members:        isDemo ? []                            : members,
        loadFamily,
        signOut,
        isAdmin: isDemo ? true : family?.role === 'admin',
        isDemo,
        enterDemo: () => setIsDemo(true),
    };

    return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export const useApp = () => useContext(AppContext);
