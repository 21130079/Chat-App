import typing from "../../assets/images/typing.gif";
import React from "react";
import './Message.scss'

function Message({ message }: { message: string }) {
    return (
        <div className="message">
            <div>
                <p>
                    <img src={typing} alt=""/>
                    {message}
                </p>
            </div>
        </div>
    )
}

export default Message;