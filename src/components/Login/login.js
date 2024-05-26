import React, { useState } from 'react';
import './login.css';
import typing from './typing.gif';

const FormType = {
    LOGIN: 'login',
    SIGNUP: 'signup',
};

function Login() {
    const [formType, setFormType] = useState(FormType.LOGIN);

    const handleFormSwitch = (type) => {
        setFormType(type);
    };

    return (
        <div className="container">
            <div className="box-1">
                <div className="content-holder">
                    <h6>Welcome to chat-app</h6>
                    <img id="typing-img" src={typing} alt="typing"/>
                    {formType === FormType.LOGIN ? (
                        <button className="button-1" onClick={() => handleFormSwitch(FormType.SIGNUP)}>Sign up</button>
                    ) : (
                        <button className="button-2" onClick={() => handleFormSwitch(FormType.LOGIN)}>Login</button>
                    )}
                </div>
            </div>
            <div className="box-2">
                {formType === FormType.LOGIN ? (
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
