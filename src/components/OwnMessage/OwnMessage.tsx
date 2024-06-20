import typing from "../../assets/images/typing.gif";
import React, {useRef} from "react";
import './OwnMessage.scss'
import {log} from "node:util";

interface Message {
    createAt: string;
    id: number;
    name: string;
    mes: string;
    to: string;
    type: number;
}

interface MessageProps {
    message: Message | null;
}

function OwnMessage({message}: MessageProps) {
    const timeRef = useRef<HTMLDivElement>(null);
    let hoverTimer: any;

    const handleMouseEnter = () => {
        hoverTimer = setTimeout(() => {
            if (timeRef.current) {
                timeRef.current.style.display = 'flex';
            }
        }, 500)
    }

    const handleMouseLeave = () => {
        if (hoverTimer) {
            clearTimeout(hoverTimer);
        }
        if (timeRef.current) {
            timeRef.current.style.display = 'none';
        }
    }
    const mes = (() => {
        try {
            if (message?.mes) {
                const parsedMessage = JSON.parse(message.mes);
                return parsedMessage.message;
            }
            return message?.mes;
        } catch (error) {
            return message?.mes;
        }
    })();
    const image = (() => {
        try {
            if (message?.mes) {
                const parsedMessage = JSON.parse(message.mes);
                console.log(parsedMessage)
                return parsedMessage.image;
            }
            return null;
        } catch (error) {
            return null;
        }
    })();
    return (
        <div className="own-message-container">
            <div className="message-author">
                <p>{message?.name}</p>
            </div>

            <div className="message-content">
                <div className="time-message" ref={timeRef}>
                    <p>
                        {message?.createAt}
                    </p>

                </div>

                <div className="main-message" onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
                    <div>
                        <img src={typing} alt=""/>
                        {mes}
                    </div>
                    <img className="send-image" src={image} alt=""/>
                </div>
            </div>
        </div>
    )
}

export default OwnMessage;