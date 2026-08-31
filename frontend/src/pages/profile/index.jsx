import DashboardLayout from '@/layout/DashboardLayout'
import UserLayout from '@/layout/UserLayout'
import React from 'react'
import styles from './index.module.css'
import { BASEURL, clientServer } from '@/config';
import { getAboutUser } from '@/config/redux/action/authAction';
import { getAllPosts } from '@/config/redux/action/postAction';
import { useDispatch, useSelector } from 'react-redux';
import { useState, useEffect } from 'react';

export default function ProfilePage() {
    const dispatch = useDispatch();
    const authState = useSelector((state) => state.auth);
    const postState = useSelector((state) => state.postReducer || {});
    const [userProfile, setUserProfile] = useState({});
    const [userPosts, setUserPosts] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [inputData, setInputData] = useState({
        company: '',
        position: '',
        years: ''
    });
    const handleWorkInputChange = (e) => {
        const { name, value } = e.target;
        setInputData({
            ...inputData,
            [name]: value,
        });
    };


    useEffect(() => {
        dispatch(getAboutUser({ token: localStorage.getItem("token") }));
        dispatch(getAllPosts());
    }, [dispatch]);

    useEffect(() => {
        if (!authState?.user) {
            setUserPosts([]);
            return;
        }

        setUserProfile(authState.user || {});

        const posts = Array.isArray(postState?.posts)
            ? postState.posts.filter(
                (post) => post.userId?.username === authState.user?.userId?.username
            )
            : [];

        setUserPosts(posts);
    }, [postState?.posts, authState?.user]);

    const updateProfilePicture = async (file) => {
        if (!file) return;

        const formData = new FormData();
        formData.append('profile_picture', file);
        formData.append('token', localStorage.getItem('token'));

        await clientServer.post('/update_profile_picture', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });

        dispatch(getAboutUser({ token: localStorage.getItem('token') }));
    };

    const updateProfileData = async () => {
        const request = await clientServer.post('/user_update', {
            token: localStorage.getItem('token'),
            name: userProfile.userId.name,
        });

        const response = await clientServer.post('/update_profile_data', {
            token: localStorage.getItem('token'),
            bio: userProfile.bio,
            currentPost: userProfile.currentPost,
            pastWork: userProfile.pastWork,
            education: userProfile.education,
        });
        dispatch(getAboutUser({ token: localStorage.getItem('token') }));
    }

    const getProfileImageUrl = (profilePicture) => {
        if (!profilePicture) return `${BASEURL}/uploads/default.jpg`;

        const normalizedPath = profilePicture.replace(/\\/g, '/');
        if (normalizedPath.startsWith('http://') || normalizedPath.startsWith('https://')) {
            return normalizedPath;
        }

        if (normalizedPath.startsWith('uploads/')) {
            return `${BASEURL}/${normalizedPath}`;
        }

        return `${BASEURL}/uploads/${normalizedPath}`;
    };

    const profileData = userProfile || authState.user || {};
    const hasProfile = Boolean(profileData?.userId);

    return (
        <UserLayout>
            <DashboardLayout>
                {hasProfile && (
                    <div className={styles.container}>
                        <div className={styles.backDropContainer}>
                            <label htmlFor='profilePictureInput' className={styles.backDropOverlay}>
                                <p>Edit</p>
                            </label>
                            <input
                                onChange={(e) => {
                                    updateProfilePicture(e.target.files?.[0]);
                                    e.target.value = '';
                                }}
                                type="file"
                                id='profilePictureInput'
                                accept="image/*"
                                style={{ display: 'none' }}
                            />
                            <img
                                className={styles.profilePicture}
                                src={getProfileImageUrl(profileData?.userId?.profilePicture)}
                                alt="Profile Picture"
                            />
                        </div>
                        <div className={styles.profileContainer}>
                            <div className={styles.profileDetails}>
                                <div className={styles.profileIdentity}>
                                    {/* <h2>{profileData?.userId?.name}</h2> */}
                                    <input className={styles.nameEdit} type="text" value={userProfile.userId.name} onChange={(e) => {
                                        setUserProfile({
                                            ...userProfile,
                                            userId: {
                                                ...userProfile.userId,
                                                name: e.target.value
                                            }
                                        });
                                    }} />
                                    <p>@{profileData?.userId?.username}</p>
                                </div>
                                <div>
                                    <textarea
                                        value={userProfile.bio}
                                        onChange={(e) => {
                                            setUserProfile({
                                                ...userProfile,
                                                bio: e.target.value
                                            });
                                        }}
                                        rows={Math.max(3, Math.ceil(userProfile.bio.length / 80))} // Adjust rows based on content length
                                        style={{ width: '100%' }}
                                    >

                                    </textarea>
                                </div>
                            </div>
                            <div className={styles.activityContainer}>
                                <h3>Recent Activity</h3>
                                {userPosts.length > 0 ? (
                                    userPosts.map((post) => (
                                        <div key={post._id} className={styles.postCard}>
                                            <div className={styles.card}>
                                                <div className={styles.card_profileContainer}>
                                                    {post.media !== "" ? <img src={`${BASEURL}/${post.media}`} alt="Post Media" className={styles.card_profileImage} />
                                                        : <div style={{ width: "3.4rem", height: "3.4rem" }}></div>}
                                                </div>
                                                <p>{post.body}</p>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <p>No recent activity.</p>
                                )}
                            </div>
                        </div>

                        <div className={styles.workHistory}>
                            <h3>Work History</h3>
                            <div className={styles.workHistoryContainer}>
                                {Array.isArray(profileData?.pastWork) ? (
                                    profileData.pastWork.map((work, index) => (
                                        <div key={index} className={styles.workHistoryCard}>
                                            <p style={{ fontWeight: "bold", display: "flex", alignItems: "center", gap: "0.8rem" }}>{work.company} - {work.position}</p>
                                            <p>{work.years} years</p>
                                        </div>
                                    ))
                                ) : (
                                    <p>No work history available.</p>
                                )}
                                <button className={styles.addWorkButton} onClick={() => {
                                    setIsModalOpen(true);
                                }}>Add Work</button>
                            </div>
                        </div>
                        {userProfile != authState.user &&
                            <div onClick={() => {
                                updateProfileData();
                            }} className={styles.updateProfileButton}>
                                Update Profile
                            </div>
                        }
                    </div>
                )}

                {
                    isModalOpen &&
                    <div
                        onClick={() => {
                            setIsModalOpen(false);
                        }}
                        className={styles.commentsContainer}>
                        <div
                            onClick={(e) => {
                                e.stopPropagation();
                            }}
                            className={styles.allCommentsContainer}>
                            <input onChange={handleWorkInputChange}
                                name="company"
                                type="text"
                                placeholder="Enter Company Name"
                                className={styles.inputField}
                            />
                            <input onChange={handleWorkInputChange}
                                name="position"
                                type="text"
                                placeholder="Enter Position"
                                className={styles.inputField}
                            />
                            <input onChange={handleWorkInputChange}
                                name="years"
                                type="text"
                                placeholder="Years"
                                className={styles.inputField}
                            />
                            <div onClick={() => {
                                setUserProfile({
                                    ...userProfile,
                                    pastWork: [...(userProfile.pastWork || []), inputData]
                                });
                                setIsModalOpen(false);
                            }} className={styles.updateProfileButton}>
                                Add Work
                            </div>
                        </div>
                    </div>
                }
            </DashboardLayout>
        </UserLayout>
    )
}
