import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.acupress.app',
  appName: 'AcuPress',
  webDir: '../frontend/build',
  server: {
    androidScheme: 'https'
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: "#059669",
      showSpinner: true,
      spinnerColor: "#ffffff"
    }
  }
};

export default config;