import { createSlice } from "@reduxjs/toolkit"

const initialState = {
    version : 0
}

const MetaReducer = createSlice({
    name : 'MetaReducer',
    initialState,
    reducers : {
        setVersion : (state, {type, payload}) =>{
            return {
                ...state,
                version : payload
            }
        }
    }
})

export const { setVersion } = MetaReducer.actions;
export default MetaReducer.reducer;