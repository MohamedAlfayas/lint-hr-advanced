import React from 'react';

//import Scss
import './assets/scss/themes.scss';

import { ToastContainer, toast } from 'react-toastify';


//imoprt Route
import Route from './routes';

//imoprt Css @Elan
import './App.css';


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
