import { createSlice } from "@reduxjs/toolkit"

const initialState = {
    department_data : []
}


const DepartmentReducer = createSlice({
    name : 'DepartmentReducer',
    initialState,
    reducers : {
        setDepartmentDetails : (state, {type, payload}) =>{
            console.log("Payload = ",payload);
            return {
                ...state,
                department_data : payload
            }
        }
    }
});


export const { setDepartmentDetails } = DepartmentReducer.actions;

export default DepartmentReducer.reducer;