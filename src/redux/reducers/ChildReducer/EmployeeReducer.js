import { createSlice } from "@reduxjs/toolkit"

const EmployeeCustomField = () => {
    // Custom Field Option

    let customFieldOptions = ((GetLocalStorageData('custom_fields')).filter(obj => {
        if ((obj.status === true) && (obj.applicable_for_modules).includes("org")) {
            return obj
        }
    })) || [];

    const CustomFieldsForThisForm = customFieldOptions.map(({ status, applicable_for_modules, ...rest }) => {
        return {
            ...rest,
            value: ""
        }
    });

    return CustomFieldsForThisForm
}



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
            let thisCFValues = [...res?.data?.data?.cf_values];
            let cf = [];
            if (thisCFValues && thisCFValues.length) {
                cf = CustomFieldsForThisForm.map(obj => {
                    return {
                        ...obj,
                        value: thisCFValues.find(t => t.id === obj.id)?.value || obj.value
                    }
                })
            }
            else {
                cf = CustomFieldsForThisForm;
            }
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
        }
    }
});

export const { setEmployee, addEmployee, editEmployee } = EmployeeReducer.actions;

export default EmployeeReducer.reducer