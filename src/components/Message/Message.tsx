import userImg from '../../assets/images/user.png';
import React, {useEffect, useRef, useState} from "react";
import './message-light-theme.scss'
import './message-dark-theme.scss'
import textImg from '../../assets/images/FileImg/text.png';
import other from '../../assets/images/FileImg/other.png';
import {doc, getDoc} from "firebase/firestore";
import {db} from "../firebase";

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
    idMess:string
}

function Message({message, theme, filterKeyword, idMess}: MessageProps) {
    const [mes, setMes] = useState<any>();
    const timeRef = useRef<HTMLDivElement>(null);
    let hoverTimer: NodeJS.Timeout;

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

        const processMessage = (msg :Message) => {
            if (isJsonString(msg.mes)) {
                const mesData = JSON.parse(msg.mes);
                if (!mesData.idMes || mesData.idMes === "") {
                    setMes(mesData.message);
                } else {
                    fetchData(mesData.idMes);
                }
            } else {
                setMes(msg.mes);
            }
        };

        if (message) {
            processMessage(message);
        }
    }, [message]);

    useEffect(() => {
        const highlightText = (text: string, term: string) => {
            if (!term) return text;
            const regex = new RegExp(`(${term})`, 'gi');
            const parts = text.split(regex);
            return parts.map((part, index) =>
                part.toLowerCase() === term.toLowerCase() ? <span key={index} className="highlight">{part}</span> : part
            );
        };

        if (message?.mes && isJsonString(message?.mes)) {
            const parsedMessage = JSON.parse(message.mes);
            const highlighted = highlightText(parsedMessage.message, filterKeyword);
            setMes(highlighted);
        } else {
            setMes(message?.mes);
        }
    }, [filterKeyword, message?.mes]);

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

    const isJsonString = (str: string) => {
        try {
            const parsedString = JSON.parse(str);
            return (typeof parsedString === 'object') && (parsedString !== null) && (!Array.isArray(parsedString));
        } catch (e) {
            return false;
        }
    }

    return (
        <div className={`message-container ${theme}`}>
            <div className="message-author">
                <p>{message?.name}</p>
            </div>

            <div className="message-content">
                <div className="main-message"
                     id={idMess}
                     onMouseEnter={handleMouseEnter}
                     onMouseLeave={handleMouseLeave}>
                    {mes && <div className="message-line">
                        <img className="avatar" src={userImg} alt=""/>
                        <div className="mess">{mes}</div>
                    </div>}
                    {medias && medias.length > 0 && (
                        <div className="media-container">
                            <div className="media-item">
                                <img className="avatar" src={userImg} alt=""/>
                            </div>

                            {medias.map((media, index) => (
                                media.type === 0 ? (
                                    <div key={index} className="media-item">
                                        <img key={index} className="send-image" src={media.url} alt="sent image"/>
                                    </div>
                                ) : (
                                    <div key={index} className="media-item">
                                        <video key={index} className="send-video" src={media.url} controls/>
                                    </div>
                                )
                            ))}
                        </div>
                    )}
                    {files && files.length > 0 && (
                        <div className="file-container">
                            <img className="avatar" src={userImg} alt=""/>
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