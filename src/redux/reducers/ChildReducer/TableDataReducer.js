import { createSlice } from "@reduxjs/toolkit"

const initialState = {
    table_data: []
}


const TableDataReducer = createSlice({
    name: "TableDataReducer",
    initialState,
    reducers: {
        setTableDataReducer: (state, { type, payload }) => {
            return {
                ...state,
                table_data: payload
            }
        }
    }
});

export const { setTableDataReducer } = TableDataReducer.actions;
export default TableDataReducer.reducer;