import { createSlice } from "@reduxjs/toolkit"

const initialState = {
    employeelist : [
        {
            "id" : 1,
            "name" : "Antony",
            "department" : "Android"
        },
        {
            "id" : 2,
            "name" : "Fayaz",
            "department" : "Web Team"
        },
        {
            "id" : 3,
            "name" : "Paul",
            "department" : "Backend"
        }
    ]
}

const EmployeeReducer = createSlice({
    name : 'EmployeeReducer',
    initialState,
    reducers : {
        getEmployee : (state , { type , payload }) =>{
            return {
                ...state,
                employeelist : payload
            }
        }
    }
});

export const { getEmployee } = EmployeeReducer.actions;

export default EmployeeReducer.reducer