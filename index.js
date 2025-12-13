
import 'react-native-gesture-handler'; // must be first import
import { AppRegistry } from 'react-native';
import App from './App';
import { name as appName } from './app.json';
import notifee, { EventType } from '@notifee/react-native';

// Register background handler for notifications
notifee.onBackgroundEvent(async ({ type, detail }) => {
    console.log('Background Event:', type, detail);

    if (type === EventType.PRESS) {
        console.log('User pressed notification in background');
        // The app will open and navigation will be handled in App.tsx
    }
});

AppRegistry.registerComponent(appName, () => App);
