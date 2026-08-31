import { createAsyncThunk } from "@reduxjs/toolkit";
import { clientServer } from "@/config";

export const loginUser = createAsyncThunk(
    "user/login",
    async (user, thunkAPI) => {
        try {
            const response = await clientServer.post("/login", {
                email: user.email,
                password: user.password
            });
            if (response.data.token) {
                localStorage.setItem("token", response.data.token);
                return response.data;
            }
            return thunkAPI.rejectWithValue("No token received");
        } catch (error) {
            return thunkAPI.rejectWithValue(error.response?.data?.message || error.message || "Login failed");
        }
    }
);

export const registerUser = createAsyncThunk(
    "user/register",
    async (user, thunkAPI) => {
        try {
            const response = await clientServer.post("/register", {
                username: user.username,
                email: user.email,
                password: user.password,
                name: user.name
            });
            return response.data;
        } catch (error) {
            return thunkAPI.rejectWithValue(error.response?.data?.message || error.message || "Registration failed");
        }
    }
);


export const getAboutUser = createAsyncThunk(
    "user/getAboutUser",
    async (user, thunkAPI) => {
        try {
            const response = await clientServer.get("/get_user_and_profile", {
                params: {
                    token: user.token
                }
            });
            return thunkAPI.fulfillWithValue(response.data);
        } catch (error) {
            return thunkAPI.rejectWithValue(
                error.response?.data?.message ||
                error.message ||
                "Fetching user data failed"
            );
        }
    });

export const getAllUsers = createAsyncThunk(
    "user/getAllUsers",
    async (_, thunkAPI) => {
        try {
            const response = await clientServer.get("/user/get_all_users");
            return thunkAPI.fulfillWithValue(response.data);
        } catch (error) {
            return thunkAPI.rejectWithValue(
                error.response?.data?.message ||
                error.message ||
                "Fetching all users failed"
            );
        }
});


export const sendConnectionRequest = createAsyncThunk(
    "user/sendConnectionRequest",
    async (user, thunkAPI) => {
        try {
            const response = await clientServer.post("/user/send_connection_request", {
                token: user.token,
                targetUserId: user.connectionId
            });

            // Refresh both connections and sent requests lists
            thunkAPI.dispatch(getConnectionsRequests({ token: user.token }));
            thunkAPI.dispatch(getSentConnectionRequests({ token: user.token }));

            return thunkAPI.fulfillWithValue({
                ...response.data,
                targetUserId: user.connectionId
            });
        } catch (error) {
            return thunkAPI.rejectWithValue(
                error.response?.data?.message ||
                error.message ||
                "Sending connection request failed"
            );
        }
    }
);


export const getConnectionsRequests = createAsyncThunk(
    "user/getConnectionRequests",
    async (user, thunkAPI) => {
        try {
            const response = await clientServer.get("/user/get_connection_requests", {
                params: {
                    token: user.token
                }
            });
            return thunkAPI.fulfillWithValue(response.data.requests);
        } catch (error) {
            return thunkAPI.rejectWithValue(
                error.response?.data?.message ||
                error.message ||
                "Fetching connection requests failed"
            );
        }
    }
)

export const getMyConnectionRequests = createAsyncThunk(
    "user/getMyConnectionRequests",
    async (user, thunkAPI) => {
        try {
            const response = await clientServer.get("/user/user_connection_request", {
                params: {
                    token: user.token
                }
            });
            return thunkAPI.fulfillWithValue(response.data);
        }
        catch (error) {
            return thunkAPI.rejectWithValue(
                error.response?.data?.message ||
                error.message ||
                "Fetching my connections failed"
            );
        }
    }
)

export const acceptConnectionRequest = createAsyncThunk(
    "user/acceptConnectionRequest",
    async (user, thunkAPI) => {
        try {
            const response = await clientServer.post("/user/accept_connection_request", {
                token: user.token,
                requestId: user.connectionId,
                action_type: user.action
            });
            
            // Refresh connections after accepting
            setTimeout(() => {
                thunkAPI.dispatch(getConnectionsRequests({ token: user.token }));
            }, 500);
            
            return thunkAPI.fulfillWithValue(response.data);
        } catch (error) {
            return thunkAPI.rejectWithValue(
                error.response?.data?.message ||
                error.message ||
                "Accepting connection request failed"
            );
        }
    }
)

export const getSentConnectionRequests = createAsyncThunk(
    "user/getSentConnectionRequests",
    async (user, thunkAPI) => {
        try {
            const response = await clientServer.get("/user/get_sent_connection_requests", {
                params: {
                    token: user.token
                }
            });
            return thunkAPI.fulfillWithValue(response.data.requests);
        } catch (error) {
            return thunkAPI.rejectWithValue(
                error.response?.data?.message ||
                error.message ||
                "Fetching sent connection requests failed"
            );
        }
    }
)