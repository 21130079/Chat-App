import React, {useState, useEffect, useRef} from 'react';
import "./chat-box.scss";
import typing from '../../assets/images/typing.gif';
import {
    checkUser,
    getPeopleChatMessages,
    getRoomChatMessages,
    sendPeopleChat,
    sendRoomChat, ws,
} from "../../api/websocket-api";
import Message from "../Message/Message";
import OwnMessage from "../OwnMessage/OwnMessage";

interface User {
    name: string;
    type: number;
    actionTime: string;
}

interface ChatBoxProps {
    user: User | null;
}

function ChatBox({user}: ChatBoxProps) {
    const username = localStorage.getItem("username");
    const [isRoom, setIsRoom] = useState(true);
    const [boxChatData, setBoxChatData] = useState<any>(null);
    const [message, setMessage] = useState<string>('');
    const [isSend, setIsSend] = useState<string>();
    const [userStatus, setUserStatus] = useState<string>('');
    const contentRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        scrollToBottom();
    }, [boxChatData]);

    useEffect(() => {
        if (user) {
            if (user.type === 1) {
                setIsRoom(true);
                setUserStatus('Group')
                getRoomChatMessages({name: user.name, page: 1})
            } else {
                setIsRoom(false);
                checkUser({user: user.name})
                getPeopleChatMessages({name: user.name, page: 1});
            }
        }

        ws.onmessage = (event) => {
            const response = JSON.parse(event.data as string);
            switch (response.event) {
                case "GET_ROOM_CHAT_MES": {
                    setBoxChatData(response.data.chatData)
                    break;
                }
                case "GET_PEOPLE_CHAT_MES": {
                    setBoxChatData(response.data)
                    break;
                }
                case "CHECK_USER": {
                    setUserStatus(response.data.status ? 'Online' : 'Offline')
                    break;
                }
                case "SEND_CHAT": {
                    console.log(user?.name)
                    console.log(user?.type)
                    if (response.data.to === user?.name) {
                        if (user?.type === 1) {
                            getRoomChatMessages({name: user?.name, page: 1})
                        }
                    }
                    if (response.data.to === localStorage.getItem("username") as string) {
                        if (user?.type === 0) {
                            getPeopleChatMessages({name: user?.name, page: 1})
                        }
                    }

                }
            }
        }
    }, [user, isSend]);

    const scrollToBottom = () => {
        if (contentRef.current) {
            contentRef.current.scrollTop = contentRef.current.scrollHeight;
        }
    };

    const handleTypeMessage = (e: React.ChangeEvent<HTMLInputElement>) => {
        setMessage(e.target.value);
    }

    const handleSendMessage = () => {
        if (message && user && message.trim().length > 0) {
            if (isRoom) {
                sendRoomChat({
                    to: user.name,
                    mes: message
                });
            } else {
                sendPeopleChat({
                    to: user.name,
                    mes: message
                });
            }
            setIsSend(Date.now() + "");
            setMessage("");
        }
    }

    const handleEnterMessage = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            handleSendMessage();
        }
    }


    return (
        <div className="chat-box">
            <div className="chat-box__header">
                <div className="chat-box__header-user">
                    <img src={typing} alt="avatar"/>
                    <div className="info">
                        <h4>{user ? user.name : 'Name'}</h4>
                        <p className="status">{user ? userStatus : ''}</p>
                    </div>
                </div>
                <div className="chat-box__header-icons">
                    <i className="bi bi-gear-fill"></i>
                </div>
            </div>

            <div className="chat-box__content" ref={contentRef}>
                {boxChatData && boxChatData.slice().reverse()
                    .filter((chatData: any) => chatData.mes.trim().length > 0)
                    .map((chatData: any) => {
                        return username === chatData.name
                            ?
                            <OwnMessage key={chatData.id} message={chatData}/>
                            :
                            <Message key={chatData.id} message={chatData}/>
                    })
                }
            </div>

            <div className="chat-box__footer">
                <div className="chat-box__footer-container">
                    <input
                        type="text"
                        placeholder="Type a message..."
                        value={message}
                        onKeyPress={handleEnterMessage}
                        onChange={handleTypeMessage}
                    />
                    <i className="bi bi-paperclip"></i>
                    <i className="bi bi-emoji-smile"></i>
                    <button className="send-button" onClick={handleSendMessage}>
                        Send
                        <i className="bi bi-arrow-right-circle-fill"></i>
                    </button>
                </div>
            </div>
        </div>
    );
}

export default ChatBox;
