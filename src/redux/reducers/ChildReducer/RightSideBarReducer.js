import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    showRSB: false,
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
        setFormWidthPercentage: (state, action) => {
            return {
                ...state,
                form_width_percentage: action.payload
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
                form_title: "LC Form",
                form_obj: {},
                form_width_percentage: "30%",
                component_to_show : "default"
            }
        },
    }
});

export const {
    toggleRSBView,
    setFormTitle,
    setFormObj,
    setFormWidthPercentage,
    resetForm,
    setComponentToShow,
} = RightSideBarReducer.actions;

export default RightSideBarReducer.reducer;

