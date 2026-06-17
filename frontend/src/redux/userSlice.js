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
  role: "CUSTOMER",
  token: "",
  isAdmin: false,
};

export const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    loginRedux: (state, action) => {
      const userData = action.payload.data;
      state._id = userData._id;
      state.firstName = userData.firstName;
      state.lastName = userData.lastName;
      state.email = userData.email;
      state.image = userData.image || "";
      state.role = userData.role || "CUSTOMER";
      state.token = userData.token || "";
      state.isAdmin = userData.role === "ADMIN";
      localStorage.setItem("homelyUser", JSON.stringify(userData));
    },
    logoutRedux: (state) => {
      state._id = "";
      state.firstName = "";
      state.lastName = "";
      state.email = "";
      state.image = "";
      state.role = "CUSTOMER";
      state.token = "";
      state.isAdmin = false;
      localStorage.removeItem("homelyUser");
    },
  },
});

export const { loginRedux, logoutRedux } = userSlice.actions;

export default userSlice.reducer;
