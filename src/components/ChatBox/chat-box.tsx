import React, {useState, useEffect, useRef} from 'react';
import "./chat-box.scss";
import typing from '../../assets/images/typing.gif';
import {ref,uploadBytes,getDownloadURL} from 'firebase/storage';
import { v4 as uuidv4 } from 'uuid';
import {
    checkUser,
    getPeopleChatMessages,
    getRoomChatMessages,
    sendPeopleChat,
    sendRoomChat, ws,
} from "../../api/websocket-api";
import Message from "../Message/Message";
import OwnMessage from "../OwnMessage/OwnMessage";
import firebase from "firebase/compat";
import {storage} from "../firebase";

interface User {
    name: string;
    type: number;
    actionTime: string;
}

interface ChatBoxProps {
    user: User | null,
    setIsMessageChange?: (value: (((prevState: boolean) => boolean) | boolean)) => void,
    isMessageChange?: boolean
}

function ChatBox({user, setIsMessageChange, isMessageChange}: ChatBoxProps) {
    const username = localStorage.getItem("username");
    const [isRoom, setIsRoom] = useState(true);
    const [boxChatData, setBoxChatData] = useState<any>(null);
    const [message, setMessage] = useState<string>('');
    const [isSend, setIsSend] = useState<boolean>();
    const [userStatus, setUserStatus] = useState<string>('');
    const contentRef = useRef<HTMLDivElement>(null);
    const [urlImage, setUrlImage] = useState<string>("");
    const [urlImageFooter, seturlImageFooter] = useState<string>("");
    const [selectedImage, setSelectedImage] = useState<File | null>(null);
    const [urlVideo, setUrlVideo] = useState<string>("");
    const [urlVideoFooter, setUrlVideoFooter] = useState<string>("");
    const [selectedVideo, setSelectedVideo] = useState<File | null>(null);
    useEffect(() => {
        scrollToBottom();
    }, [boxChatData]);

    useEffect(() => {
        if (user) {
            if (user.type === 1) {
                setIsRoom(true);
                setUserStatus('Group')
                getRoomChatMessages({name: user.name, page: 1})
            } else {
                setIsRoom(false);
                checkUser({user: user.name})
                getPeopleChatMessages({name: user.name, page: 1});
            }
        }

        ws.onmessage = (event) => {
            const response = JSON.parse(event.data as string);
            switch (response.event) {
                case "GET_ROOM_CHAT_MES": {
                    console.log(response.data.chatData)
                    setBoxChatData(response.data.chatData)
                    break;
                }
                case "GET_PEOPLE_CHAT_MES": {

                    setBoxChatData(response.data)
                    break;
                }
                case "CHECK_USER": {
                    setUserStatus(response.data.status ? 'Online' : 'Offline')
                    break;
                }
                case "SEND_CHAT": {
                    if (response.data.to === user?.name) {
                        if (user?.type === 1) {
                            getRoomChatMessages({name: user?.name, page: 1})
                        }
                    }
                    if (response.data.to === localStorage.getItem("username") as string) {
                        if (user?.type === 0) {
                            getPeopleChatMessages({name: user?.name, page: 1})
                        }
                    }

                }
            }
        }
    }, [user, isSend]);

    const scrollToBottom = () => {
        if (contentRef.current) {
            contentRef.current.scrollTop = contentRef.current.scrollHeight;
        }
    };

    const handleTypeMessage = (e: React.ChangeEvent<HTMLInputElement>) => {
        setMessage(e.target.value);
    }

    const handleSendMessage = async () => {
        let imageUrl = "";
        let videoUrl = "";

        if (selectedImage) {
            const imageRef = ref(storage, `images/${uuidv4()}`);
            try {
                await uploadBytes(imageRef, selectedImage);
                imageUrl = await getDownloadURL(imageRef);
                setUrlImage(imageUrl);
                seturlImageFooter("");
                setSelectedImage(null);
            } catch (error) {
                console.error("Error uploading image: ", error);
                return;
            }
        }

        if (selectedVideo) {
            const videoRef = ref(storage, `videos/${uuidv4()}`);
            try {
                await uploadBytes(videoRef, selectedVideo);
                videoUrl = await getDownloadURL(videoRef);
                setUrlVideo(videoUrl);
                setUrlVideoFooter("");
                setSelectedVideo(null);
            } catch (error) {
                console.error("Error uploading video: ", error);
                return;
            }
        }
        if ((message && user && message.trim().length > 0) || urlImageFooter.trim().length > 0) {
            const messageObject = {
                image: imageUrl,
                video: videoUrl,
                message: message
            };
            if (isRoom && user) {
                sendRoomChat({
                    to: user.name,
                    mes: JSON.stringify(messageObject)
                });
            } else {
               if(user){
                   sendPeopleChat({
                       to: user.name,
                       mes: JSON.stringify(messageObject)
                   });
               }
            }
            setIsSend(!isSend);
            setMessage("");
            setUrlImage("");
        }
    }

    const handleEnterMessage = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            handleSendMessage();
        }
    }

    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onloadend = () => {
                if (file.type.startsWith('image/')) {
                    seturlImageFooter(reader.result as string);
                    setSelectedImage(file);
                } else if (file.type.startsWith('video/')) {
                    setUrlVideoFooter(reader.result as string);
                    setSelectedVideo(file);
                }
            };
        }
    };
    const handleCloseMedia =() => {
        seturlImageFooter("");
        setUrlVideoFooter("");
    };

    return (
        <div className="chat-box">
            <div className="chat-box__header">
                <div className="chat-box__header-user">
                    <img src={typing} alt="avatar"/>
                    <div className="info">
                        <h4>{user ? user.name : 'Name'}</h4>
                        <p className="status">{user ? userStatus : ''}</p>
                    </div>
                </div>
                <div className="chat-box__header-icons">
                    <i className="bi bi-gear-fill"></i>
                </div>
            </div>

            <div className="chat-box__content" ref={contentRef}>
                {
                    boxChatData && boxChatData.slice().reverse()
                        .filter((chatData: any) => chatData.mes.trim().length > 0)
                        .map((chatData: any) => {
                            return (username === chatData.name
                                ?
                                <OwnMessage key={chatData.id} message={chatData}/>
                                :
                                <Message key={chatData.id} message={chatData}/>)

                        })
                }
            </div>

            <div className="chat-box__footer">
                <div className="chat-box__footer-container">
                    <div className="chat-box__footer-file">
                        {(urlImageFooter || urlVideoFooter) && (
                            <div>
                                <i className="bi bi-x-circle" onClick={handleCloseMedia}></i>
                                {urlImageFooter && <img src={urlImageFooter} alt="Selected Image"/>}
                                {urlVideoFooter && <video src={urlVideoFooter} controls/>}
                            </div>
                        )}
                    </div>
                    <div className="chat-box__footer-typing">
                        <input
                            type="text"
                            placeholder="Type a message..."
                            value={message}
                            onKeyPress={handleEnterMessage}
                            onChange={handleTypeMessage}
                        />
                        <input
                            type="file"
                            accept="image/*,video/*"
                            onChange={handleFileChange}
                            id="fileInput"
                            style={{display: 'none'}}
                        />
                        <label htmlFor="fileInput">
                            <i className="bi bi-image"></i>
                        </label>
                        <i className="bi bi-paperclip"></i>
                        <i className="bi bi-emoji-smile"></i>
                        <button className="send-button" onClick={handleSendMessage}>
                            Send
                            <i className="bi bi-arrow-right-circle-fill"></i>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ChatBox;
