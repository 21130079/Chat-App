import typing from "../../assets/images/typing.gif";
import React, {useEffect, useRef, useState} from "react";
import './Message.scss'
import textImg from '../../assets/images/FileImg/text.png';
import other from '../../assets/images/FileImg/other.png';

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
interface Document{
    url: string;
    file: File;
    type: string;
    name:string;
}

interface MessageProps {
    message: Message | null;
    filterKeyword: string;
    idMess:string
}

function Message({ message,filterKeyword,idMess}: MessageProps) {
    const timeRef = useRef<HTMLDivElement>(null);
    let hoverTimer: any;
    const [highlightedMessage, setHighlightedMessage] = useState<any>(null);

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

    const files: Document[] | null = (() => {
        try {
            if (message?.mes) {
                const parsedMessage = JSON.parse(message.mes);
                return parsedMessage.files || null;
            }
            return null;
        } catch (error) {
            return null;
        }
    })();
    useEffect(() => {
        const highlightText = (text: string, term: string) => {
            if (!term) return text;
            console.log(term);
            const regex = new RegExp(`(${term})`, 'gi');
            const parts = text.split(regex);
            return parts.map((part, index) =>
                part.toLowerCase() === term.toLowerCase() ? <span key={index} className="highlight">{part}</span> : part
            );
        };

        try {
            if (message?.mes) {
                const highlighted = highlightText(mes+"", filterKeyword);
                setHighlightedMessage(highlighted);
            }
        } catch (error) {
            console.error('Error parsing or highlighting message:', error);
            setHighlightedMessage(message?.mes || null);
        }
    }, [message, filterKeyword]);
    return (
        <div className="message-container">
            <div className="message-author">
                <p>{message?.name}</p>
            </div>

            <div className="message-content">
                <div className="main-message" id={idMess} onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
                    {mes && <div>
                        <img className="avatar" src={typing} alt=""/>
                        <div className="mess">{highlightedMessage}</div>
                    </div>}
                    {medias && medias.length > 0 && (
                        <div className="media">
                            {medias.map((media, index) => (
                                media.type === 0 ? (
                                    <img key={index} className="send-image" src={media.url} alt="sent image"/>
                                ) : (
                                    <video key={index} className="send-video" src={media.url} controls/>
                                )
                            ))}
                        </div>
                    )}
                    {files && files.length > 0 && (
                        <div className="file">
                            {files.map((file, index) => (
                                <a key={index} href={file.url} target="_blank" rel="noopener noreferrer"
                                   download={file.name}
                                   className="send-file">
                                    <img src={
                                        (() => {
                                            try {
                                                switch (file.name.split('.').pop()) {
                                                    case 'txt':
                                                        return textImg;
                                                    default:
                                                        return other;
                                                }
                                            } catch (error) {
                                                return other;
                                            }
                                        })()
                                    }/>
                                    {file.name}
                                </a>
                            ))}
                        </div>
                    )}
                </div>

                <div className="time-message" ref={timeRef}>
                    <p>
                        {message?.createAt}
                    </p>
                </div>
            </div>
        </div>
    )
}

export default Message;