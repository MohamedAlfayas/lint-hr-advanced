// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getMessaging, getToken } from "firebase/messaging";


const firebaseConfig = {
    apiKey: "AIzaSyAlDNEycMJHybHCVJ0doCfFmDi3QoXnC80",
    authDomain: "linthrdev.firebaseapp.com",
    projectId: "linthrdev",
    storageBucket: "linthrdev.appspot.com",
    messagingSenderId: "580310805054",
    appId: "1:580310805054:web:29f658af55f6e37b663f6f",
    measurementId: "G-3PYFN7BHYW"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Cloud Messaging and get a reference to the service
export const messaging = getMessaging(app);

export const generateToken = async () => {
    let token = null
    try {
        const permission = await Notification.requestPermission();
        console.log("PERMISSION = ", permission);

        if (permission === 'granted') {
            token = await getToken(messaging, {
                vapidKey: "BK4db2cHjo2aQI2xvfpT--12e72Zxa_reGllCEigucJXchh5GUW77H7uStCyqka-VTwiHdMpWMElm6Y1GoD2LGY"
            });


        }
    } catch (error) {
        console.log("Generate token error - ", error);
    }

    console.log("FCM Token = ", token);

    return token

}
