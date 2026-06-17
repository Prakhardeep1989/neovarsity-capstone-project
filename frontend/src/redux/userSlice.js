import { createSlice } from "@reduxjs/toolkit";

const storedUser = (() => {
  try {
    const data = localStorage.getItem("homelyUser");
    return data ? JSON.parse(data) : null;
  } catch {
    return null;
  }
})();

const initialState = storedUser || {
  email: "",
  firstName: "",
  image: "",
  lastName: "",
  _id: "",
  isAdmin: false,
};

export const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    loginRedux: (state, action) => {
      state._id = action.payload.data._id;
      state.firstName = action.payload.data.firstName;
      state.lastName = action.payload.data.lastName;
      state.email = action.payload.data.email;
      state.image = action.payload.data.image || "";
      state.isAdmin = Boolean(action.payload.data.isAdmin);
      localStorage.setItem("homelyUser", JSON.stringify(action.payload.data));
    },
    logoutRedux: (state) => {
      state._id = "";
      state.firstName = "";
      state.lastName = "";
      state.email = "";
      state.image = "";
      state.isAdmin = false;
      localStorage.removeItem("homelyUser");
    },
  },
});

export const { loginRedux, logoutRedux } = userSlice.actions;

export default userSlice.reducer;
