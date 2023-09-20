import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    showRSB : false
};


const RightSideBarReducer = createSlice({
    name : 'RightSideBarReducer',
    initialState,
    reducers : {
        toggleRSBView : (state, action) =>{
            console.log("TOGGLEEE RSB = ",action.payload);
            state.showRSB = action.payload
        }
    }
});

export const { toggleRSBView } = RightSideBarReducer.actions;

export default RightSideBarReducer.reducer;

