import React, {useState, useEffect, useContext} from 'react';
import ChatList from "../../components/ChatList/chat-list";
import ChatBox from "../../components/ChatBox/chat-box";
import "./chat-window-light-theme.scss";
import "./chat-window-dark-theme.scss";
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import {ws} from "../../api/web-socket";
import {getUserList, reLogin, sendLogin} from "../../api/api";
import {useNavigate} from "react-router-dom";

interface User {
    name: string;
    type: number;
    actionTime: string;
}

interface BoxChat {
    name: string;
    type: string;
}

interface BoxChatData {
    id: string;
    owner: string;
    name: string;
    type: string;
    actionTime: string;
}

interface ChatData {
    id: string;
    name: string;
    to: string;
    type: string;
    mes: string;
    createAt: string;
}

const intialUser =() =>{
    return {
        name: '',
        type: 0,
        actionTime: ''
    }
}

function ChatWindow() {
    const [users, setUsers] = useState<User[]>([]);
    const [selectedUser, setSelectedUser] = useState<User>(intialUser);
    const [isMessageChange, setIsMessageChange] = useState<boolean>(false);
    const [theme, setTheme] = useState<string | null>("light-theme");
    const base64LoginInfo: string = localStorage.getItem("user") ?? '';
    const decodedLoginInfo: string = atob(base64LoginInfo);
    const userInfo = JSON.parse(decodedLoginInfo);

    let userTheme = localStorage.getItem('theme') ?? 'light-theme';
    if (userTheme !== theme) {
        setTheme(userTheme)
    }

    useEffect(() => {
        setTimeout(() => {
            if (ws) {
                getUserList();

                ws.onmessage = (event) => {
                    const response = JSON.parse(event.data as string);
                    switch (response.event) {
                        case "LOGIN": {
                            if (response.status === "success") {
                                const loginInfo = {
                                    username: userInfo.username,
                                    password: userInfo.password,
                                    reLoginCode: response.data.RE_LOGIN_CODE
                                };
                                const jsonLoginInfoString = JSON.stringify(loginInfo);
                                const base64LoginInfoString = btoa(jsonLoginInfoString);

                                localStorage.setItem("user", base64LoginInfoString)
                            }
                            break;
                        }
                        case "GET_USER_LIST": {
                            setUsers(response.data);
                            break;
                        }
                        case "RE_LOGIN": {
                            if (response.status === 'error') {
                                sendLogin({
                                    user: userInfo.username,
                                    pass: userInfo.password
                                })
                                getUserList();
                            }
                            break;
                        }
                        case "AUTH": {
                            if (response.status === 'error') {
                                sendLogin({
                                    user: userInfo.username,
                                    pass: userInfo.password
                                })
                                getUserList();
                            }
                            break;
                        }
                    }
                };
            }
        }, 200);
    }, []);

    const handleUserSelect = (user: User) => {
        setSelectedUser(user);
    };

    return (
        <div className={`chat-window-container ${theme}`}>
            <ChatList users={users}
                      theme={theme}
                      onUserSelect={handleUserSelect}
                      isMessageChange={isMessageChange}
                      setIsMessageChange={setIsMessageChange}
                      onUsersChange={setUsers}/>

            <ChatBox user={selectedUser}
                     theme={theme}
                     setTheme={setTheme}
                     isMessageChange={isMessageChange}
                     setIsMessageChange={setIsMessageChange}/>
        </div>
    );
}

export default ChatWindow;
