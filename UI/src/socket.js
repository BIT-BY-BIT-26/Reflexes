// src/socket.js
import { io } from "socket.io-client";

const socket = io("http://localhost:3000", {
  autoConnect: false   // ⭐ manual control rakhne ke liye — login hone ke baad connect karenge
});

export default socket;