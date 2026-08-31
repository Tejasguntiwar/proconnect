import { createSlice } from "@reduxjs/toolkit";
import { getAboutUser, getAllUsers, getConnectionsRequests, getMyConnectionRequests, loginUser, registerUser, sendConnectionRequest, acceptConnectionRequest, getSentConnectionRequests } from "../../action/authAction";



const initialState = {
    user: undefined,
    isError: false,
    isSuccess: false,
    isLoading: false,
    loggedIn: false,
    message: "",
    isTokenThere: false,
    profileFetched: false,
    connections: [],
    connectionRequests: [],
    sentRequests: [],
    all_users: [],
    all_profiles_fetched: false,
}

const authSlice = createSlice({
    name: "auth",
    initialState,
    reducers: {
        reset: () => initialState,
        handleLoginUser:(state) => {
            state.message = "Hello";
        },
        emptyMessage: (state) => {
            state.message = "";
        },
        setTokenIsThere: (state) => {
            state.isTokenThere = true;
        },
        setTokenIsNotThere: (state) => {
            state.isTokenThere = false;
        }
    },
    extraReducers: (builder) => {
        builder
        .addCase(loginUser.pending, (state) => {
            state.isLoading = true;
            state.message = "Knocking the door...";
        })
        .addCase(loginUser.fulfilled, (state, action) => {
            state.isLoading = false;
            state.isError = false;
            state.isSuccess = true;
            state.loggedIn = true;
            state.message = "Login successful";
        })
        .addCase(loginUser.rejected, (state, action) => {
            state.isLoading = false;
            state.isError = true;
            state.isSuccess = false;
            state.loggedIn = false;
            state.message = action.payload?.message || action.payload || "Login failed";
        })
        .addCase(registerUser.pending, (state) => {
            state.isLoading = true;
            state.message = "Registering user...";
        })
        .addCase(registerUser.fulfilled, (state, action) => {
            state.isLoading = false;
            state.isError = false;
            state.isSuccess = true;
            state.message = action.payload?.message || "Registration successful! Please login.";
        })
        .addCase(registerUser.rejected, (state, action) => {
            state.isLoading = false;
            state.isError = true;
            state.isSuccess = false;
            state.message = action.payload?.message || action.payload || "Registration failed";
        })
        .addCase(getAboutUser.fulfilled, (state, action) => {
            state.isLoading = false;
            state.isError = false;
            state.profileFetched = true;
            state.user = action.payload.profile;
        })
        .addCase(getAllUsers.fulfilled, (state, action) => {
            state.isLoading = false;
            state.isError = false;
            state.all_profiles_fetched = true;
            state.all_users = action.payload.profiles;
        })
        .addCase(getConnectionsRequests.fulfilled, (state, action) => {
            state.connections = action.payload || [];
            state.connectionRequests = action.payload || [];
        })
        .addCase(getConnectionsRequests.rejected, (state, action) => {
            state.message = action.payload
        })
        .addCase(getMyConnectionRequests.fulfilled, (state, action) => {
            state.connectionRequests = action.payload?.requests || [];
            state.connections = action.payload?.requests || [];
        })
        .addCase(getMyConnectionRequests.rejected, (state, action) => {
            state.message = action.payload
        })
        .addCase(sendConnectionRequest.fulfilled, (state, action) => {
            // Add to sentRequests for tracking sent connection requests
            const newRequest = {
                _id: Date.now().toString(),
                targetUserId: action.payload.targetUserId,
                status_accepted: null,
                timestamp: new Date().toISOString()
            };
            if (!state.sentRequests.some(req => req.targetUserId === action.payload.targetUserId)) {
                state.sentRequests.push(newRequest);
            }
            state.message = "Connection request sent successfully";
        })
        .addCase(sendConnectionRequest.rejected, (state, action) => {
            state.message = action.payload || "Failed to send connection request";
        })
        .addCase(acceptConnectionRequest.fulfilled, (state, action) => {
            // Update the connection request to accepted
            const requestId = action.payload?.connectionId;
            const request = state.connections.find(conn => conn._id === requestId);
            if (request) {
                request.status_accepted = true;
            }
            const requestIndex = state.connectionRequests.findIndex(conn => conn._id === requestId);
            if (requestIndex !== -1) {
                state.connectionRequests[requestIndex].status_accepted = true;
            }
            state.message = "Connection accepted";
        })
        .addCase(acceptConnectionRequest.rejected, (state, action) => {
            state.message = action.payload || "Failed to accept connection request";
        })
        .addCase(getSentConnectionRequests.fulfilled, (state, action) => {
            state.sentRequests = action.payload || [];
        })
        .addCase(getSentConnectionRequests.rejected, (state, action) => {
            state.message = action.payload || "Failed to fetch sent connection requests";
        })
    }
});


export const { reset, emptyMessage, setTokenIsThere, setTokenIsNotThere } = authSlice.actions;
export default authSlice.reducer;