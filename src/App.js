import React from 'react';

//import Scss
import './assets/scss/themes.scss';

//theme
import "primereact/resources/themes/lara-light-indigo/theme.css";

//core
import "primereact/resources/primereact.min.css";
import { ToastContainer, toast } from 'react-toastify';


//imoprt Route
import Route from './routes';

//imoprt Css @Elan
import './App.css';


// Import Firebase Configuration file
// import { initFirebaseBackend } from "./helpers/firebase_helper";

// const firebaseConfig = {
//   apiKey: process.env.REACT_APP_APIKEY,
//   authDomain: process.env.REACT_APP_AUTHDOMAIN,
//   databaseURL: process.env.REACT_APP_DATABASEURL,
//   projectId: process.env.REACT_APP_PROJECTID,
//   storageBucket: process.env.REACT_APP_STORAGEBUCKET,
//   messagingSenderId: process.env.REACT_APP_MESSAGINGSENDERID,
//   appId: process.env.REACT_APP_APPID,
//   measurementId: process.env.REACT_APP_MEASUREMENTID,
// };

// // init firebase backend
// initFirebaseBackend(firebaseConfig);

function App() {
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
        progressStyle={{height:'2px'}}
      />
    </React.Fragment>
  );
}

export default App;
