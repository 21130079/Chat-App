import React, {ChangeEvent, useState} from 'react';
import "./chat-box.scss"
import typing from '../../assets/images/typing.gif';
import {getUser, login} from '../../redux/action';
import {useDispatch} from "react-redux";
import {register, ws} from "../../api/websocket-api";
import {useNavigate} from 'react-router-dom';
import Message from "../Message/Message";
import OwnMessage from "../OwnMessage/OwnMessage";

function ChatBox() {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const [message, setMessage] = useState('');

    // ws.onmessage = (event) => {
    //     const response = JSON.parse(event.data as string);
    //     console.log('Nhận dữ liệu từ máy chủ:', response);
    //     switch (response.event) {
    //         case "LOGIN": {
    //             if (response.status === "success") {
    //                 dispatch(
    //                     getUser({
    //                         response
    //                     })
    //                 )
    //                 navigate('/chat');
    //             } else if (response.status === "error") {
    //                 setErrorMsg(response.mes);
    //             }
    //             break;
    //         }
    //     }
    // };
    //
    // const handleLogin = () => {
    //     dispatch(
    //         login({
    //             user: username,
    //             pass: password,
    //         })
    //     )
    // }
    // const handleChangeUsername = (e: ChangeEvent<HTMLInputElement>) => {
    //     setUsername(e.target.value);
    // }
    // const handleEnterPass = (e: React.KeyboardEvent<HTMLInputElement>) => {
    //     if (e.key === 'Enter') {
    //         handleLogin();
    //     }
    // }

    return (
        <div className="chat-box">
            <div className="chat-box__header">
                <div className="chat-box__header-user">
                    <img src={typing} alt="avatar"/>

                    <div className="info">
                        <h4>Name</h4>
                        <p className="status">Status</p>
                    </div>
                </div>

                <div className="chat-box__header-icons">
                    <i className="bi bi-gear-fill"></i>
                </div>
            </div>

            <div className="chat-box__content">
                <Message message={'chao'}/>
                <OwnMessage message={'chao cc'}/>
            </div>

            <div className="chat-box__footer">
                <div className="chat-box__footer-container">
                    <input type="text" placeholder="Type a message..."/>
                    <i className="bi bi-paperclip"></i>
                    <i className="bi bi-emoji-smile"></i>

                    <button className="send-button">
                        Send
                        <i className="bi bi-arrow-right-circle-fill"></i>
                    </button>
                </div>
            </div>
        </div>
    )
}

export default ChatBox;