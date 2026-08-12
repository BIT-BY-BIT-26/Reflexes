// src/socket.js
import { io } from "socket.io-client";

const socket = io("http://172.28.96.1", {
  autoConnect: false   // ⭐ manual control rakhne ke liye — login hone ke baad connect karenge
});

export default socket;