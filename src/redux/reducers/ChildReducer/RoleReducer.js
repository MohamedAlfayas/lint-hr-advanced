import { createSlice } from "@reduxjs/toolkit"

const initialState = {
    'role_data' : []
}

const RoleReducer = createSlice({
    name : 'RoleReducer',
    initialState : initialState,
    reducers : {
        setRole : (state, action) =>{
            return {
                ...state,
                role_data : action.payload
            }
        },
        addRole : (state, action) =>{
            return {
                ...state,
                role_data : [...state.role_data, action.payload]
            }
        },
        editRole : (state, action) =>{
            return {
                ...state,
                role_data : [...state.role_data].map(obj => obj.id === action.payload.id ? action.payload : obj)
            }
        }
    }
});


export const { setRole, addRole, editRole } = RoleReducer.actions;

export default RoleReducer.reducer;