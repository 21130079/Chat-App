import React, {useState, useEffect, useRef} from 'react';
import "./chat-box-dark-theme.scss";
import "./chat-box-light-theme.scss";
import typing from '../../assets/images/typing.gif';
import {
    checkUser,
    getPeopleChatMessages,
    getRoomChatMessages,
    sendPeopleChat,
    sendRoomChat
} from "../../api/api";
import {ws} from "../../api/web-socket";
import Message from "../Message/Message";
import OwnMessage from "../OwnMessage/OwnMessage";
import EmojiPicker, {EmojiClickData} from "emoji-picker-react";
import { v4 as uuidv4 } from 'uuid';
import {db} from "../firebase";
import {setDoc, collection, getDocs, doc} from "firebase/firestore";

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
    const emojiRegex = /[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F700}-\u{1F77F}\u{1F780}-\u{1F7FF}\u{1F800}-\u{1F8FF}\u{1F900}-\u{1F9FF}\u{1FA00}-\u{1FA6F}\u{1FA70}-\u{1FAFF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{2B50}\u{2B55}\u{1F004}\u{1F0CF}\u{1F18E}\u{1F191}-\u{1F19A}\u{1F1E6}-\u{1F1FF}\u{1F201}-\u{1F251}\u{1F300}-\u{1F5FF}\u{1F600}-\u{1F64F}\u{1F680}-\u{1F6FF}\u{1F700}-\u{1F77F}\u{1F780}-\u{1F7FF}\u{1F800}-\u{1F8FF}\u{1F900}-\u{1F9FF}\u{1FA00}-\u{1FA6F}\u{1FA70}-\u{1FAFF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F004}\u{1F0CF}\u{1F18E}\u{1F191}-\u{1F19A}\u{1F1E6}-\u{1F1FF}\u{1F201}-\u{1F251}\u{1F300}-\u{1F5FF}\u{1F600}-\u{1F64F}\u{1F680}-\u{1F6FF}\u{1F700}-\u{1F77F}\u{1F780}-\u{1F7FF}\u{1F800}-\u{1F8FF}\u{1F900}-\u{1F9FF}\u{1FA00}-\u{1FA6F}\u{1FA70}-\u{1FAFF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/u;
    const [isRoom, setIsRoom] = useState(true);
    const [boxChatData, setBoxChatData] = useState<any>(null);
    const [message, setMessage] = useState<string>('');
    const [isSend, setIsSend] = useState<boolean>();
    const [userStatus, setUserStatus] = useState<string>('');
    const contentRef = useRef<HTMLDivElement>(null);
    const [emojiOpened, setEmojiOpened] = useState<boolean>(false);
    const modeIcon = useRef<HTMLDivElement>(null);
    const base64LoginInfo: string = localStorage.getItem("user") ?? '';
    const decodedLoginInfo: string = atob(base64LoginInfo);
    const userInfo = JSON.parse(decodedLoginInfo);
    const username = userInfo.username;

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

        if (ws) {
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

    const handleSendMessage = async () => {
        if (message && user && message.trim().length > 0) {
            if (emojiRegex.test(message)) {
                const uuid = uuidv4();
                const messageRef = doc(db, 'messages', uuid);
                await setDoc(messageRef, {
                    mes: message
                });

                const formatMessage =  "{\"idMes\":\"" + uuid + "\"}"

                if (isRoom) {
                    sendRoomChat({
                        to: user.name,
                        mes: formatMessage
                    });
                } else {
                    sendPeopleChat({
                        to: user.name,
                        mes: formatMessage
                    });
                }
            } else {
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
            }

            setIsSend(!isSend);
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
                localStorage.setItem('theme', 'dark-theme');
            }
            if (modeIcon) {
                modeIcon.current?.classList.remove(modeIcon.current?.classList[1]);
                modeIcon.current?.classList.add('bi-moon-stars-fill');
            }
        } else {
            document.body.style.backgroundColor = "#ebeaf0";
            if (setTheme) {
                setTheme('light-theme');
                localStorage.setItem('theme', 'light-theme');
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
