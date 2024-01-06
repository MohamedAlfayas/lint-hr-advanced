import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    branch_data: []
}


const BranchReducer = createSlice({
    name: 'BranchReducer',
    initialState,
    reducers: {
        setBranch: (state, { type, payload }) => {
            return {
                ...state,
                branch_data: payload
            }
        },
        addBranch: (state, action) => {
            return {
                ...state,
                branch_data: [...state.branch_data, action.payload]
            }
        },
        editBranch: (state, action) => {
            return {
                ...state,
                branch_data: [...state.branch_data].map(obj => obj.id === action.payload.id ? action.payload : obj)
            }
        }
    }
});


export const { setBranch, addBranch, editBranch } = BranchReducer.actions;

export default BranchReducer.reducer;