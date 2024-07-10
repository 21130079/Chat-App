import React, {useState, useEffect, useContext} from 'react';
import ChatList from "../../components/ChatList/chat-list";
import ChatBox from "../../components/ChatBox/chat-box";
import "./chat-window-light-theme.scss";
import "./chat-window-dark-theme.scss";
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import {ws} from "../../api/web-socket";
import {getUserList, reLogin, sendLogin} from "../../api/api";
import {types} from "sass";
import List = types.List;

interface User {
    name: string;
    type: number;
    actionTime: string;
    firstMess: string;
}

const initialUser =() =>{
    return {
        name: '',
        type: 0,
        actionTime: '',
        firstMess :''
    }
}

function ChatWindow() {
    const [users, setUsers] = useState<User[]>([]);
    const [selectedUser, setSelectedUser] = useState<User>(initialUser);
    const [isMessageChange, setIsMessageChange] = useState<boolean>(false);
    const [theme, setTheme] = useState<string | null>("light-theme");
    const base64LoginInfo: string = localStorage.getItem("user") ?? '';
    const decodedLoginInfo: string = atob(base64LoginInfo);
    const userInfo = JSON.parse(decodedLoginInfo);
    const [newMessages, setNewMessages] = useState<Array<string>>([]);

    let userTheme = localStorage.getItem('theme') ?? 'light-theme';
    if (userTheme !== theme) {
        setTheme(userTheme)
    }

    useEffect(() => {
        setByTheme();

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
                                reLogin({
                                    user: userInfo.username,
                                    code: userInfo.reLoginCode
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
        }, 10);
    }, []);

    const setByTheme = () => {
        if (theme === "light-theme") {
            document.body.style.backgroundColor = "#ebeaf0";
        } else {
            document.body.style.backgroundColor = "#1e1f22";
        }
    }

    const handleUserSelect = (user: User) => {
        setSelectedUser(user);
    };

    useEffect(() => {
        newMessages.reverse().forEach((message) => {
            const user = users.find(user => user.name === message);
            if (user) {
                let cloneUsers = [...users];
                cloneUsers = cloneUsers.filter(cloneUser => cloneUser.name !== user.name);
                setUsers(prevState => [user, ...cloneUsers]);
            }
        });
    }, [newMessages]);

    return (
        <div className={`chat-window-container ${theme}`}>
            <ChatList users={users}
                      theme={theme}
                      onUserSelect={handleUserSelect}
                      newMessages={newMessages}
                      setNewMessages={setNewMessages}
                      onUsersChange={setUsers}/>

            <ChatBox user={selectedUser}
                     newMessages={newMessages}
                     setNewMessages={setNewMessages}
                     theme={theme}
                     setTheme={setTheme}
                     users={users}/>
        </div>
    );
}

export default ChatWindow;
