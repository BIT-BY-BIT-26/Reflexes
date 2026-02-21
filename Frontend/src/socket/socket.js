import { io } from "socket.io-client";

// const socket = io("http://192.168.137.26:3000");

const socket = io("https://reflexes.onrender.com", {
  transports: ["websocket"],
});
// // const socket = io("http://localhost:3000");
// export default socket;
// import { io } from "socket.io-client";


// const socket = io("https://reflexes.onrender.com", {
//   transports: ["polling", "websocket"], // polling first
//   upgrade: true, // attempt upgrade if possible
// });


export default socket;