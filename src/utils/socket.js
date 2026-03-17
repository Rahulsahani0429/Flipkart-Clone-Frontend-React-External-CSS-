/**
 * Singleton Socket.io client.
 * Survives React StrictMode double-mount because we gate on socket.connected.
 */
import { io } from "socket.io-client";
import { API_BASE_URL } from "../config";

let socket = null;

export const connectSocket = (token) => {
    // Already connected – reuse
    if (socket?.connected) return socket;

    // Existed but disconnected – destroy it first
    if (socket) {
        socket.removeAllListeners();
        socket.disconnect();
        socket = null;
    }

    socket = io(API_BASE_URL, {
        auth: { token },
        // Websocket only – avoids the 400 polling errors
        transports: ["websocket"],
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 2000,
        timeout: 10000,
    });

    socket.on("connect", () =>
        console.log("[Socket] Connected:", socket.id)
    );
    socket.on("connect_error", (err) =>
        console.error("[Socket] Connection error:", err.message)
    );
    socket.on("disconnect", (reason) =>
        console.log("[Socket] Disconnected:", reason)
    );

    return socket;
};

export const disconnectSocket = () => {
    if (socket) {
        socket.removeAllListeners();
        socket.disconnect();
        socket = null;
    }
};

export const getSocket = () => socket;
