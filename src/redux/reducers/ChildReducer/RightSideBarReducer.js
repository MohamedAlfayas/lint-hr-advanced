import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    showRSB: false,
    showISB:false,
    form_title: "LC Form",
    form_obj: {},
    form_width_percentage: "30%",
    component_to_show : "default"
};



const RightSideBarReducer = createSlice({
    name: 'RightSideBarReducer',
    initialState,
    reducers: {
        toggleRSBView: (state, action) => {
            return {
                ...state,
                showRSB: action.payload
            }
        },
        toggleISBView: (state, action) => {
            return {
                ...state,
                showISB: action.payload
            }
        },
        setFormTitle: (state, action) => {
            return {
                ...state,
                form_title: action.payload
            }
        },
        setFormObj: (state, action) => {
            return {
                ...state,
                form_obj: action.payload
            }
        },
        setTaxObj: (state, action) => {
            return {
                ...state,
                tax_obj: action.payload
            }
        },
        setFormWidthPercentage: (state, action) => {
            return {
                ...state,
                form_width_percentage: parseInt(window.screen.width) > 768 ? action.payload : "90%"
            }
        },
        setComponentToShow: (state, action) => {
            return {
                ...state,
                component_to_show: action.payload
            }
        },
        resetForm: (state, action) => {
            return {
                ...state,
                showRSB: true,
                showISB: true,
                form_title: "LC Form",
                form_obj: {},
                tax_obj:{},
                form_width_percentage: "30%",
                component_to_show : "default"
            }
        },
    }
});

export const {
    toggleRSBView,
    toggleISBView,
    setFormTitle,
    setFormObj,
    setTaxObj,
    setFormWidthPercentage,
    resetForm,
    setComponentToShow,
} = RightSideBarReducer.actions;

export default RightSideBarReducer.reducer;

