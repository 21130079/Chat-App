import "./chat-list.scss"
import typing from "../Login/typing.gif";
import React from "react";

function ChatList() {
    return (
        <div className="chat-list">
            <div className="chat-list__header">
                <div className="chat-list__header-user">
                    <img src={typing} alt="avatar"/>

                    <div className="info">
                        <h4>Name</h4>
                        <p className="status">Status</p>
                    </div>
                </div>

                <div className="chat-box__header-icons">
                    <i className="bi bi-gear-fill"></i>
                </div>
            </div>
            <div className="chat-list__search">
                <input type="text" placeholder="Search on Chat"/>
            </div>
            <div className="chat-list__content">
                <div className="chat-list__content-user">
                    <img src={typing} alt="avatar"/>
                    <div className="info-message">
                        <div className="info">
                            <h4>Name</h4>
                        </div>
                        <div className="message">
                            <p>You: Chào Giang</p>
                        </div>
                    </div>
                </div>
                <div className="chat-list__content-user">
                    <img src={typing} alt="avatar"/>
                    <div className="info-message">
                        <div className="info">
                            <h4>Name</h4>
                        </div>
                        <div className="message">
                            <p>You: Chào Giang</p>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    )
}

export default ChatList;