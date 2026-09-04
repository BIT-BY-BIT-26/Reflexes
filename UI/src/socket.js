// src/socket.js
import { io } from "socket.io-client";

const socket = io("http://10.4.7.5:3000", {
  autoConnect: false,
  auth: (cb) => {
    const token = localStorage.getItem("token");
    cb({ token });
  }
});

export default socket;