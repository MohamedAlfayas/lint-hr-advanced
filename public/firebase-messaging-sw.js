importScripts('https://www.gstatic.com/firebasejs/8.10.1/firebase-app.js');
importScripts('https://www.gstatic.com/firebasejs/8.10.1/firebase-messaging.js');

// Initialize the Firebase app in the service worker by passing in
// your app's Firebase config object.
// https://firebase.google.com/docs/web/setup#config-object
firebase.initializeApp({
    apiKey: "AIzaSyAlDNEycMJHybHCVJ0doCfFmDi3QoXnC80",
    authDomain: "linthrdev.firebaseapp.com",
    projectId: "linthrdev",
    storageBucket: "linthrdev.appspot.com",
    messagingSenderId: "580310805054",
    appId: "1:580310805054:web:29f658af55f6e37b663f6f",
    measurementId: "G-3PYFN7BHYW"
});

// Retrieve an instance of Firebase Messaging so that it can handle background
// messages.
const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
    console.log(
        '[firebase-messaging-sw.js] Received background message ',
        payload
    );

    // Check if this notification has already been displayed in another tab
    broadcastChannel.postMessage({ type: 'notification', payload });

    // Customize notification here
    const notificationTitle = payload.data.title
    const notificationOptions = {
        body: payload.data.body,
        icon: !!(payload?.data?.image) ? payload?.data?.image : "/logo-sm.png"
    };

    self.registration.showNotification(notificationTitle, notificationOptions);
});


// Listen for messages from other service worker instances
broadcastChannel.onmessage = (event) => {
    if (event.data && event.data.type === 'notification') {
        // Prevent showing the notification in this instance if it's already shown in another instance
        self.registration.getNotifications().then(notifications => {
            if (!notifications.some(notification => notification.data.id === event.data.payload.data.id)) {
                self.registration.showNotification(event.data.payload.data.title, {
                    body: event.data.payload.data.body,
                    icon: event.data.payload.data.icon
                });
            }
        });
    }
};