import React, {useState, useEffect} from 'react';
import "./chat-box.scss"
import typing from '../../assets/images/typing.gif';
import {useNavigate} from 'react-router-dom';

import {
    getPeopleChatMessages,
    getRoomChatMessages,
    getUserList,
    sendPeopleChat,
    sendRoomChat,
    ws
} from "../../api/websocket-api";
import Message from "../Message/Message";
import OwnMessage from "../OwnMessage/OwnMessage";
import {getUser} from "../../redux/action";
import message from "../Message/Message";


function ChatBox() {
    const navigate = useNavigate();
    const username = localStorage.getItem("username");
    const [isRoom, setIsRoom] = useState(false);
    const [boxChat, setBoxChat] = useState<any>();
    const [boxChatData, setBoxChatData] = useState<any>(() => {
        const savedData = localStorage.getItem("boxChatData");
        return savedData ? JSON.parse(savedData) : null;
    });
    const [message, setMessage] = useState<string>();

    const handleTypeMessage = (e: { target: { value: React.SetStateAction<string | undefined>; }; }) => {
        setMessage(e.target.value);
    }

    const handleSendMessage = () => {
        getUserList()
        if (message && boxChat && message.trim().length > 0) {
            if (isRoom) {
                sendRoomChat({
                    to: boxChat.name,
                    mes: message
                });
                getUserList()
            } else {
                sendPeopleChat({
                    to: boxChat.name,
                    mes: message
                });
                getUserList()
            }
        }
        console.log(3)
    }

    ws.onmessage = (event) => {
        const response = JSON.parse(event.data as string);
        switch (response.event) {
            case "GET_USER_LIST": {
                setBoxChat(response.data[0])

                if (boxChat) {
                    if (boxChat.type === 1) {
                        setIsRoom(true);
                        setBoxChatData(getRoomChatMessages({
                            name: boxChat.name,
                            page: 1
                        }));
                    } else {
                        setIsRoom(false);
                        setBoxChatData(getPeopleChatMessages({
                            name: boxChat.name,
                            page: 1
                        }));
                    }
                }

                break;
            }

            case "GET_ROOM_CHAT_MES": {
                setBoxChatData(response.data)
                break;
            }

            case "GET_PEOPLE_CHAT_MES": {
                setBoxChatData(response.data)
                break;
            }

            default: {
                if (response.mes === 'User not Login') {
                    navigate('/');
                }
            }
        }
    };

    useEffect(() => {
        if (ws.readyState === 1) {
            getUserList();
        }
    }, []);

    useEffect(() => {
        if (boxChatData) {
            localStorage.setItem("boxChatData", JSON.stringify(boxChatData));
        }
    }, [boxChatData]);

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
                {
                    boxChatData &&
                    boxChatData.chatData &&
                    boxChatData.chatData.slice().reverse()
                        .filter((chatData: any) => chatData.mes.trim().length > 0)
                        .map((chatData: any) => {
                        return username === chatData.name ?
                            <OwnMessage key={chatData.id} message={chatData.mes}/>
                            :
                            <Message key={chatData.id} message={chatData.mes}/>
                    })
                }
            </div>

            <div className="chat-box__footer">
                <div className="chat-box__footer-container">
                    <input type="text" placeholder="Type a message..." onChange={handleTypeMessage}/>
                    <i className="bi bi-paperclip"></i>
                    <i className="bi bi-emoji-smile"></i>

                    <button className="send-button" onClick={handleSendMessage}>
                        Send
                        <i className="bi bi-arrow-right-circle-fill"></i>
                    </button>
                </div>
            </div>
        </div>
    )
}

export default ChatBox;