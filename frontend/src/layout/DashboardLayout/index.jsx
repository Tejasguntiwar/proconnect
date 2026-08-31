import React, { useEffect } from 'react';
import styles from './index.module.css';
import { useRouter } from 'next/router';
import { setTokenIsThere } from '@/config/redux/reducer/authReducer';
import { useDispatch, useSelector } from 'react-redux';

const navItems = [
    {
        label: 'Home',
        path: '/dashboard',
        icon: (
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.7} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 12 8.955-8.955a1.125 1.125 0 0 1 1.59 0L21.75 12M4.5 9.75v10.125A1.125 1.125 0 0 0 5.625 21h3.75v-4.875a1.125 1.125 0 0 1 1.125-1.125h2.25a1.125 1.125 0 0 1 1.125 1.125V21h3.75A1.125 1.125 0 0 0 19.5 19.875V9.75" />
            </svg>
        )
    },
    {
        label: 'Discover',
        path: '/discover',
        icon: (
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.7} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
            </svg>
        )
    },
    {
        label: 'Connections',
        path: '/my_connections',
        icon: (
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.7} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.5 20.118a7.5 7.5 0 0 1 15 0A17.933 17.933 0 0 1 12 21.75c-2.677 0-5.217-.584-7.5-1.632Z" />
            </svg>
        )
    }
];

export default function DashboardLayout({ children }) {
    const router = useRouter();
    const dispatch = useDispatch();
    const authState = useSelector((state) => state.auth);

    useEffect(() => {
        if (typeof window !== 'undefined' && localStorage.getItem('token') == null) {
            router.push('/login');
        }
        dispatch(setTokenIsThere());
    }, [dispatch, router]);

    return (
        <div>
            <div className={styles.container}>
                <div className={styles.homeContainer}>
                    <aside className={styles.homeContainer_leftBar}>
                        {navItems.map((item) => {
                            const isActive = router.pathname === item.path;
                            return (
                                <button
                                    type="button"
                                    key={item.path}
                                    onClick={() => router.push(item.path)}
                                    className={`${styles.sideBarOptions} ${isActive ? styles.activeSideBarOption : ''}`}
                                >
                                    {item.icon}
                                    <span>{item.label}</span>
                                </button>
                            );
                        })}
                    </aside>

                    <main className={styles.homeContainer_feedContainer}>{children}</main>

                    <aside className={styles.homeContainer_extraContainer}>
                        <h3>Top Profiles</h3>
                        {authState.all_profiles_fetched && authState.all_users.map((profile) => (
                            <div key={profile._id} className={styles.profileCard}>
                                <h4>{profile.userId.name}</h4>
                            </div>
                        ))}
                    </aside>
                </div>
            </div>

            <nav className={styles.mobileNavbarView} aria-label="Mobile navigation">
                {navItems.map((item) => {
                    const isActive = router.pathname === item.path;
                    return (
                        <button
                            type="button"
                            key={item.path}
                            className={`${styles.singleNavItemHolder_mobileView} ${isActive ? styles.mobileNavItemActive : ''}`}
                            onClick={() => router.push(item.path)}
                            aria-label={item.label}
                        >
                            {item.icon}
                        </button>
                    );
                })}
            </nav>
        </div>
    );
}
