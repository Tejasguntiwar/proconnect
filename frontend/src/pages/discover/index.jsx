import { BASEURL } from '@/config';
import { getAllUsers } from '@/config/redux/action/authAction';
import DashboardLayout from '@/layout/DashboardLayout'
import UserLayout from '@/layout/UserLayout'
import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux';
import styles from './index.module.css'
import { useRouter } from 'next/router';

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

export default function Discoverpage() {
    const router = useRouter();
    const authState = useSelector((state) => state.auth);
    const dispatch = useDispatch();
    useEffect(() => {
        if(!authState.all_profiles_fetched) {
            dispatch(getAllUsers());
        }
    }, [])

    return (
        <UserLayout>
            <DashboardLayout>
                <div>
                    <h1>Discover</h1>
                    <div className={styles.allUserProfiles}>
                        {authState.all_profiles_fetched && authState.all_users.map((user) => {
                            return (
                                <div onClick={()=>{
                                    router.push(`/view_profile/${user.userId.username}`);
                                }} key={user._id} className={styles.userCard}>
                                    <img className={styles.userCardImage} src={getProfileImageUrl(user.userId.profilePicture)} alt={user.userId.name} />
                                    <h3>{user.userId.name}</h3>
                                    <p>{user.userId.username}</p>
                                </div>
                            );
                        })}

                    </div>
                </div>
            </DashboardLayout>
        </UserLayout>
    )
}
