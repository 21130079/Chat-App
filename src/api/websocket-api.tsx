import {w3cwebsocket} from 'websocket';

// WebSocket URL
const wsUrl :string = 'ws://140.238.54.136:8080/chat/chat';

// Connect to WebSocket server
export let ws = new w3cwebsocket(wsUrl);


// Function to send login data
export const sendLogin = (data: { user: string; pass: string }) => {
    const action = {
        action: 'onchat',
        data: {
            event: 'LOGIN',
            data: {
                user: data.user,
                pass: data.pass
            }
        }
    };
    ws.send(JSON.stringify(action));
}

// kiểm tra tình trạng online (test thử không hoạt động)
export const checkUser = (data: { user: string}) => {
    const action = {
        action: 'onchat',
        data: {
            event: 'CHECK_USER',
            data: {
                user: data.user,
            }
        }
    };
    ws.send(JSON.stringify(action));
}

export const register = (data: { user: string,pass:string}) => {
    const action = {
        action: 'onchat',
        data: {
            event: 'REGISTER',
            data: {
                user: data.user,
                pass: data.pass
            }
        }
    };
    ws.send(JSON.stringify(action));
}
// Function to re-login a user
export const reLogin = (data: { user: string, code: string }) => {
    const action = {
        action: 'onchat',
        data: {
            event: 'RE_LOGIN',
            data: {
                user: data.user,
                code: data.code
            }
        }
    };
    ws.send(JSON.stringify(action));
}

// Function to logout
export const logout = () => {
    const action = {
        action: 'onchat',
        data: {
            event: 'LOGOUT'
        }
    };
    ws.send(JSON.stringify(action));
}

// Function to create a new room
export const createRoom = (data: { name: string }) => {
    const action = {
        action: 'onchat',
        data: {
            event: 'CREATE_ROOM',
            data: {
                name: data.name
            }
        }
    };
    ws.send(JSON.stringify(action));
}

// Function to join an existing room
export const joinRoom = (data: { name: string }) => {
    const action = {
        action: 'onchat',
        data: {
            event: 'JOIN_ROOM',
            data: {
                name: data.name
            }
        }
    };
    ws.send(JSON.stringify(action));
}

// Function to get room chat messages
export const getRoomChatMessages = (data: { name: string, page: number }) => {
    const action = {
        action: 'onchat',
        data: {
            event: 'GET_ROOM_CHAT_MES',
            data: {
                name: data.name,
                page: data.page
            }
        }
    };
    ws.send(JSON.stringify(action));
}

// Function to get people chat messages
export const getPeopleChatMessages = (data: { name: string, page: number }) => {
    const action = {
        action: 'onchat',
        data: {
            event: 'GET_PEOPLE_CHAT_MES',
            data: {
                name: data.name,
                page: data.page
            }
        }
    };
    ws.send(JSON.stringify(action));
    return 1;
}
// Function to send chat message to room
export const sendRoomChat = (data: { to: string, mes: string }) => {
    const action = {
        action: 'onchat',
        data: {
            event: 'SEND_CHAT',
            data: {
                type: 'room',
                to: data.to,
                mes: data.mes
            }
        }
    };
    ws.send(JSON.stringify(action));
}

// Function to send chat message to a person
export const sendPeopleChat = (data: { to: string, mes: string }) => {
    const action = {
        action: 'onchat',
        data: {
            event: 'SEND_CHAT',
            data: {
                type: 'people',
                to: data.to,
                mes: data.mes
            }
        }
    };
    ws.send(JSON.stringify(action));
}

// Function to get the user list
export const getUserList = () => {
    const action = {
        action: 'onchat',
        data: {
            event: 'GET_USER_LIST'
        }
    };
    ws.send(JSON.stringify(action));
}