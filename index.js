/**
 * @format
 */

import { AppRegistry } from 'react-native';
import App from './App';
import { name as appName } from './app.json';

// Background/quit-state push handler. This MUST be registered outside of any
// component, before AppRegistry.registerComponent, or Android logs
// "No task registered for key ReactNativeFirebaseMessagingHeadlessTask" and
// drops the message.
try {
  const messaging = require('@react-native-firebase/messaging').default;
  messaging().setBackgroundMessageHandler(async (remoteMessage) => {
    console.log('[FCM] Background message received:', remoteMessage?.messageId);
  });
} catch (e) {
  console.warn('[FCM] messaging module unavailable; background push disabled.');
}

AppRegistry.registerComponent(appName, () => App);
if (appName !== 'PulseChatApp') {
  AppRegistry.registerComponent('PulseChatApp', () => App);
}
if (appName !== 'AmrutamPharmaApp') {
  AppRegistry.registerComponent('AmrutamPharmaApp', () => App);
}
