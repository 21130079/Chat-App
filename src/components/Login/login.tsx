import React, {useEffect, useRef, useState} from 'react';
import './login.css';
import typing from './typing.gif';
import {getUser, login} from '../../Redux/action';
import {useDispatch} from "react-redux";
import {sendLogin, ws} from "../../API/websocket-api";


function Login() {
    const [isLogin, setisLogin ] = useState(true);

    const handleFormSwitch = (isLogin: boolean) => {
        setisLogin(isLogin);
    };

    return (
        <div className="container">
            <div className="box-1">
                <div className="content-holder">
                    <h3>Welcome to chat-app</h3>
                    <img id="typing-img" src={typing} alt="typing"/>
                    {isLogin ? (
                        <button className="button-1" onClick={() => handleFormSwitch(false)}>Sign up</button>
                    ) : (
                        <button className="button-2" onClick={() => handleFormSwitch(true)}>Login</button>
                    )}
                </div>
            </div>
            <div className="box-2">
                {isLogin ? (
                    <LoginForm />
                ) : (
                    <SignupForm />
                )}
            </div>
        </div>
    );
}

function LoginForm() {
    const dispatch = useDispatch();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');

    useEffect(() => {
        // mỗi lần dispatch cái action login thì mới hoạt động code này
    ws.onmessage = (event) => {
        const response = JSON.parse(event.data as string);
        console.log('Nhận dữ liệu từ máy chủ:', response);
        if(response.status === "success"){
            dispatch(
                getUser({
                     response
                })

            )
        }
    };
    }, [dispatch]);
   const handleLogin = () =>{
        dispatch(
            login({
                user: username,
                pass: password,
            })
        )
   }

    return (
        <div className="login-form-container">
            <h1>Login Form</h1>
            <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Username" className="input-field" />
            <br /><br />
            <input type="password" onChange={(e) => setPassword(e.target.value)}  placeholder="Password" className="input-field" />
            <br /><br />
            <button className="login-button" onClick={handleLogin} type="button">Login</button>
        </div>
    );
}

function SignupForm() {
    const dispatch = useDispatch();
    const usernameRef = useRef("");
    const passwordRef = useRef("");
    const handleSignUp = () =>{
        dispatch(
            login({
                user: usernameRef,
                passwordRef: passwordRef,
            })
        )
    }
    return (
        <div className="signup-form-container">
            <h1>Sign Up Form</h1>
            <input type="text" placeholder="Username" className="input-field" />
            <br /><br />
            <input type="email" placeholder="Email" className="input-field" />
            <br /><br />
            <input type="password" placeholder="Password" className="input-field" />
            <br /><br />
            <button className="signup-button" onClick={handleSignUp} type="button">Sign Up</button>
        </div>
    );
}

export default Login;
