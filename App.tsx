import React from 'react';
import { StatusBar, StyleSheet, View } from 'react-native';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { store, persistor } from './src/store';
import { AppNavigator } from './src/navigation/AppNavigator';
import { linking } from './src/navigation/linking';
import { ThemeProvider, useColor } from './src/design-system/theme/ThemeProvider';
import { NetworkProvider } from './src/offline/NetworkProvider';
import { RootErrorBoundary } from './src/app/RootErrorBoundary';
import { Toast, showToast } from './src/design-system/components/Toast';
import { UpdateRequiredModal } from './src/design-system/components/UpdateRequiredModal';
import { BiometricPromptModal } from './src/design-system/components/BiometricPromptModal';
import { RemoteConfigService, UpdateCheckResult } from './src/shared/remoteConfig/RemoteConfigService';
import { setBiometricsEnabled } from './src/shared/patientProfile/patientProfileSlice';
import './src/i18n';
import i18n from 'i18next';
import { useAppDispatch, useAppSelector } from './src/store/hooks';

function AppContent() {
  const COLOR = useColor();
  const dispatch = useAppDispatch();
  const lang = useAppSelector((state) => state.patientProfile.language);
  const biometricsEnabled = useAppSelector((state) => state.patientProfile.biometricsEnabled);
  const [appUnlocked, setAppUnlocked] = React.useState(!biometricsEnabled);
  const [updateInfo, setUpdateInfo] = React.useState<UpdateCheckResult | null>(null);
  const [updateDismissed, setUpdateDismissed] = React.useState(false);

  React.useEffect(() => {
    if (lang && i18n.language !== lang) {
      i18n.changeLanguage(lang);
    }
  }, [lang]);

  const isLocked = biometricsEnabled && !appUnlocked;

  React.useEffect(() => {
    if (!isLocked) {
      RemoteConfigService.checkForUpdate().then(setUpdateInfo);
    }
  }, [isLocked]);

  return (
    <RootErrorBoundary>
      <StatusBar
        barStyle={COLOR.isDark ? 'light-content' : 'dark-content'}
        backgroundColor={COLOR.background}
        translucent={false}
      />
      {isLocked ? (
        <View style={[styles.lockScreen, { backgroundColor: COLOR.background }]}>
          <BiometricPromptModal
            visible
            title="Amrutam Vault Locked"
            subtitle="Authenticate to unlock your Ayurvedic health, consultation & pharmacy data"
            onSuccess={() => setAppUnlocked(true)}
            onCancel={() => {
              dispatch(setBiometricsEnabled(false));
              setAppUnlocked(true);
              showToast.info('Biometric Vault Lock disabled — re-enable it anytime from Profile.');
            }}
          />
        </View>
      ) : (
        <>
          <NavigationContainer linking={linking}>
            <AppNavigator />
          </NavigationContainer>
          {updateInfo?.updateAvailable && (
            <UpdateRequiredModal
              visible={!updateDismissed || updateInfo.forceUpdate}
              forceUpdate={updateInfo.forceUpdate}
              storeUrl={updateInfo.storeUrl}
              latestVersion={updateInfo.latestVersion}
              onLater={() => setUpdateDismissed(true)}
            />
          )}
        </>
      )}
      <Toast position="top" />
    </RootErrorBoundary>
  );
}

export default function App() {
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <SafeAreaProvider>
          <ThemeProvider>
            <NetworkProvider>
              <AppContent />
            </NetworkProvider>
          </ThemeProvider>
        </SafeAreaProvider>
      </PersistGate>
    </Provider>
  );
}

const styles = StyleSheet.create({
  lockScreen: {
    flex: 1,
  },
});
