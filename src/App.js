import React, { Suspense, useEffect } from 'react';

//import Scss
import './assets/scss/themes.scss';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Rsuite css
import 'rsuite/dist/rsuite-no-reset.min.css';


//imoprt Route
import Route from './routes';

//imoprt Css @Elan
import './App.css';
import { generateToken, messaging } from './firebase';
import { onMessage } from 'firebase/messaging';

function App() {



  useEffect(() => {
    generateToken();
    onMessage(messaging, (payload) => {
      const notificationTitle = payload.data.title;
      const notificationOptions = {
        body: payload.data.body,
        icon: !!(payload?.data?.image) ? payload?.data?.image : "/logo-sm.png"
      };
      if (!document.hidden) {
        // If tab is focused, show the notification immediately
        new Notification(notificationTitle, notificationOptions);
      }
    });
  }, [])

  return (
    <React.Fragment>
      <Route />
      <ToastContainer
        position="bottom-left"
        autoClose={2000}
        hideProgressBar={false}
        newestOnTop={true}
        closeOnClick={true}
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover={false}
        theme="light"
        progressStyle={{ height: '2px' }}
      />
    </React.Fragment>
  );
}

export default App;
