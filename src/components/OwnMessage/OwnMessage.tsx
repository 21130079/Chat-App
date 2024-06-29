import typing from "../../assets/images/typing.gif";
import React, {useEffect, useRef, useState} from "react";
import './own-message-light-theme.scss'
import './own-message-dark-theme.scss'
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

interface MessageProps {
    message: Message | null;
    theme?: string | null | undefined;
}

function OwnMessage({message, theme}: MessageProps) {
    const timeRef = useRef<HTMLDivElement>(null);
    const [mes, setMes] = useState<any>();
    let test: any = ''
    let hoverTimer: any;

    useEffect(() => {
        const fetchData = async (idMes: string) => {
            const docSnap = await getDoc(doc(db, 'messages', idMes));
            if (docSnap.exists()) {
                const iconMes = docSnap.data();

                setMes(iconMes.mes);
            }
        }

        if (message) {
            if (isJsonString(message.mes)) {
                const mesData = JSON.parse(message?.mes);
                if(typeof mesData.idMes === "undefined") {
                    setMes(message.mes);
                } else {
                    fetchData(mesData.idMes);
                }
            } else {
                setMes(message.mes);
            }
        }

    }, [message]);

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

                <div className="main-message" onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
                    <p>
                        <img src={typing} alt=""/>
                        {mes}
                    </p>
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