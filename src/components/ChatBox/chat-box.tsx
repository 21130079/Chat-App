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
import {storage} from "../firebase";

interface User {
    name: string;
    type: number;
    actionTime: string;
}
interface ChatBoxProps {
    user: User,
    setIsMessageChange?: (value: (((prevState: boolean) => boolean) | boolean)) => void,
    isMessageChange?: boolean
}
interface Media{
    url: string;
    file: File;
    type: number; // 0 la image, 1 la video
}

function ChatBox({user, setIsMessageChange, isMessageChange}: ChatBoxProps) {
    const username = localStorage.getItem("username");
    const [isRoom, setIsRoom] = useState(true);
    const [boxChatData, setBoxChatData] = useState<Array<Message>>([]);
    const [message, setMessage] = useState<string>('');
    const [userStatus, setUserStatus] = useState<string>('');
    const contentRef = useRef<HTMLDivElement>(null);
    const [base64Medias, setBase64Medias] = useState<Array<Media>>([]);

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
                    console.log(response)
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
    }, [user]);

    const scrollToBottom = () => {
        if (contentRef.current) {
            contentRef.current.scrollTop = contentRef.current.scrollHeight;
        }
    };

    const handleTypeMessage = (e: React.ChangeEvent<HTMLInputElement>) => {
        setMessage(e.target.value);
    }

    const handleSendMessage = async () => {

        // setdata
        let newChatMessage: Message = {
            createAt: new Date().toISOString(),
            id: boxChatData.length + 1,
            name: localStorage.getItem("username") || '',
            mes: JSON.stringify({ medias : base64Medias,
                message: message}),
            to: user.name,
            type: user.type
        };
        setBoxChatData(prev => [newChatMessage, ...prev]);
        // thuc hien xoa trong o nhap tin nhan de co trai nghiem tot hon
        let  selectedFiles = base64Medias;
        let  msgClone = message;
        setBase64Medias([]);
        setMessage("");
        clearInputFile();

        // load danh sach file len firebase va truyen link file ve
        let uploadedMediaUrls: Media[] = [];
        if (selectedFiles.length>0) {
            const uploadPromises = selectedFiles.map(media => uploadMedia(media.file, media.type ));
            const urls = await Promise.all(uploadPromises);
            uploadedMediaUrls = selectedFiles.map((media, i) => ({
                ...media,
                url: urls[i]
            }));
        }
        // gửi tin nhắn
        if ((message && user && message.trim().length > 0) || uploadedMediaUrls.length > 0 ) {
            const messageObject = {
                medias : uploadedMediaUrls,
                message: msgClone
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

            // reset
        }

        setBase64Medias([])
    }

    // upload len database
    const uploadMedia = async (file: File, type:number) => {
        const fileRef = type === 0 ? ref(storage, `images/IMAGE_${uuidv4()}`)
            : ref(storage, `videos/VIDEO_${uuidv4()}`);
        try {
            await uploadBytes(fileRef, file);
            return await getDownloadURL(fileRef);
        } catch (error) {
            console.error("Error uploading media: ", error);
            return "";
        }
    };

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
                setBase64Medias(prev => [...prev, { type: file.type.startsWith('image/') ? 0 : 1, url: reader.result as string, file }]);
            };
            clearInputFile();
        }
    };
    const handleCloseMedia =(index:number) => {
        setBase64Medias((prevArray) => {
            const newArray = [...prevArray];
            newArray.splice(index, 1);
            return newArray;
        });
        clearInputFile()
    };
    const clearInputFile = () => {
        const fileInput = document.getElementById('fileInput') as HTMLInputElement;
        if (fileInput) {
            fileInput.value = ''; // Đặt lại giá trị của input type file để kích hoạt lại sự kiện onChange
        }
    }
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
                        .filter((chatData) => chatData.mes.trim().length > 0)
                        .map((chatData) => {
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
                        {base64Medias.map((media, index) => (
                            <div key={index}>
                                <i className="bi bi-x-circle" onClick={()=>handleCloseMedia(index)}></i>
                                {
                                    media.type === 0
                                       ?
                                        <img src={media.url} alt=""/>
                                        :
                                        <video src={media.url} controls/>
                                }
                            </div>
                        ))}
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