import React, {useState} from 'react';
import "./chat-list-light-theme.scss";
import "./chat-list-dark-theme.scss";
import userImg from '../../assets/images/user.png';
import groupImg from '../../assets/images/group.png';
import {
    logout,
    createRoom,
    joinRoom,
} from "../../api/api";

interface User {
    name: string;
    type: number;
    actionTime: string;
    firstMess: string;
}

interface ChatListProps {
    users: User[],
    onUserSelect: (user: User) => void,
    setIsMessageChange?: (value: (((prevState: boolean) => boolean) | boolean)) => void,
    isMessageChange?: boolean,
    theme?: string | null
    onUsersChange?: (users: User[]) => void
    newMessages: string[];
    setNewMessages?: (value: (((prevState: Array<string>) => Array<string>) | Array<string>)) => void;
}

function ChatList({
                      users,
                      onUserSelect,
                      setIsMessageChange,
                      isMessageChange,
                      onUsersChange,
                      theme,
                      newMessages,
                      setNewMessages
                  }: ChatListProps) {
    const [searchText, setSearchText] = useState('');
    const [addText, setAddText] = useState('');
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const base64LoginInfo: string = localStorage.getItem("user") ?? '';
    const decodedLoginInfo: string = atob(base64LoginInfo);
    const userInfo = JSON.parse(decodedLoginInfo);
    const username = userInfo.username;
    const [menuPosition, setMenuPosition] = useState<{ left: number, top: number }>({left: 0, top: 0});
    const [isAddOpen, setIsAddOpen] = useState(false)
    const [isAddingFriend, setIsAddingFriend] = useState(true);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);

    const handleSearchInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchText(e.target.value);
    };

    const handleIconClick = (event: React.MouseEvent<HTMLDivElement>) => {
        const iconElement = event.currentTarget.getBoundingClientRect();
        setMenuPosition({left: iconElement.left, top: iconElement.bottom});
        setIsMenuOpen(!isMenuOpen);
    };

    const handleOpenAddFriend = () => {
        if (isAddOpen) {
            setIsAddingFriend(true)
        } else {
            setIsAddOpen(!isAddOpen);
            setIsAddingFriend(true)
        }

    }

    const handleOpenAddGroup = () => {
        if (isAddOpen) {
            setIsAddingFriend(false)
        } else {
            setIsAddOpen(!isAddOpen);
            setIsAddingFriend(false)
        }

    }

    const handleCloseAdd = () => {
        setIsAddOpen(!isAddOpen)
    }
    const handleAddClick = () => {
        const name = {name: addText};
        if (isAddingFriend) {
            if (onUsersChange) {
                onUsersChange([{
                    name: name.name,
                    type: 0,
                    actionTime: new Date(Date.now()).toLocaleString(),
                    firstMess: ""
                }, ...users]);
            }
        } else {
            createRoom(name);
            if (onUsersChange) {
                onUsersChange([{
                    name: name.name,
                    type: 1,
                    actionTime: new Date(Date.now()).toLocaleString(),
                    firstMess: ""
                }, ...users]);
            }
        }
    };

    const handleJoinClick = () => {
        const name = {name: addText};
        joinRoom(name);
        if (onUsersChange) {
            onUsersChange([{
                name: name.name,
                type: 1,
                actionTime: new Date(Date.now()).toLocaleString(),
                firstMess: ""
            }, ...users]);
        }
    };


    const handleAddInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        setAddText(e.target.value)
    }

    const handleLogout = () => {
        logout();
        window.location.href = '/';
    };

    const handleSelectUser = (user: User) => {
        onUserSelect(user);
        setSelectedUser(user);
        if (setNewMessages) {
            setNewMessages(prev => prev.filter(message => message !== user.name));
        }
    };

    const getHoursAndMinutes = (dateTimeString: string) => {
        const timePart = dateTimeString.split(' ')[1];
        const [hours, minutes] = timePart.split(':');
        return hours + ":" + minutes;
    };

    let filteredUsers = users.filter(user => user.name.toLowerCase().includes(searchText.toLowerCase()));

    return (
        <div className={`chat-list ${theme}`}>
            <div className="chat-list__header">
                <div className="chat-list__header-user">
                    <img src={userImg} alt="avatar"/>
                    <div className="info">
                        <h6>{username}</h6>
                        <p className="status">Online</p>
                    </div>
                </div>

                <div className="chat-list__header-icons" onClick={handleIconClick}>
                    <i className="bi bi-three-dots"></i>
                    {isMenuOpen && (
                        <div className="dropdown-menu"
                             style={{left: `${menuPosition.left}px`, top: `${menuPosition.top}px`}}>
                            <div className="dropdown-item" onClick={handleOpenAddFriend}>Add Friend</div>
                            <div className="dropdown-item" onClick={handleOpenAddGroup}>Add Group</div>
                            <div className="dropdown-item" onClick={handleLogout}>Logout</div>
                        </div>
                    )}
                </div>
            </div>

            <div className="chat-list__search">
                <input type="text" placeholder="Search on Chat" onChange={handleSearchInput} value={searchText}/>
            </div>
            {isAddOpen && (
                <div className="chat-list__add">
                    <input type="text" placeholder={isAddingFriend ? "Input People Name" : "Input Group Name"}
                           onChange={handleAddInput} value={addText}/>
                    {!isAddingFriend &&
                        <button className="join" onClick={handleJoinClick}><i className="bi bi-arrow-right-circle"></i>
                        </button>}
                    <button className="add" onClick={handleAddClick}><i className="bi bi-plus-circle"></i></button>
                    <button className="cancel" onClick={handleCloseAdd}><i className="bi bi-x-circle"></i></button>
                </div>)}


            <div className="chat-list__content">
                {filteredUsers.map((user, index) => (
                    <div
                        key={index}
                        className="chat-list__content-user"
                        id={user.name}
                        onClick={() => handleSelectUser(user)}
                        style={{backgroundColor: selectedUser?.name === user.name ? '#FFC0CB' : 'white'}}
                    >
                        <div className="avatar">
                            {user.type === 1 ? <img src={groupImg} alt="avatar"/> :
                                <img src={userImg} alt="avatar"/>}
                        </div>
                        <div className="info-message">
                            <div className="info">
                                <h5 style={{marginBottom: 0}}>{user.name}</h5>
                            </div>
                            <div className="chat-list-message" style={{fontSize: 14}}>
                                {newMessages.includes(user.name as never) ? "has sent message" : ""}
                            </div>
                        </div>
                        <div className="time-message">
                            <p>{getHoursAndMinutes(user.actionTime)}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default ChatList;