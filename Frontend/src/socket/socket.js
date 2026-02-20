import { io } from "socket.io-client";

const socket = io("http://192.168.137.26:3000");
// const socket = io("http://localhost:3000");
export default socket;
