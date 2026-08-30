import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'cl.narbus.flota',
  appName: 'Narbus Flota',
  webDir: 'dist',
  server: {
    cleartext: true
  }
};

export default config;
