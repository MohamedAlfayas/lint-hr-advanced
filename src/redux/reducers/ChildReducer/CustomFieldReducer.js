import { createSlice } from "@reduxjs/toolkit"

const initialState = {
    'custom_fields' : []
}

const CustomFieldReducer = createSlice({
    name : 'CustomFieldReducer',
    initialState : initialState,
    reducers : {
        setCustomField : (state, action) =>{
            return {
                ...state,
                custom_fields : action.payload
            }
        },
        addCustomField : (state, action) =>{
            return {
                ...state,
                custom_fields : [...state.custom_fields, action.payload]
            }
        },
        editCustomField: (state, action) =>{
            return {
                ...state,
                custom_fields : [...state.custom_fields].map(obj => obj.id === action.payload.id ? action.payload : obj)
            }
        }
    }
});


export const {setCustomField, addCustomField, editCustomField } = CustomFieldReducer.actions;

export default CustomFieldReducer.reducer;