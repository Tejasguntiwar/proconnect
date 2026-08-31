import { acceptConnectionRequest, getConnectionsRequests, getSentConnectionRequests } from '@/config/redux/action/authAction';
import DashboardLayout from '@/layout/DashboardLayout'
import UserLayout from '@/layout/UserLayout'
import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux';
import styles from './index.module.css';
import { BASEURL } from '@/config';
import { useRouter } from 'next/router';
import { connection } from 'next/server';

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

export default function MyConnections() {
  const dispatch = useDispatch();
  const authState = useSelector((state) => state.auth);
  const router = useRouter();

  const pendingRequests = Array.isArray(authState.connectionRequests)
    ? authState.connectionRequests.filter((connection) => connection?.status_accepted === null)
    : [];

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      dispatch(getConnectionsRequests({ token }));
      dispatch(getSentConnectionRequests({ token }));
    }
  }, [dispatch]);

  useEffect(() => {
    console.log("Auth State Updated:", authState);
    console.log("Connection Requests:", authState.connectionRequests);
    console.log("Pending Requests:", pendingRequests);
  }, [authState.connectionRequests]);

  return (
    <UserLayout>
      <DashboardLayout>
        <div className={styles.pageContainer}>
          <div className={styles.connectionsHeaderRow}>
            <h1 className={styles.pageTitle}>My Connections</h1>
          </div>

          <div className={styles.connectionsList}>
            {
              pendingRequests.length > 0 ? pendingRequests.map((user) => {
                return (
                  <div onClick={() => {
                    router.push(`/view_profile/${user?.userId?.username}`)
                  }} className={styles.userCard} key={user?._id}>
                    <div className={styles.cardRow}>
                      <div className={styles.profilePictureWrapper}>
                        <img
                          className={styles.profilePicture}
                          src={getProfileImageUrl(user?.userId?.profilePicture)}
                          alt="Profile Picture"
                        />
                      </div>

                      <div className={styles.userInfo}>
                        <div className={styles.userName}>{user?.userId?.name}</div>
                        <div className={styles.userHandle}>@{user?.userId?.username}</div>
                      </div>
                      <button className={styles.acceptButton} onClick={(e) => {
                        e.stopPropagation();
                        dispatch(acceptConnectionRequest({
                          connectionId: user?._id,
                          token: localStorage.getItem("token"),
                          action: "accept"
                        }));
                      }}>Accept</button>
                    </div>
                  </div>
                )
              }) : (
                <div className={styles.emptyState}>No connections yet.</div>
              )
            }
            {/* All Accepted Connections */}
            {
              authState.connectionRequests && (authState.connectionRequests.filter((connection) => connection?.status_accepted !== null).length > 0 || authState.sentRequests?.filter((connection) => connection?.status_accepted !== null).length > 0) && (
                <>
                  <h2 className={styles.sectionTitle}>All Connections</h2>
                  {/* Accepted Received Connections */}
                  {authState.connectionRequests.filter((connection) => connection?.status_accepted !== null).map((user) => {
                    return (
                      <div onClick={() => {
                        router.push(`/view_profile/${user?.userId?.username}`)
                      }} className={styles.userCard} key={user?._id}>
                        <div className={styles.cardRow}>
                          <div className={styles.profilePictureWrapper}>
                            <img
                              className={styles.profilePicture}
                              src={getProfileImageUrl(user?.userId?.profilePicture)}
                              alt="Profile Picture"
                            />
                          </div>

                          <div className={styles.userInfo}>
                            <div className={styles.userName}>{user?.userId?.name}</div>
                            <div className={styles.userHandle}>@{user?.userId?.username}</div>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                  {/* Accepted Sent Connections */}
                  {authState.sentRequests?.filter((connection) => connection?.status_accepted !== null).map((user) => {
                    return (
                      <div onClick={() => {
                        router.push(`/view_profile/${user?.connectionId?.username}`)
                      }} className={styles.userCard} key={user?._id}>
                        <div className={styles.cardRow}>
                          <div className={styles.profilePictureWrapper}>
                            <img
                              className={styles.profilePicture}
                              src={getProfileImageUrl(user?.connectionId?.profilePicture)}
                              alt="Profile Picture"
                            />
                          </div>

                          <div className={styles.userInfo}>
                            <div className={styles.userName}>{user?.connectionId?.name}</div>
                            <div className={styles.userHandle}>@{user?.connectionId?.username}</div>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </>
              )
            }
          </div>
        </div>
      </DashboardLayout>
    </UserLayout>
  )
}
