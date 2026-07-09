// Web Push — subskrypcja po stronie przeglądarki.
// Klucz publiczny VAPID w .env (VITE_VAPID_PUBLIC_KEY); prywatny tylko na serwerze (cron PHP).

import { supabase } from '../data/supabase.js';

const VAPID_PUBLIC_KEY = import.meta.env.VITE_VAPID_PUBLIC_KEY;

export function pushSupported() {
    return !!VAPID_PUBLIC_KEY && 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window;
}

function urlBase64ToUint8Array(base64) {
    const padding = '='.repeat((4 - (base64.length % 4)) % 4);
    const raw = atob((base64 + padding).replace(/-/g, '+').replace(/_/g, '/'));
    return Uint8Array.from([...raw].map(c => c.charCodeAt(0)));
}

async function getRegistration() {
    const reg = await navigator.serviceWorker.getRegistration();
    if (!reg) throw new Error('Service worker niezarejestrowany (PWA działa tylko w buildzie produkcyjnym)');
    return reg;
}

export async function isPushEnabled() {
    if (!pushSupported()) return false;
    const reg = await navigator.serviceWorker.getRegistration();
    return !!(await reg?.pushManager.getSubscription());
}

export async function enablePush(familyId) {
    if (!pushSupported()) throw new Error('Ta przeglądarka nie obsługuje powiadomień push');
    const perm = await Notification.requestPermission();
    if (perm !== 'granted') throw new Error('Brak zgody na powiadomienia');

    const reg = await getRegistration();
    const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
    });

    const json = sub.toJSON();
    const { data: { user } } = await supabase.auth.getUser();
    const { error } = await supabase.from('push_subscriptions').upsert({
        user_id: user.id,
        family_id: familyId,
        endpoint: sub.endpoint,
        p256dh: json.keys.p256dh,
        auth: json.keys.auth,
    }, { onConflict: 'endpoint' });
    if (error) { console.error('enablePush', error); throw new Error('Nie udało się zapisać subskrypcji'); }
    return true;
}

export async function disablePush() {
    const reg = await navigator.serviceWorker.getRegistration();
    const sub = await reg?.pushManager.getSubscription();
    if (!sub) return;
    await supabase.from('push_subscriptions').delete().eq('endpoint', sub.endpoint);
    await sub.unsubscribe();
}
