import { clientServer } from "@/config";
import { createAsyncThunk } from "@reduxjs/toolkit";



export const getAllPosts = createAsyncThunk(
    "posts/getAllPosts",
    async (_, thunkAPI) => {
        try {
            const response = await clientServer.get('/posts');
            return thunkAPI.fulfillWithValue(response.data);
        } catch (error) {
            return thunkAPI.rejectWithValue(error);
        }
    }
)

export const createPost = createAsyncThunk(
    "post/createPost",
    async (userData, thunkAPI) => {
        const { file, body } = userData;
        try {
            const formData = new FormData();
            formData.append('token', localStorage.getItem('token'));
            formData.append('body', body);
            formData.append('media', file);
            const response = await clientServer.post('/post', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            if (response.status === 200) {
                return thunkAPI.fulfillWithValue("Post Uploaded Successfully");
            } else {
                return thunkAPI.rejectWithValue("Failed to upload post");
            }
        } catch (error) {
            return thunkAPI.rejectWithValue(error.response.data);
        }
    }
)

export const deletePost = createAsyncThunk(
    "post/deletePost",
    async (postId, thunkAPI) => {
        try {
            const response = await clientServer.delete('/delete_post', {
                data: {
                    token: localStorage.getItem('token'),
                    post_id: postId
                }
            });
            if (response.status === 200) {
                return thunkAPI.fulfillWithValue(response.data);
            }
            else {
                return thunkAPI.rejectWithValue("Failed to delete post");
            }
        } catch (error) {
            return thunkAPI.rejectWithValue(error.response.data);
        }
    }
)

export const incrementLike = createAsyncThunk(
    "post/incrementLike",
    async (post, thunkAPI) => {
        try {
            const response = await clientServer.post('/increment_post_like', {
                post_id: post.post_id
            });
            if (response.status === 200) {
                return thunkAPI.fulfillWithValue(response.data);
            }
            else {
                return thunkAPI.rejectWithValue("Failed to like post");
            }
        } catch (error) {
            return thunkAPI.rejectWithValue(error.response.data);
        }
    }
)


export const getAllComments = createAsyncThunk(
    "post/getAllComments",
    async (postData, thunkAPI) => {
        try {
            const response = await clientServer.get("/get_comments", {
                params: {
                    post_id: postData.post_id
                }
            });

            const comments = Array.isArray(response.data)
                ? response.data
                : Array.isArray(response.data?.comments)
                    ? response.data.comments
                    : [];

            // if (response.status === 200) {
                return thunkAPI.fulfillWithValue({
                    comments,
                    post_id: postData.post_id
                });
            // }
            // else {
            //     return thunkAPI.rejectWithValue("Failed to fetch comments");
            // }
        } catch (error) {
            return thunkAPI.rejectWithValue(error.response.data);
        }
    }
)

export const postComment = createAsyncThunk(
    "post/postComment",
    async (commentData, thunkAPI) => {
        try {
            const response = await clientServer.post("/comment", {
                token: localStorage.getItem('token'),
                post_id: commentData.post_id,
                commentBody: commentData.body
            });
            
            if (response.status === 200 || response.status === 201) {
                return thunkAPI.fulfillWithValue({
                    comment: response.data.comment,
                    post_id: commentData.post_id
                });
            }
            else {
                return thunkAPI.rejectWithValue("Failed to post comment");
            }
        } catch (error) {
            return thunkAPI.rejectWithValue(error.response.data);
        }
    }
)
