import UserLayout from '@/layout/UserLayout'
import React, { useEffect, useState } from 'react'
import styles from './style.module.css';
import { useRouter } from 'next/router';
import { useDispatch, useSelector } from 'react-redux';
import { loginUser, registerUser } from '@/config/redux/action/authAction';
import { emptyMessage } from '@/config/redux/reducer/authReducer';

function LoginComponent() {
  const authState = useSelector((state) => state.auth);
  const router = useRouter();
  const [isLoginMethod, setIsLoginMethod] = useState(false);

  const dispatch = useDispatch();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [name, setName] = useState('');

  useEffect(() => {
    if (authState.loggedIn) {
      router.push('/dashboard');
    }
  }, [authState.loggedIn]);

  useEffect(() => {
    if(localStorage.getItem('token')) {
      router.push('/dashboard');
    }
  }, []);

  useEffect(() => {
    dispatch(emptyMessage());
  }, [isLoginMethod]);


  const handleRegister = () => {
    // console.log('Registering user...');
    dispatch(registerUser({ username, email, password, name }));
  }
  const handleLogin = () => {
    // console.log('Logging in user...');
    dispatch(loginUser({ email, password }));
  }

  return (
    <UserLayout>
      <div className={styles.container}>
        <div className={styles.cardContainer}>
          <div className={styles.cardContainer_left}>
            <p className={styles.cardleft_heading}>{isLoginMethod ? 'Login' : 'Sign Up'}</p>
            {authState.message && <p style={{ color: authState.isError ? 'red' : 'green' }} className={styles.errorMessage}>{authState.message}</p>}

            <div className={styles.inputContainer}>
              {!isLoginMethod && <div className="inputRow">
                <input onChange={(e) => setUsername(e.target.value)}
                  type="text"
                  placeholder="Username"
                  className={styles.inputField}
                />
                <input
                  onChange={(e) => setName(e.target.value)}
                  type="text"
                  placeholder="Name"
                  className={styles.inputField}
                /></div>
              }
              <input
                onChange={(e) => setEmail(e.target.value)}
                type="text"
                placeholder="Email"
                className={styles.inputField}
              />
              <input
                onChange={(e) => setPassword(e.target.value)}
                type="password"
                placeholder="Password"
                className={styles.inputField}
              />
              <div onClick={() => {
                if (isLoginMethod) {
                  handleLogin();
                } else {
                  handleRegister();
                }
              }} className={styles.buttonWithOutline}>
                <p>{isLoginMethod ? 'Login' : 'Sign Up'}</p>
              </div>
            </div>
          </div>
          <div className={styles.cardContainer_right}>
              <div>
                {isLoginMethod ? <p>Don't have an account?</p> : <p>Already have an account?</p>}
              <div onClick={() => {
                setIsLoginMethod(!isLoginMethod);
              }} style={{color:"black", backgroundColor:"white", textAlign:"center"}} className={styles.buttonWithOutline}>
                <p>{isLoginMethod ? 'Sign Up' : 'Login'}</p>
              </div>
              </div>
          </div>
        </div>
      </div>
    </UserLayout>

  )
}

export default LoginComponent
