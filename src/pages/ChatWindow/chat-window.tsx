import React, { useState, useEffect } from 'react';
import ChatList from "../../components/ChatList/chat-list";
import ChatBox from "../../components/ChatBox/chat-box";
import "./chat-window.scss";
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import {getUserList, ws} from "../../api/websocket-api";

interface User {
    name: string;
    type: number;
    actionTime: string;
}


function ChatWindow() {
    const [users, setUsers] = useState<User[]>([]);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);

    useEffect(() => {
         getUserList();
                ws.onmessage = (event) => {
                    try {
                        const response = JSON.parse(event.data as string);
                        if (response.event === "GET_USER_LIST") {
                            setUsers(response.data);
                        }
                    } catch (error) {
                        console.error("Error parsing WebSocket message:", error);
                    }
                };

    }, []);

    const handleUserSelect = (user: User) => {
        setSelectedUser(user);
    };

    return (
        <div className="chat-window-container">
            <ChatList users={users} onUserSelect={handleUserSelect}  />
            <ChatBox user={selectedUser} />
        </div>
    );
}

export default ChatWindow;
