import React, {useState, useEffect, useRef} from 'react';
import "./chat-box-dark-theme.scss";
import "./chat-box-light-theme.scss";
import typing from '../../assets/images/typing.gif';
import {
    checkUser,
    getPeopleChatMessages,
    getRoomChatMessages, getUserList,
    sendPeopleChat,
    sendRoomChat
} from "../../api/api";
import {websocket} from "../../api/web-socket";
import Message from "../Message/Message";
import OwnMessage from "../OwnMessage/OwnMessage";
import EmojiPicker, {EmojiClickData} from "emoji-picker-react";
import {updateDoc, doc} from "firebase/firestore"
import {db} from "../../libs/firebase";

interface User {
    name: string;
    type: number;
    actionTime: string;
}

interface ChatBoxProps {
    user: User | null,
    setIsMessageChange?: (value: (((prevState: boolean) => boolean) | boolean)) => void,
    isMessageChange?: boolean,
    theme?: string | null,
    setTheme?: (value: (((prevState: (string | null)) => (string | null)) | string | null)) => void
}

function ChatBox({user, setIsMessageChange, isMessageChange, theme, setTheme}: ChatBoxProps) {
    const username = localStorage.getItem("username");
    const [isRoom, setIsRoom] = useState(true);
    const [boxChatData, setBoxChatData] = useState<any>(null);
    const [message, setMessage] = useState<string>('');
    const [isSend, setIsSend] = useState<string>();
    const [userStatus, setUserStatus] = useState<string>('');
    const contentRef = useRef<HTMLDivElement>(null);
    const [emojiOpened, setEmojiOpened] = useState<boolean>(false);
    const modeIcon = useRef<HTMLDivElement>(null);

    useEffect(() => {
        scrollToBottom();
    }, [boxChatData]);

    useEffect(() => {
        if (websocket.readyState === WebSocket.OPEN) {
            getUserList();
            console.log(1);
        } else {
            console.log(2)
        }

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

        websocket.onmessage = (event) => {
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

    const emojiOpenHandler = () => {
        setEmojiOpened(!emojiOpened);
    }

    const emojiHandler = (e: EmojiClickData) => {
        setMessage(prev => prev + e.emoji);
    }

    const toggleTheme = () => {
        if (theme === 'light-theme') {
            document.body.style.backgroundColor = "#1e1f22";
            if (setTheme) {
                setTheme('dark-theme');
            }
            if (modeIcon) {
                modeIcon.current?.classList.remove(modeIcon.current?.classList[1]);
                modeIcon.current?.classList.add('bi-moon-stars-fill');
            }
        } else {
            document.body.style.backgroundColor = "#ebeaf0";
            if (setTheme) {
                setTheme('light-theme');
            }
            if (modeIcon) {
                modeIcon.current?.classList.remove(modeIcon.current?.classList[1]);
                modeIcon.current?.classList.add('bi-sun-fill');
            }
        }
    }

    return (
        <div className={`chat-box ${theme}`}>
            <div className="chat-box__header">
                <div className="chat-box__header-user">
                    <img src={typing} alt="avatar"/>
                    <div className="info">
                        <h4>{user ? user.name : 'Name'}</h4>
                        <p className="status">{user ? userStatus : ''}</p>
                    </div>
                </div>
                <div className="chat-box__header-icons">
                    <i className="bi bi-sun-fill" onClick={toggleTheme} ref={modeIcon}></i>
                </div>
            </div>

            <div className="chat-box__content" ref={contentRef}>
                {
                    boxChatData && boxChatData.slice().reverse()
                        .filter((chatData: any) => chatData.mes.trim().length > 0)
                        .map((chatData: any) => {
                            return username === chatData.name
                                ?
                                <OwnMessage
                                    key={chatData.id}
                                    message={chatData}
                                    theme={theme}
                                />
                                :
                                <Message
                                    key={chatData.id}
                                    message={chatData}
                                    theme={theme}
                                />
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

                    <div className="emoji">
                        <i className="bi bi-emoji-smile" onClick={emojiOpenHandler}></i>
                        <div className="emoji-picker">
                            <EmojiPicker open={emojiOpened} onEmojiClick={emojiHandler}/>
                        </div>
                    </div>

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
