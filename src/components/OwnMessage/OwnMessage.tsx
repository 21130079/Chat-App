import React, {useEffect, useRef, useState} from "react";
import './own-message-light-theme.scss'
import './own-message-dark-theme.scss'
import typing from "../../assets/images/typing.gif";
import userImg from '../../assets/images/myAvt.png';
import textImg from '../../assets/images/FileImg/text.png';
import other from '../../assets/images/FileImg/other.png';
import {db} from "../firebase";
import {doc, getDoc} from "firebase/firestore";

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

interface Document {
    url: string;
    file: File;
    type: string;
    name: string;
}

interface MessageProps {
    message: Message | null;
    theme?: string | null | undefined;
    filterKeyword: string;
    idMess: string;
}

function OwnMessage({message, theme, filterKeyword, idMess}: MessageProps) {
    const [mes, setMes] = useState<any>();
    const timeRef = useRef<HTMLDivElement>(null);
    const [highlightedMessage, setHighlightedMessage] = useState<any>(null);
    const [hoverTimer, setHoverTimer] = useState<NodeJS.Timeout | null>(null);

    useEffect(() => {
        const fetchData = async (idMes: string) => {
            const docSnap = await getDoc(doc(db, 'messages', idMes));

            if (docSnap.exists()) {
                const iconMes = docSnap.data();
                setMes(iconMes.mes);
            } else {
                setMes(message?.mes);
            }
        }

        if (message) {
            if (isJsonString(message.mes)) {
                const mesData = JSON.parse(message.mes);

                if (mesData.idMes === '' || typeof mesData.idMes === 'undefined') {
                    if (mesData.message === '') {
                        setMes(message.mes);
                    } else {
                        setMes(mesData.message)
                    }
                } else {
                    fetchData(mesData.idMes);
                }
            } else {
                setMes(message.mes);
            }
        }
    }, [message]);

    const handleMouseEnter = () => {
        setHoverTimer(setTimeout(() => {
            if (timeRef.current) {
                timeRef.current.style.display = 'flex';
            }
        }, 500));
    }

    const handleMouseLeave = () => {
        if (hoverTimer) {
            clearTimeout(hoverTimer);
            setHoverTimer(null);
        }
        if (timeRef.current) {
            timeRef.current.style.display = 'none';
        }
    }

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

    const downloadFileFromFirebase = async (url: string) => {
        try {
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const blob = await response.blob();
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = 'file';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } catch (error) {
            console.error('Error downloading file:', error);
        }
    };

    useEffect(() => {
        const highlightText = (text: string, term: string) => {
            if (!term) return text;

            const regex = new RegExp(`(${term})`, 'gi');
            const parts = text.split(regex);

            return parts.map((part, index) =>
                part.toLowerCase() === term.toLowerCase() ? <span key={index} className="highlight">{part}</span> : part
            );
        };

        try {
            if (message?.mes) {
                const parsedMessage = JSON.parse(message.mes);
                const highlighted = highlightText(parsedMessage.message || message.mes, filterKeyword);
                setHighlightedMessage(highlighted);
            }
        } catch (error) {
            console.error('Error parsing or highlighting message:', error);
            setHighlightedMessage(message?.mes || null);
        }
    }, [message, filterKeyword]);

    useEffect(() => {
        return () => {
            if (hoverTimer) {
                clearTimeout(hoverTimer);
            }
        };
    }, [hoverTimer]);

    return (
        <div className={`own-message-container ${theme}`}>
            <div className="message-author">
                <p>{message?.name}</p>
            </div>

            <div className="message-content">
                <div className="time-message" ref={timeRef}>
                    <p>
                        {message?.createAt}
                    </p>
                </div>

                <div className="main-message"
                     id={idMess + ""}
                     onMouseEnter={handleMouseEnter}
                     onMouseLeave={handleMouseLeave}>
                    {mes && <div>
                        <img className="avatar" src={userImg} alt=""/>
                        <p>{mes}</p>
                        {/*<div className="mess">{highlightedMessage}</div>*/}
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
                                    } alt={file.name}/>
                                    {file.name}
                                </a>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

function isJsonString(str: string): boolean {
    try {
        const parsed = JSON.parse(str);
        return typeof parsed === 'object' && parsed !== null && !Array.isArray(parsed);
    } catch (e) {
        return false;
    }
}

export default OwnMessage;
