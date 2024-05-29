import {w3cwebsocket} from 'websocket';

// WebSocket URL
const wsUrl :string = 'ws://140.238.54.136:8080/chat/chat';

// Connect to WebSocket server
export const ws = new w3cwebsocket(wsUrl);



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


