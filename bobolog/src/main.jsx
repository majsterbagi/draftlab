import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AppProvider, useApp } from './contexts/AppContext.jsx';
import App from './App.jsx';
import AuthScreen from './screens/AuthScreen.jsx';
import WelcomeScreen from './screens/WelcomeScreen.jsx';
import FamilySetupScreen from './screens/FamilySetupScreen.jsx';
import JoinFamilyScreen from './screens/JoinFamilyScreen.jsx';
import './index.css';
import { registerSW } from 'virtual:pwa-register';

registerSW({ immediate: true });

const queryClient = new QueryClient();

// Zapisz token do sessionStorage przy pierwszym otwarciu linku,
// żeby przeżył przekierowanie po potwierdzeniu e-mail.
const _urlToken = new URLSearchParams(window.location.search).get('invite');
if (_urlToken) sessionStorage.setItem('bobolog.pendingInvite', _urlToken);

function getInviteToken() {
    return new URLSearchParams(window.location.search).get('invite')
        || sessionStorage.getItem('bobolog.pendingInvite');
}

function Root() {
    const { session, family, isDemo, enterDemo } = useApp();
    const inviteToken = getInviteToken();
    const [showAuth, setShowAuth] = useState(false);

    if (isDemo) return <App />;

    // undefined = Supabase jeszcze sprawdza sesję
    if (session === undefined) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="w-10 h-10 rounded-full border-4 border-bb-primary border-t-transparent animate-spin" />
            </div>
        );
    }

    if (!session) {
        // Invite link → od razu AuthScreen, nie WelcomeScreen
        if (showAuth || inviteToken) return <AuthScreen inviteToken={inviteToken} />;
        return <WelcomeScreen onSignIn={() => setShowAuth(true)} onDemo={enterDemo} />;
    }

    if (inviteToken && !family) return <JoinFamilyScreen token={inviteToken} />;
    if (!family) return <FamilySetupScreen />;
    return <App />;
}

createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <QueryClientProvider client={queryClient}>
            <AppProvider>
                <Root />
            </AppProvider>
        </QueryClientProvider>
    </React.StrictMode>
);
