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
    user: User | null,
    setIsMessageChange?: (value: (((prevState: boolean) => boolean) | boolean)) => void,
    isMessageChange?: boolean
}

function ChatBox({user, setIsMessageChange, isMessageChange}: ChatBoxProps) {
    const username = localStorage.getItem("username");
    const [isRoom, setIsRoom] = useState(true);
    const [boxChatData, setBoxChatData] = useState<any>(null);
    const [message, setMessage] = useState<string>('');
    const [isSend, setIsSend] = useState<boolean>();
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
                    console.log(response.data.chatData)
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
            const messageObject = {
                image: selectedImage,
                message: message
            };
            if (isRoom) {
                sendRoomChat({
                    to: user.name,
                    mes: JSON.stringify(messageObject)
                });
            } else {
                sendPeopleChat({
                    to: user.name,
                    mes: JSON.stringify(messageObject)
                });
            }
            setIsSend(!isSend);
            setMessage("");
            setSelectedImage(null);
        }
    }

    const handleEnterMessage = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            handleSendMessage();
        }
    }
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const handleImageChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setSelectedImage(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

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
                {
                    boxChatData && boxChatData.slice().reverse()
                        .filter((chatData: any) => chatData.mes.trim().length > 0)
                        .map((chatData: any) => {
                            return (username === chatData.name
                                ?
                                <OwnMessage key={chatData.id} message={chatData}/>
                                :
                                <Message key={chatData.id} message={chatData}/>)

                        })
                }
            </div>

            <div className="chat-box__footer">
                <div className="chat-box__footer-container">
                    <div className="chat-box__footer-file">
                        {selectedImage && <img src={selectedImage}/>}
                    </div>
                    <div className="chat-box__footer-typing">
                        <input
                            type="text"
                            placeholder="Type a message..."
                            value={message}
                            onKeyPress={handleEnterMessage}
                            onChange={handleTypeMessage}
                        />
                        <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageChange}
                            id="fileInput"
                            style={{display: 'none'}}
                        />
                        <label htmlFor="fileInput">
                            <i className="bi bi-image"></i>
                        </label>
                        <i className="bi bi-paperclip"></i>
                        <i className="bi bi-emoji-smile"></i>
                        <button className="send-button" onClick={handleSendMessage}>
                            Send
                            <i className="bi bi-arrow-right-circle-fill"></i>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ChatBox;
