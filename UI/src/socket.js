// src/socket.js
import { io } from "socket.io-client";

<<<<<<< HEAD
const socket = io("http://10.130.206.201:3000", {
=======
const socket = io("http://10.130.206.201:3000", 
>>>>>>> origin/anshu-work
  autoConnect: false,
  auth: (cb) => {
    const token = localStorage.getItem("token");
    cb({ token });
  }
});

export default socket;