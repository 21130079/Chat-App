import React, {useState, useEffect} from 'react';
import ChatList from "../../components/ChatList/chat-list";
import ChatBox from "../../components/ChatBox/chat-box";
import "./chat-window-light-theme.scss";
import "./chat-window-dark-theme.scss";
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import {websocket} from "../../api/web-socket";
import {getUserList, reLogin} from "../../api/api";
import {useNavigate} from "react-router-dom";

interface User {
    name: string;
    type: number;
    actionTime: string;
}

function ChatWindow() {
    const username: string = localStorage.getItem("username") ?? '';
    const reLoginCode: string = localStorage.getItem("reLoginCode") ?? '';
    const [users, setUsers] = useState<User[]>([]);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [isMessageChange, setIsMessageChange] = useState<boolean>(false);
    const navigate = useNavigate();
    const [theme, setTheme] = useState<string | null>("light-theme");

    useEffect(() => {
        if (websocket.readyState === WebSocket.OPEN) {
            console.log(1)
            getUserList();
        } else {
            console.log(2)
            getUserList();
        }

        websocket.onmessage = (event) => {
            const response = JSON.parse(event.data as string);
            switch (response.event) {
                case "GET_USER_LIST": {
                    setUsers(response.data);
                    break;
                }
                case "RE_LOGIN": {
                    if (response.status === 'error') {
                        navigate('/');
                    }
                    break;
                }
                case "AUTH": {
                    if (response.status === 'error') {
                        reLogin({
                            user: username,
                            code: reLoginCode
                        })
                    }
                }
            }
        };
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
                      setIsMessageChange={setIsMessageChange}/>
            <ChatBox user={selectedUser}
                     theme={theme}
                     setTheme={setTheme}
                     isMessageChange={isMessageChange}
                     setIsMessageChange={setIsMessageChange}/>
        </div>
    );
}

export default ChatWindow;
