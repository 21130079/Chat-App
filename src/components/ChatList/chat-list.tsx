import React, {useEffect, useState} from 'react';
import "./chat-list-light-theme.scss";
import "./chat-list-dark-theme.scss";
import typing from '../../assets/images/typing.gif';
import {logout} from "../../api/api";
import {addDoc, collection} from "firebase/firestore";
import {db} from "../firebase";

interface User {
    name: string;
    type: number;
    actionTime: string;
}

interface ChatListProps {
    users: User[],
    onUserSelect: (user: User) => void,
    setIsMessageChange?: (value: (((prevState: boolean) => boolean) | boolean)) => void,
    isMessageChange?: boolean,
    theme?: string | null
}

function ChatList({users, onUserSelect, setIsMessageChange, isMessageChange, theme}: ChatListProps) {
    const [searchText, setSearchText] = useState('');
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const base64LoginInfo: string = localStorage.getItem("user") ?? '';
    const decodedLoginInfo: string = atob(base64LoginInfo);
    const userInfo = JSON.parse(decodedLoginInfo);
    const username = userInfo.username;

    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchText(e.target.value);
    };

    const handleIconClick = () => {
        setIsMenuOpen(!isMenuOpen);
    };

    const handleLogout = () => {
        logout();
        window.location.href = '/';
        // auth.signOut();
    };

    const filteredUsers = users.filter(user => user.name.toLowerCase().includes(searchText.toLowerCase()));

    return (
        <div className={`chat-list ${theme}`}>
            <div className="chat-list__header">
                <div className="chat-list__header-user">
                    <img src={typing} alt="avatar"/>
                    <div className="info">
                        <h4>{username}</h4>
                        <p className="status">Online</p>
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
                <input type="text" placeholder="Search on Chat" onChange={handleSearch} value={searchText}/>
            </div>

            <div className="chat-list__content">
                {
                    filteredUsers.map((user, index) => (
                        <div key={index} className="chat-list__content-user" onClick={() => onUserSelect(user)}>
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
                    ))
                }
            </div>
        </div>
    );
}

export default ChatList;
