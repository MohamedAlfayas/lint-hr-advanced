import { createSlice } from "@reduxjs/toolkit"

const initialState = {
    company_detail: {}
}

const CompanyReducer = createSlice({
    name: 'CompanyReducer',
    initialState,
    reducers: {
        setCompanyDetail: (state, { type, payload }) => {
            return {
                ...state,
                company_detail: payload
            }
        }
    }
});


export const { setCompanyDetail } = CompanyReducer.actions;

export default CompanyReducer.reducer