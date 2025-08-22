import { createSlice } from "@reduxjs/toolkit"

const initialState = {
    contact_group_data: [],
   
}

const ContactGroupReducer = createSlice({
    name: 'ContactGroupReducer',
    initialState,
    reducers: {
        setContactGroup: (state, { type, payload }) => {
            return {
                ...state,
                contact_group_data: payload
            }
        },
        addContactGroup: (state, action) => {
            console.log("daa", action.payload);
            return {
                ...state,
                contact_group_data: [...state.contact_group_data, action.payload]
            }
        },
        editContactGroup: (state, action) => {
            return {
                ...state,
                contact_group_data: [...state.contact_group_data].map(obj => obj.id === action.payload.id ? action.payload : obj)
            }
        },
      
    }
});

export const { setContactGroup, addContactGroup, editContactGroup} = ContactGroupReducer.actions;

export default ContactGroupReducer.reducer