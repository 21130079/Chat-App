import React, {useState, useEffect} from 'react';
import "./chat-list-light-theme.scss";
import "./chat-list-dark-theme.scss";
import typing from '../../assets/images/typing.gif';
import group from '../../assets/images/group.png';
import {websocket} from "../../api/web-socket";
import {checkUser, getUserList, logout} from "../../api/api";
import firebase from "firebase/compat";
import {auth, db} from "../../libs/firebase";
import {doc, getDoc, onSnapshot} from "firebase/firestore";
import {useUserStore} from "../../libs/userStore";

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
    const username = localStorage.getItem('username') as string;

    const {currentUser} = useUserStore();
    const [chats, setChats] = useState([]);

    // useEffect(() => {
    //     const unSub = onSnapshot(doc(db, "userchats", currentUser.id), async (res: any) => {
    //         const items = res.data().chats;
    //         const promises = items.map(async (item: any) => {
    //             const userDocRef = doc(db, "users", item.receiverId);
    //             const userDocSnap = await getDoc(userDocRef)
    //             const user = userDocSnap.data();
    //             return {...item, user}
    //         });
    //         const chatData = await Promise.all(promises);
    //
    //         setChats(chatData)
    //     });
    //
    //     return () => {
    //         unSub();
    //     }
    // }, [currentUser.id]);
    //
    // console.log(chats)

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
                    // chats.map((chat: string) => (
                    //     <div key={chat.chatId} className="chat-list__content-user" onClick={() => onUserSelect(user)}>
                    //         {/*<div className="avatar">*/}
                    //         {/*    {user.name.charAt(0).toUpperCase()}*/}
                    //         {/*</div>*/}
                    //         <div className="info-message">
                    //             <div className="info">
                    //                 <h4>{user.name}</h4>
                    //             </div>
                    //             <div className="chat-list-message">
                    //                 <p>{user.actionTime}</p>
                    //             </div>
                    //         </div>
                    //     </div>
                    // ))

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
