import React, {useState, useEffect, useRef} from 'react';
import "./chat-box-dark-theme.scss";
import "./chat-box-light-theme.scss";
import typing from '../../assets/images/typing.gif';
import {ref,uploadBytes,getDownloadURL} from 'firebase/storage';
import { v4 as uuidv4 } from 'uuid';
import {
    checkUser,
    getPeopleChatMessages,
    getRoomChatMessages,
    sendPeopleChat,
    sendRoomChat
} from "../../api/api";
import {ws} from "../../api/web-socket";
import Message from "../Message/Message";
import OwnMessage from "../OwnMessage/OwnMessage";
import EmojiPicker, {EmojiClickData} from "emoji-picker-react";
import {db} from "../firebase";
import {setDoc, collection, getDocs, doc} from "firebase/firestore";
import {storage} from "../firebase";

interface User {
    name: string;
    type: number;
    actionTime: string;
}
interface ChatBoxProps {
    user: User,
    setIsMessageChange?: (value: (((prevState: boolean) => boolean) | boolean)) => void,
    isMessageChange?: boolean,
    theme?: string | null,
    setTheme?: (value: (((prevState: (string | null)) => (string | null)) | string | null)) => void
}
interface Media{
    url: string;
    file: File;
    type: number; // 0 la image, 1 la video
}

interface Document{
    url: string;
    file: File;
    type: string;
    name:string;
}

function ChatBox({user, setIsMessageChange, isMessageChange, theme, setTheme}: ChatBoxProps) {
    const emojiRegex = /[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F700}-\u{1F77F}\u{1F780}-\u{1F7FF}\u{1F800}-\u{1F8FF}\u{1F900}-\u{1F9FF}\u{1FA00}-\u{1FA6F}\u{1FA70}-\u{1FAFF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{2B50}\u{2B55}\u{1F004}\u{1F0CF}\u{1F18E}\u{1F191}-\u{1F19A}\u{1F1E6}-\u{1F1FF}\u{1F201}-\u{1F251}\u{1F300}-\u{1F5FF}\u{1F600}-\u{1F64F}\u{1F680}-\u{1F6FF}\u{1F700}-\u{1F77F}\u{1F780}-\u{1F7FF}\u{1F800}-\u{1F8FF}\u{1F900}-\u{1F9FF}\u{1FA00}-\u{1FA6F}\u{1FA70}-\u{1FAFF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F004}\u{1F0CF}\u{1F18E}\u{1F191}-\u{1F19A}\u{1F1E6}-\u{1F1FF}\u{1F201}-\u{1F251}\u{1F300}-\u{1F5FF}\u{1F600}-\u{1F64F}\u{1F680}-\u{1F6FF}\u{1F700}-\u{1F77F}\u{1F780}-\u{1F7FF}\u{1F800}-\u{1F8FF}\u{1F900}-\u{1F9FF}\u{1FA00}-\u{1FA6F}\u{1FA70}-\u{1FAFF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/u;
    const [isRoom, setIsRoom] = useState(true);
    const [boxChatData, setBoxChatData] = useState<Array<Message>>([]);
    const [message, setMessage] = useState<string>('');
    const [isSend, setIsSend] = useState<boolean>();
    const [userStatus, setUserStatus] = useState<string>('');
    const contentRef = useRef<HTMLDivElement>(null);
    const [emojiOpened, setEmojiOpened] = useState<boolean>(false);
    const modeIcon = useRef<HTMLDivElement>(null);
    const base64LoginInfo: string = localStorage.getItem("user") ?? '';
    const decodedLoginInfo: string = atob(base64LoginInfo);
    const userInfo = JSON.parse(decodedLoginInfo);
    const username = userInfo.username;
    const [base64Medias, setBase64Medias] = useState<Array<Media>>([]);
    const[fileIn, setFileIn]= useState<Array<Document>>([]);


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

        if (ws) {
            ws.onmessage = (event) => {
                const response = JSON.parse(event.data as string);
                switch (response.event) {
                    case "GET_ROOM_CHAT_MES": {
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

        // const handleSendMessage = async () => {
        //     if (message && user && message.trim().length > 0) {
        //         if (emojiRegex.test(message)) {
        //             const uuid = uuidv4();
        //             const messageRef = doc(db, 'messages', uuid);
        //             await setDoc(messageRef, {
        //                 mes: message
        //             });
        //
        //             const formatMessage =  "{\"idMes\":\"" + uuid + "\"}"
        //
        //             if (isRoom) {
        //                 sendRoomChat({
        //                     to: user.name,
        //                     mes: formatMessage
        //                 });
        //             } else {
        //                 sendPeopleChat({
        //                     to: user.name,
        //                     mes: formatMessage
        //                 });
        //             }
        //         } else {
        //             if (isRoom) {
        //                 sendRoomChat({
        //                     to: user.name,
        //                     mes: message
        //                 });
        //             } else {
        //                 sendPeopleChat({
        //                     to: user.name,
        //                     mes: message
        //                 });
        //             }

        // setdata
        let newChatMessage: Message = {
            createAt: new Date().toISOString(),
            id: boxChatData.length + 1,
            name: localStorage.getItem("username") || '',
            mes: JSON.stringify({ medias : base64Medias,
                files: fileIn,
                message: message}),
            to: user.name,
            type: user.type
        };
        setBoxChatData(prev => [newChatMessage, ...prev]);
        // thuc hien xoa trong o nhap tin nhan de co trai nghiem tot hon
        let  selectedMedias = base64Medias;
        let selectedFiles = fileIn;
        let  msgClone = message;
        setBase64Medias([]);
        setFileIn([]);
        setMessage("");
        clearInputFile();

        // load danh sach file len firebase va truyen link file ve
        let uploadedMediaUrls: Media[] = [];
        let uploadedFileUrls: Document[] = [];
        if (selectedMedias.length>0) {
            const uploadPromises = selectedMedias.map(media => uploadMedia(media.file, media.type ));
            const urls = await Promise.all(uploadPromises);
            uploadedMediaUrls = selectedMedias.map((media, i) => ({
                ...media,
                url: urls[i]
            }));
        }
        if(selectedFiles.length > 0){
            const uploadPromises = selectedFiles.map(file => uploadFile(file.file, file.name));
            const urls = await Promise.all(uploadPromises);
            uploadedFileUrls = selectedFiles.map((file, i) => ({
                ...file,
                url: urls[i]
            }));
        }
        // gửi tin nhắn
        if ((message && user && message.trim().length > 0) || uploadedMediaUrls.length > 0 || uploadedFileUrls.length > 0) {
            const messageObject = {
                medias : uploadedMediaUrls,
                files: uploadedFileUrls,
                message: msgClone
            };
            console.log(messageObject)
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
        }

        setBase64Medias([])
        setFileIn([])
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
    const uploadFile = async (file: File, name:string) => {
        const fileRef = ref(storage, `files/FILE_${uuidv4()}`);
        try {
            await uploadBytes(fileRef, file);
            return await getDownloadURL(fileRef);
        } catch (error) {
            console.error("Error uploading file: ", error);
            return "";
        }

    }

    const handleEnterMessage = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            handleSendMessage();
        }
    }

    const emojiOpenHandler = () => {
        setEmojiOpened(!emojiOpened);
    }

    const emojiHandler = (e: EmojiClickData) => {
        setMessage(prev => prev + e.emoji);
    }

    const toggleTheme = () => {
        if (theme === 'light-theme') {
            document.body.style.backgroundColor = "#1e1f22";
            if (setTheme) {
                setTheme('dark-theme');
                localStorage.setItem('theme', 'dark-theme');
            }
            if (modeIcon) {
                modeIcon.current?.classList.remove(modeIcon.current?.classList[1]);
                modeIcon.current?.classList.add('bi-moon-stars-fill');
            }
        } else {
            document.body.style.backgroundColor = "#ebeaf0";
            if (setTheme) {
                setTheme('light-theme');
                localStorage.setItem('theme', 'light-theme');
            }
            if (modeIcon) {
                modeIcon.current?.classList.remove(modeIcon.current?.classList[1]);
                modeIcon.current?.classList.add('bi-sun-fill');
            }
        }
    }

    const handleMediaChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
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
    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>)=>{
        const file = event.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onloadend = () => {
                setFileIn(prev => [...prev, { type:  file.name, name: file.name, url: reader.result as string, file }]);
            };
            clearInputFile();
        }
    }

    const handleCloseMedia =(index:number) => {
        setBase64Medias((prevArray) => {
            const newArray = [...prevArray];
            newArray.splice(index, 1);
            return newArray;
        });
        clearInputFile()
    };
    const handleCloseFile = (index:number)=>{
        setFileIn((prevArray) => {
            const newArray = [...prevArray];
            newArray.splice(index, 1);
            return newArray;
        });
        clearInputFile()
    }
    const clearInputFile = () => {
        const fileInput = document.getElementById('fileInput') as HTMLInputElement;
        if (fileInput) {
            fileInput.value = ''; // Đặt lại giá trị của input type file để kích hoạt lại sự kiện onChange
        }
    }
    return (
        <div className={`chat-box ${theme}`}>
            <div className="chat-box__header">
                <div className="chat-box__header-user">
                    <img src={typing} alt="avatar"/>
                    <div className="info">
                        <h4>{user ? user.name : 'Name'}</h4>
                        <p className="status">{user ? userStatus : ''}</p>
                    </div>
                </div>
                <div className="chat-box__header-icons">
                    <i className="bi bi-sun-fill" onClick={toggleTheme} ref={modeIcon}></i>
                </div>
            </div>

            <div className="chat-box__content" ref={contentRef}>
                {
                    boxChatData && boxChatData.slice().reverse()
                        .filter((chatData) => chatData.mes.trim().length > 0)
                        .map((chatData) => {
                            return (username === chatData.name
                                ?
                                <OwnMessage
                                    key={chatData.id}
                                    message={chatData}
                                    theme={theme}
                                />
                                :
                                <Message
                                    key={chatData.id}
                                    message={chatData}
                                    theme={theme}
                                />
                            )
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
                        {fileIn.map((file, index) => (
                            <div key={index}>
                                <i className="bi bi-x-circle" onClick={() => handleCloseFile(index)}></i>
                                {
                                    <span>{file.file.name}</span>
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
                        <i className="bi bi-paperclip"></i>

                        <div className="emoji">
                            <i className="bi bi-emoji-smile" onClick={emojiOpenHandler}></i>
                            <div className="emoji-picker">
                                <EmojiPicker open={emojiOpened} onEmojiClick={emojiHandler}/>
                            </div>
                        </div>
                        <input
                            type="file"
                            accept="image/*,video/*"
                            onChange={handleMediaChange}
                            id="mediaInput"
                            style={{display: 'none'}}
                        />
                        <input
                            type="file"
                            accept=".txt,.bat"
                            onChange={handleFileChange}
                            id="fileIn"
                            style={{display: 'none'}}
                        />
                        <label htmlFor="mediaInput">
                            <i className="bi bi-image"></i>
                        </label>
                        <label htmlFor="fileIn">
                            <i className="bi bi-paperclip"></i>
                        </label>
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