import { createSlice } from "@reduxjs/toolkit"

const initialState = {
    showLoader : false
}

const LoaderReducer = createSlice({
    name : 'LoaderReducer',
    initialState,
    reducers : {
        setLoaderVisible : (state, {type, payload}) =>{
            return {
                ...state,
                showLoader : payload
            }
        }
    }
});

export const { setLoaderVisible } = LoaderReducer.actions;

export default LoaderReducer.reducer;