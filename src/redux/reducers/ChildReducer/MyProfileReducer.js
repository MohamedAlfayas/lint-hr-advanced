import { createSlice } from "@reduxjs/toolkit"

const initialState = {
    profile_data: {}
}

const MyProfileReducer = createSlice({
    name: "MyProfileReducer",
    initialState,
    reducers: {
        setMyProfileDataReducer: (state, { type, payload }) => {
            return {
                ...state,
                profile_data: payload
            }
        }
    }
});


export const { setMyProfileDataReducer } = MyProfileReducer.actions;
export default MyProfileReducer.reducer;