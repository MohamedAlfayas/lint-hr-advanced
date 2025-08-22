import { createSlice } from "@reduxjs/toolkit"

const initialState = {
    Piriorities_data: [],
   
}

const PirioritiesReducer = createSlice({
    name: 'PirioritiesReducer',
    initialState,
    reducers: {
        setPiriorities: (state, { type, payload }) => {
            return {
                ...state,
                Piriorities_data: payload
            }
        },
        addPiriorities: (state, action) => {
            return {
                ...state,
                Piriorities_data: [...state.Piriorities_data, action.payload]
            }
        },
        editPiriorities: (state, action) => {
            return {
                ...state,
                Piriorities_data: [...state.Piriorities_data].map(obj => obj.id === action.payload.id ? action.payload : obj)
            }
        },
      
    }
});

export const { setPiriorities, addPiriorities, editPiriorities} = PirioritiesReducer.actions;

export default PirioritiesReducer.reducer