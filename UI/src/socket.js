// src/socket.js
import { io } from "socket.io-client";

const socket = io("http://10.130.206.130", {
  autoConnect: false,
  auth: (cb) => {
    const token = localStorage.getItem("token");
    cb({ token });
  }
});

export default socket;