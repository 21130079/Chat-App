import React, { useState } from 'react';
import './login.css';
import typing from './typing.gif';


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
    return (
        <div className="login-form-container">
            <h1>Login Form</h1>
            <input type="text" placeholder="Username" className="input-field" />
            <br /><br />
            <input type="password" placeholder="Password" className="input-field" />
            <br /><br />
            <button className="login-button" type="button">Login</button>
        </div>
    );
}

function SignupForm() {
    return (
        <div className="signup-form-container">
            <h1>Sign Up Form</h1>
            <input type="text" placeholder="Username" className="input-field" />
            <br /><br />
            <input type="email" placeholder="Email" className="input-field" />
            <br /><br />
            <input type="password" placeholder="Password" className="input-field" />
            <br /><br />
            <button className="signup-button" type="button">Sign Up</button>
        </div>
    );
}

export default Login;
