const wsUrl: string = 'ws://140.238.54.136:8080/chat/chat';

export let websocket: WebSocket;

export function connectWebsocket() {
    websocket = new WebSocket(wsUrl);

    websocket.onopen = function (event) {
        console.log("WebSocket is open now.");
    };

    websocket.onmessage = function (event) {
        console.log("WebSocket message received:", event.data);
    };

    websocket.onclose = function (event) {
        console.log("WebSocket is closed now.");
    };

    websocket.onerror = function (event) {
        console.error("WebSocket error observed:", event);
    };
}