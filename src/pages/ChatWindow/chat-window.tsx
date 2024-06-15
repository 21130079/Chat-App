import React, {useState, useEffect} from 'react';
import ChatList from "../../components/ChatList/chat-list";
import ChatBox from "../../components/ChatBox/chat-box";
import "./chat-window.scss";
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import {getUserList, reLogin, ws} from "../../api/websocket-api";
import {login} from "../../redux/action";
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

    console.log(ws.readyState)

    useEffect(() => {
        if (ws.readyState === WebSocket.OPEN) {
            getUserList();
        }

        ws.onopen = () => {
            getUserList();
        }

        ws.onmessage = (event) => {
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
                        getUserList();
                    }
                }
            }
        };
    }, []);

    const handleUserSelect = (user: User) => {
        setSelectedUser(user);
    };

    return (
        <div className="chat-window-container">
            <ChatList users={users}
                      onUserSelect={handleUserSelect}
                      isMessageChange={isMessageChange}
                      setIsMessageChange={setIsMessageChange}/>
            <ChatBox user={selectedUser}
                     isMessageChange={isMessageChange}
                     setIsMessageChange={setIsMessageChange}/>
        </div>
    );
}

export default ChatWindow;
