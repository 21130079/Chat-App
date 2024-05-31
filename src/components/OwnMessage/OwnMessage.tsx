import typing from "../../assets/images/typing.gif";
import React from "react";
import './OwnMessage.scss'

function OwnMessage({message}: {message: string}) {
    return (
        <div className="own-message">
            <div>
                <p>
                    <img src={typing} alt=""/>
                    {message}
                </p>
            </div>
        </div>
    )
}

export default OwnMessage;