import React from 'react';
import "./chat-box.scss"
import typing from '../Login/typing.gif';

function ChatBox() {
    return (
        <div className="chat-box">
            <div className="chat-box__header">
                <div className="chat-box__header-user">
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

            <div className="chat-box__content">
                <div className="message">
                    <div className="content">
                        <p>
                            <img src={typing} alt=""/>
                            Chào Đạt !
                        </p>
                    </div>
                </div>

                <div className="own-message">
                    <div className="content">
                        <p>
                            <img src={typing} alt=""/>
                            Chào Giang !
                        </p>
                    </div>
                </div>
            </div>

            <div className="chat-box__footer">
                <div className="chat-box__footer-container">
                    <input type="text" placeholder="Type a message..."/>
                    <i className="bi bi-paperclip"></i>
                    <i className="bi bi-emoji-smile"></i>

                    <button className="send-button">
                        Send
                        <i className="bi bi-arrow-right-circle-fill"></i>
                    </button>
                </div>
            </div>
        </div>
    )
}

export default ChatBox;