// src/socket.js
import { io } from "socket.io-client";

const socket = io("http://10.16.0.171:3000", {
  autoConnect: false ,  // ⭐ manual control rakhne ke liye — login hone ke baad connect karenge
  auth:(cb)=>{
    const token = localStorage.getItem("token");
    cb({
      token
    })
  }
});

export default socket;