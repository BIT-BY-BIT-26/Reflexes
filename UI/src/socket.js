// src/socket.js
import { io } from "socket.io-client";

<<<<<<< HEAD
const socket = io("http://localhost:3000", {
  autoConnect: false ,  // ⭐ manual control rakhne ke liye — login hone ke baad connect karenge
  auth:(cb)=>{
    const token = localStorage.getItem("token");
    cb({
      token
    })
=======
const socket = io("http://10.4.7.5:3000", {
  autoConnect: false,
  auth: (cb) => {
    const token = localStorage.getItem("token");
    cb({ token });
>>>>>>> b9e6f0f6bf88485b03619677651207f148e9f35e
  }
});

export default socket;