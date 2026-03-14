import { useState, useEffect } from 'react';
import { useAccount, useDisconnect } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { WagmiProvider } from 'wagmi';
import { RainbowKitProvider } from '@rainbow-me/rainbowkit';
import '@rainbow-me/rainbowkit/styles.css';
import { config as rainbowConfig } from './lib/web3Config';
import { SolanaWalletProvider } from './lib/solanaConfig.tsx';
import TipPageLoader from './components/TipPageLoader';
import HomePage from './components/HomePage';
import ProfileCreation from './components/ProfileCreation';
import ProfileView from './components/ProfileView';
import SignInPage from './components/SignInPage';
import { UserProfile } from './components/ProfileCreation';
import BrandPage from './components/BrandPage';
import GettingStartedPage from './components/GettingStartedPage';
import WalletSignInStep from './components/WalletSignInStep';
import { createProfile, updateProfile } from './lib/profileApi';
import { supabase } from './lib/supabase';

const queryClient = new QueryClient();

// secret brand page — no links from main site; access via /x-piri-brand
const BRAND_PATH = '/x-piri-brand';
const GETTING_STARTED_PATH = '/getting-started';

type Page = 'home' | 'create' | 'view' | 'signIn' | 'walletSignIn';

function AppContent() {
  const [currentPage, setCurrentPage] = useState<Page>('home');
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [pendingPreFillAddress, setPendingPreFillAddress] = useState<string | null>(null);
  const [hasSupabaseSession, setHasSupabaseSession] = useState<boolean | null>(null);
  const { address, isConnected } = useAccount();
  const { disconnect } = useDisconnect();

  const isSignedIn = isConnected || !!hasSupabaseSession;

  // process magic link (hash or query) + track supabase session
  useEffect(() => {
    if (!supabase) {
      setHasSupabaseSession(false);
      return;
    }
    const hash = window.location.hash;
    const search = window.location.search;
    const tokenSource = hash ? hash.substring(1) : search.substring(1);
    if (tokenSource) {
      const params = new URLSearchParams(tokenSource);
      const accessToken = params.get('access_token');
      const refreshToken = params.get('refresh_token');
      if (accessToken && refreshToken) {
        supabase.auth
          .setSession({ access_token: accessToken, refresh_token: refreshToken })
          .then(() => {
            window.history.replaceState(null, '', window.location.pathname);
          })
          .catch(console.error);
      }
    }
    supabase.auth.getSession().then(({ data: { session } }) => setHasSupabaseSession(!!session));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setHasSupabaseSession(!!session);
    });
    return () => subscription.unsubscribe();
  }, []);

  // load saved profile from localStorage on mount
  useEffect(() => {
    const path = window.location.pathname;
    if (!path.startsWith('/tip/')) {
      const saved = localStorage.getItem('piri-profile');
      if (saved) {
        try {
          setUserProfile(JSON.parse(saved));
        } catch (error) {
          console.error('Error loading profile:', error);
        }
      }
    }
  }, []);

  // when not signed in, show sign-in page (get started)
  useEffect(() => {
    if (hasSupabaseSession === null) return;
    if (!isSignedIn && (currentPage === 'home' || currentPage === 'create' || currentPage === 'view')) {
      setCurrentPage('signIn');
    }
  }, [isSignedIn, hasSupabaseSession, currentPage]);

  // when signed in (email/google): skip home if no profile — go straight to payment options
  useEffect(() => {
    if (!hasSupabaseSession) return;
    if (currentPage === 'signIn' || (currentPage === 'home' && !userProfile)) {
      setCurrentPage(userProfile ? 'home' : 'create');
    }
  }, [hasSupabaseSession, currentPage, userProfile]);

  // when wallet connects from sign-in: SIWE first, then profile creation
  useEffect(() => {
    if (!isConnected) return;
    if (currentPage === 'signIn') {
      setCurrentPage('walletSignIn');
    }
  }, [isConnected, currentPage]);

  const handleCreateProfile = () => {
    if (!isSignedIn) {
      setCurrentPage('signIn');
    } else {
      setCurrentPage('create');
    }
  };
  const handleViewProfile = () => {
    if (!isSignedIn) {
      setCurrentPage('signIn');
    } else {
      setCurrentPage('view');
    }
  };
  const handleBackToHome = () => {
    setCurrentPage('home');
  };

  const handleSignOut = async () => {
    if (supabase) await supabase.auth.signOut();
    disconnect();
    localStorage.removeItem('piri-profile');
    setUserProfile(null);
    setPendingPreFillAddress(null);
    setCurrentPage('signIn');
  };

  const handleSaveProfile = async (profile: UserProfile) => {
    const { id, ...profileData } = profile;
    try {
      let saved: UserProfile = profile;
      if (id) {
        await updateProfile(id, profileData);
      } else {
        const { id: newId } = await createProfile(profileData);
        saved = { ...profile, id: newId };
      }
      localStorage.setItem('piri-profile', JSON.stringify(saved));
      setUserProfile(saved);
      setPendingPreFillAddress(null);
      setCurrentPage('view');
    } catch (e) {
      console.error('Save failed:', e);
      // fallback: save to localStorage only (legacy behavior)
      localStorage.setItem('piri-profile', JSON.stringify(profile));
      setUserProfile(profile);
      setCurrentPage('view');
    }
  };

  return (
    <>
      {currentPage === 'signIn' && <SignInPage />}
      {currentPage === 'walletSignIn' && (
        <WalletSignInStep
          onSuccess={() => {
            if (address) setPendingPreFillAddress(address);
            setCurrentPage('create');
          }}
          onBack={() => setCurrentPage('signIn')}
        />
      )}
      {currentPage === 'home' && (
        <HomePage
          onCreateProfile={handleCreateProfile}
          onViewProfile={handleViewProfile}
          onSignOut={handleSignOut}
          hasProfile={!!userProfile}
        />
      )}
      {currentPage === 'create' && (
        <ProfileCreation
          onSave={handleSaveProfile}
          onSignOut={handleSignOut}
          initialProfile={
            pendingPreFillAddress
              ? {
                  ...(userProfile ?? {}),
                  ethereumAddress: pendingPreFillAddress,
                  baseAddress: pendingPreFillAddress,
                  solanaAddress: userProfile?.solanaAddress ?? '',
                } as UserProfile
              : userProfile
          }
        />
      )}
      {currentPage === 'view' && userProfile && (
        <ProfileView
          profile={userProfile}
          onBack={handleBackToHome}
          onEdit={handleCreateProfile}
          onSignOut={handleSignOut}
        />
      )}
    </>
  );
}

function App() {
  const path = window.location.pathname;

  if (path === BRAND_PATH) {
    return <BrandPage />;
  }
  if (path === GETTING_STARTED_PATH) {
    return <GettingStartedPage />;
  }

  const appContent = path.startsWith('/tip/') ? (
    <TipPageLoader segment={path.replace(/^\/tip\//, '').split('/')[0]} />
  ) : (
    <AppContent />
  );

  return (
    <QueryClientProvider client={queryClient}>
      <WagmiProvider config={rainbowConfig}>
        <RainbowKitProvider coolMode={false}>
          <SolanaWalletProvider>
            {appContent}
          </SolanaWalletProvider>
        </RainbowKitProvider>
      </WagmiProvider>
    </QueryClientProvider>
  );
}

export default App;
