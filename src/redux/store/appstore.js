import { configureStore } from "@reduxjs/toolkit";
import { MainReducer } from "../reducers/ParentReducer/MainReducer";

const appstore = configureStore({
    reducer : MainReducer
});

export default appstore