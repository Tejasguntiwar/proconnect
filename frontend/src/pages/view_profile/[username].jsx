import { BASEURL, clientServer } from '@/config';
import DashboardLayout from '@/layout/DashboardLayout';
import UserLayout from '@/layout/UserLayout';
import React, { useEffect } from 'react';
import styles from './index.module.css';
import { useDispatch } from 'react-redux';
import { useSelector } from 'react-redux';
import { useState } from 'react';
import { getAllPosts } from '@/config/redux/action/postAction';
import { getConnectionsRequests, sendConnectionRequest, getSentConnectionRequests } from '@/config/redux/action/authAction';

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

export default function ViewProfilePage({ userProfile }) {

    const postReducer = useSelector((state) => state.postReducer);
    const dispatch = useDispatch();

    const authState = useSelector((state) => state.auth);
    const [userPosts, setUserPosts] = React.useState([]);

    const [isCurrentUserInConnection, setIsCurrentUserInConnection] = useState(false);
    const [isConnectionNull, setIsConnectionNull] = useState(true);

    useEffect(() => {
        dispatch(getAllPosts());
        dispatch(getConnectionsRequests({ token: localStorage.getItem("token") }));
        dispatch(getSentConnectionRequests({ token: localStorage.getItem("token") }));
    }, [dispatch]);

    useEffect(() => {
        const posts = postReducer.posts.filter(
            (post) => post.userId?._id === userProfile?.userId?._id
        );
        setUserPosts(posts);
    }, [postReducer.posts, userProfile?.userId?._id]);

    useEffect(() => {
        if (authState.connections.some(user => user.connectionId?._id === userProfile?.userId?._id)) {
            setIsCurrentUserInConnection(true);
            if (authState.connections.find(user => user.connectionId?._id === userProfile?.userId?._id).status_accepted === true) {
                setIsConnectionNull(false);
            }
        }
    }, [authState.connections]);

    useEffect(() => {
        // getUserPosts();
    }, []);

    const connectionRequest = authState.connections.find((request) => {
        const connectionId = request.connectionId?._id || request.connectionId;
        return connectionId === userProfile?.userId?._id;
    });
    
    // Also check for sent requests
    const sentRequest = authState.sentRequests?.find((request) => {
        const connectionId = request.connectionId?._id || request.connectionId;
        return connectionId === userProfile?.userId?._id;
    });
    
    const isConnectionRequestSent = Boolean(connectionRequest || sentRequest);
    const requestStatus = sentRequest ? sentRequest.status_accepted : connectionRequest?.status_accepted;

    return (
        <UserLayout>
            <DashboardLayout>
                <div className={styles.container}>
                    <div className={styles.backDropContainer}>
                        <img
                            className={styles.profilePicture}
                            src={getProfileImageUrl(userProfile?.userId?.profilePicture)}
                            alt="Profile Picture"
                        />
                    </div>
                    <div className={styles.profileContainer}>
                        <div className={styles.profileDetails}>

                            <div className={styles.profileIdentity}>
                                <h2>{userProfile?.userId?.name}</h2>
                                <p>@{userProfile?.userId?.username}</p>
                            </div>

                            <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                                {isConnectionRequestSent ? (
                                    <button
                                        className={`${styles.connectButton} ${requestStatus !== true ? styles.pendingButton : ''}`}
                                        disabled
                                    >
                                        {requestStatus === true ? "Connected" : "Pending"}
                                    </button>
                                ) : (
                                    <button className={styles.connectBtn} onClick={() => {
                                        dispatch(sendConnectionRequest({ token: localStorage.getItem("token"), connectionId: userProfile?.userId?._id }));
                                    }}>
                                        Connect
                                    </button>
                                )}
                                <div style={{cursor:"pointer"}} onClick={ async () => {
                                    const response = await clientServer.get(`/user/download_resume?id=${userProfile?.userId?._id}`);
                                    const pdfPath = response?.data?.message || '';
                                    const fileUrl = pdfPath.startsWith('http') ? pdfPath : `${BASEURL}/${pdfPath}`;
                                    window.open(fileUrl, '_blank');
                                }}>
                                    <svg style={{width:"1.2em"}} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
                                    </svg>

                                </div>
                            </div>
                            <div>
                                <p>{userProfile?.bio}</p>
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
                            {
                                userProfile.pastWork.map((work, index) => {
                                    return (
                                        <div key={index} className={styles.workHistoryCard}>
                                            <p style={{ fontWeight: "bold", display: "flex", alignItems: "center", gap: "0.8rem" }}>{work.company} - {work.position}</p>
                                            <p>{work.years}</p>
                                        </div>
                                    )
                                })
                            }
                        </div>
                    </div>
                </div>
            </DashboardLayout>
        </UserLayout>
    )
}

export async function getServerSideProps(context) {

    console.log("View Profile Page");
    console.log(context.query.username);

    const request = await clientServer.get("/user/get_user_profile_based_on_username", {
        params: {
            username: context.query.username
        }
    });

    const response = request.data;
    console.log("Response from server:", response);

    return { props: { userProfile: request.data.profile } };
}