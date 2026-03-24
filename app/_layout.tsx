import { DarkTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack, Redirect } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useRef, useState } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import 'react-native-reanimated';
import { getDatabase } from '@/db/database';
import { useUserStore } from '@/stores/user-store';
import { useShelterStore } from '@/stores/shelter-store';
import { getDaysUntilDestruction } from '@/services/decay-service';
import { configureNotifications } from '@/services/notification-service';
import DestructionScene from '@/components/shelter/DestructionScene';
import RevivalModal from '@/components/shelter/RevivalModal';

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from 'expo-router';

export const unstable_settings = {
  // Ensure that reloading on `/modal` keeps a back button present.
  initialRouteName: '(tabs)',
};

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });
  const [dbReady, setDbReady] = useState(false);
  const isOnboarded = useUserStore((state) => state.isOnboarded);
  const loadUser = useUserStore((state) => state.loadUser);

  const checkDecay = useShelterStore((state) => state.checkDecay);
  const shelter = useShelterStore((state) => state.shelter);
  const user = useUserStore((state) => state.user);

  const [showDestruction, setShowDestruction] = useState(false);
  const [showRevival, setShowRevival] = useState(false);
  const [daysRemaining, setDaysRemaining] = useState(0);

  const appStateRef = useRef<AppStateStatus>(AppState.currentState);

  // Expo Router uses Error Boundaries to catch errors in the navigation tree.
  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    configureNotifications();
    getDatabase()
      .then(() => loadUser())
      .then(() => setDbReady(true))
      .catch((e) => {
        console.error('Failed to initialize database:', e);
        // Allow the app to proceed even if DB init fails to avoid infinite splash
        setDbReady(true);
      });
  }, []);

  useEffect(() => {
    if (loaded && dbReady) {
      SplashScreen.hideAsync();
    }
  }, [loaded, dbReady]);

  // Run decay check whenever shelter/user data is loaded
  useEffect(() => {
    if (shelter && user) {
      runDecayCheck();
    }
  }, [shelter?.id, user?.id]);

  // AppState listener: re-check decay when app comes to foreground
  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextState: AppStateStatus) => {
      if (
        appStateRef.current !== 'active' &&
        nextState === 'active'
      ) {
        runDecayCheck();
      }
      appStateRef.current = nextState;
    });

    return () => subscription.remove();
  }, []);

  const runDecayCheck = async () => {
    await checkDecay();

    const currentShelter = useShelterStore.getState().shelter;
    const currentUser = useUserStore.getState().user;

    if (!currentShelter || !currentUser) return;

    const stage = currentShelter.decay_stage;

    if (stage === 3) {
      setShowRevival(false);
      setShowDestruction(true);
      return;
    }

    if (stage === 2) {
      const lastCompleted = currentUser.last_quest_completed_at
        ? new Date(currentUser.last_quest_completed_at)
        : null;
      const days = getDaysUntilDestruction(lastCompleted, new Date());
      if (days <= 2) {
        setDaysRemaining(days);
        setShowRevival(true);
      }
    }
  };

  if (!loaded || !dbReady) {
    return null;
  }

  return (
    // Always use DarkTheme — Level-Up is a post-apocalyptic dark-themed app
    <ThemeProvider value={DarkTheme}>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="onboarding" options={{ headerShown: false }} />
        <Stack.Screen name="modal" options={{ presentation: 'modal' }} />
      </Stack>
      {!isOnboarded && <Redirect href="/onboarding" />}

      {/* Decay modals — rendered at root level so they appear over all tabs */}
      <DestructionScene visible={showDestruction} />
      <RevivalModal
        visible={showRevival}
        daysRemaining={daysRemaining}
        onDismiss={() => setShowRevival(false)}
        onRevived={() => setShowRevival(false)}
      />
    </ThemeProvider>
  );
}
