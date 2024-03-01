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
    // Customize notification here
    const notificationTitle = payload.notification.title
    const notificationOptions = {
        body: payload.notification.body,
        icon: '/logo-sm.png'
    };

    self.registration.showNotification(notificationTitle, notificationOptions);
});