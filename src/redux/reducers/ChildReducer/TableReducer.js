import { createSlice } from "@reduxjs/toolkit"

const initialState = {
    activeTableTab : null
}

const TableReducer = createSlice({
    name : 'TableReducer',
    initialState,
    reducers : {
        setActiveTableTab : (state, {type, payload}) =>{
            return {
                ...state,
                activeTableTab : payload
            }
        }
    }
})

export const { setActiveTableTab } = TableReducer.actions;
export default TableReducer.reducer;