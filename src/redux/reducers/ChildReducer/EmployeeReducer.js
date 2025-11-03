import { createSlice } from "@reduxjs/toolkit"

const initialState = {
    employee_data: []
}

const EmployeeReducer = createSlice({
    name: 'EmployeeReducer',
    initialState,
    reducers: {
        setEmployee: (state, { type, payload }) => {
            return {
                ...state,
                employee_data: payload
            }
        },
        addEmployee: (state, action) => {
            return {
                ...state,
                employee_data: [...state.employee_data, action.payload]
            }
        },
        editEmployee: (state, action) => {
            return {
                ...state,
                employee_data: [...state.employee_data].map(obj => obj.id === action.payload.id ? action.payload : obj)
            }
        },
        setEmployeeActiveStatus: (state, action) => {
          
            return {
                ...state,
                employee_data: [...state.employee_data].map(obj => obj.id === action.payload.id ? { ...obj, is_active: action.payload.is_active } : obj)
            }
        }
    }
});

export const { setEmployee, addEmployee, editEmployee, setEmployeeActiveStatus } = EmployeeReducer.actions;

export default EmployeeReducer.reducer