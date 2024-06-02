import React, {useState, useEffect} from 'react';
import { useNavigate } from 'react-router-dom';
import "./chat-list.scss"
import typing from '../../assets/images/typing.gif';
import {
    getPeopleChatMessages,
    getRoomChatMessages,
    getUserList,
    sendPeopleChat,
    sendRoomChat,
    logout,
    ws
} from "../../api/websocket-api";

interface User {
    name: string;
    type: number;
    actionTime: string;
}

function ChatList() {
    const navigate = useNavigate();
    const handleIconClick = () => {
        setIsMenuOpen(!isMenuOpen);
    }
    const handleLogout = () => {
        logout();
        navigate('/');

    }

    const [users, setUsers] = useState<User[]>([]);
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    useEffect(() => {
        ws.onmessage = (event) => {
            const response = JSON.parse(event.data as string);
            if (response.event === "GET_USER_LIST") {
                setUsers(response.data);
            }
        };
        getUserList();
    }, []);

    return (
        <div className="chat-list">
            <div className="chat-list__header">
                <div className="chat-list__header-user">
                    <img src={typing} alt="avatar"/>

                    <div className="info">
                        <h4>My Name</h4>
                        <p className="status">Status</p>
                    </div>
                </div>

                <div className="chat-list__header-icons" onClick={handleIconClick}>
                    <i className="bi bi-three-dots"></i>
                    {isMenuOpen && (
                        <div className="dropdown-menu">
                            <div className="dropdown-item">Action</div>
                            <div className="dropdown-item" onClick={handleLogout}>Logout</div>
                        </div>
                    )}
                </div>
            </div>

            <div className="chat-list__search">
                <input type="text" placeholder="Search on Chat"/>
            </div>

            <div className="chat-list__content">
                {users.map((user, index) => (
                    <div key={index} className="chat-list__content-user">
                        <div className="avatar">
                            {user.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="info-message">
                            <div className="info">
                                <h4>{user.name}</h4>
                            </div>
                            <div className="chat-list-message">
                                <p>{user.actionTime}</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}

export default ChatList;