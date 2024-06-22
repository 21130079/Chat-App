import typing from "../../assets/images/typing.gif";
import React, { useRef } from "react";
import './OwnMessage.scss';

interface Message {
    createAt: string;
    id: number;
    name: string;
    mes: string;
    to: string;
    type: number;
}

interface Media {
    type: number;
    url: string;
}

interface MessageProps {
    message: Message | null;
}

const OwnMessage: React.FC<MessageProps> = ({ message }) => {
    const timeRef = useRef<HTMLDivElement>(null);
    let hoverTimer: NodeJS.Timeout;

    const handleMouseEnter = () => {
        hoverTimer = setTimeout(() => {
            if (timeRef.current) {
                timeRef.current.style.display = 'flex';
            }
        }, 500);
    };

    const handleMouseLeave = () => {
        if (hoverTimer) {
            clearTimeout(hoverTimer);
        }
        if (timeRef.current) {
            timeRef.current.style.display = 'none';
        }
    };

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

    const medias: Media[] | null = (() => {
        try {
            if (message?.mes) {
                const parsedMessage = JSON.parse(message.mes);
                return parsedMessage.medias || null;
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
                    <p>{message?.createAt}</p>
                </div>

                <div className="main-message" onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
                    {mes && (
                        <div>
                            <img className="avatar" src={typing} alt="typing" />
                            {mes}
                        </div>
                    )}
                   <div className="media">
                       {medias && medias.map((media, index) => (
                           media.type === 0 ? (
                               <img key={index} className="send-image" src={media.url} alt="sent image" />
                           ) : (
                               <video key={index} className="send-video" src={media.url} controls />
                           )
                       ))}
                   </div>
                </div>
            </div>
        </div>
    );
};

export default OwnMessage;
