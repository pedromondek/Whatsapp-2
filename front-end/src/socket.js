import { io } from "socket.io-client";

const URL = process.env.PORT_WS ?? "http://localhost:8888";
// let user = localStorage.getItem("user");
// let userId = "";

// if (user) {
//   user = JSON.parse(user);
//   userId = user.id;
// }

// export const socket = (userId) => {
//   return io(URL, {
//     query: { userId },
//   });
// };
export const socket = io(URL);
