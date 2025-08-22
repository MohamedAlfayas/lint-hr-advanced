import { createSlice } from "@reduxjs/toolkit"

const initialState = {
    contacts_data: [],
   
}

const Contacts = createSlice({
    name: 'ContactsReducer',
    initialState,
    reducers: {
        setContacts: (state, { type, payload }) => {
            return {
                ...state,
                contacts_data: payload
            }
        },
        addContacts: (state, action) => {
            console.log("daa", action.payload);
            return {
                ...state,
                contacts_data: [...state.contacts_data, action.payload]
            }
        },
        editContacts: (state, action) => {
            return {
                ...state,
                contacts_data: [...state.contacts_data].map(obj => obj.id === action.payload.id ? action.payload : obj)
            }
        },
      
    }
});

export const { setContacts, addContacts, editContacts} = Contacts.actions;

export default Contacts.reducer