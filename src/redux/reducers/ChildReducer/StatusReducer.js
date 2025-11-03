import { createSlice } from "@reduxjs/toolkit"

const initialState = {
    status_data: [],
   
}

const StatusReducer = createSlice({
    name: 'StatusReducer',
    initialState,
    reducers: {
        setStatus: (state, { type, payload }) => {
            return {
                ...state,
                status_data: payload
            }
        },
        addStatus: (state, action) => {
           
            return {
                ...state,
                status_data: [...state.status_data, action.payload]
            }
        },
        editStatus: (state, action) => {
            return {
                ...state,
                status_data: [...state.status_data].map(obj => obj.id === action.payload.id ? action.payload : obj)
            }
        },
      
    }
});

export const { setStatus, addStatus, editStatus} = StatusReducer.actions;

export default StatusReducer.reducer