import typing from "../../assets/images/typing.gif";
import React, {useRef} from "react";
import './message-light-theme.scss'
import './message-dark-theme.scss'

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

function Message({ message, theme }: MessageProps) {
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

    return (
        <div className={`message-container ${theme}`}>
            <div className="message-author">
                <p>{message?.name}</p>
            </div>

            <div className="message-content">
                <div className="main-message" onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
                    <p>
                        <img src={typing} alt=""/>
                        {message?.mes}
                    </p>
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