import React, {ChangeEvent, useEffect, useRef, useState} from 'react';
import './login.css';
import typing from './typing.gif';
import {getUser, login} from '../../Redux/action';
import {useDispatch} from "react-redux";
import { ws} from "../../API/websocket-api";
import { useNavigate } from 'react-router-dom';

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
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [errormsg ,seterrormsg] =useState('');
    useEffect(() => {
        // mỗi lần dispatch cái action thì mới hoạt động code này
    ws.onmessage = (event) => {
        const response = JSON.parse(event.data as string);
        console.log('Nhận dữ liệu từ máy chủ:', response);
        switch (response.event){
            case "LOGIN":{
                if(response.status === "success"){
                    dispatch(
                        getUser({
                            response
                        })

                    )
                    navigate('/chat');
                }else if(response.status ==="error"){
                    seterrormsg(response.mes);
                }
                break;
            }
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
   const handleChangeUsername=(e: ChangeEvent<HTMLInputElement>) =>{
       setUsername(e.target.value);
   }
    const handleEnterPass=(e: React.KeyboardEvent<HTMLInputElement>) =>{
        if (e.key === 'Enter') {
            handleLogin();
        }
    }

    return (
        <div className="login-form-container">
            <h1>Login Form</h1>
            <input type="text" value={username} onChange={handleChangeUsername} placeholder="Username"
                   className="input-field"/>
            <br/><br/>
            <input type="password" onKeyPress={handleEnterPass} onChange={(e) => setPassword(e.target.value)} placeholder="Password"
                   className="input-field"/>
            <br/><br/>
            {errormsg !== '' ? <p className="Text-danger">{errormsg}</p> : <br/>}
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
