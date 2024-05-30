import React from 'react';
import ChatList from "../../components/ChatList/chat-list";
import ChatBox from "../../components/ChatBox/chat-box";
import "./chat-window.scss"
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';

function ChatWindow() {
    return (
        <div className="chat-window-container">
            <ChatList/>
            <ChatBox/>
        </div>
    )
}

export default ChatWindow;