const socket = io();

let charForm = document.getElementById("chat-form");
let chatmsg = document.querySelector(".chat_message");
let roomName = document.querySelector(".room_name");
let userList = document.querySelector(".users");

// 依据URL获取用户名及房间名
let { username, room } = Qs.parse(location.search, {
  ignoreQueryPrefix: true,
});

//加入房间
socket.emit("joinRoom", { username, room });

// 获取从服务器发送的room and users
socket.on("roomUsers", ({ room, users }) => {
  outputRoomName(room);
  outputUsers(users);
});

//获取服务器发送消息
socket.on("message", (message) => {
  console.log("data :>> ", message);
  outputMessage(message);

  //滚动条
  chatmsg.scrollTop = chatmsg.scrollHeight;
});

//监听消息提交submit
charForm.addEventListener("submit", (e) => {
  e.preventDefault();
  console.log("e :>> ", e.target.elements.msg.value);
  if (e.target.elements.msg.value === "") return;
  let msg = e.target.elements.msg.value;
  socket.emit("chatmsg", msg);
  e.target.elements.msg.value = "";
  e.target.elements.msg.focus();
});

// 创建函数输出消息
function outputMessage({ uname, text, time }) {
  let div = document.createElement("div");
  div.classList.add("message");
  div.innerHTML = `
  <p class="meta">${uname} <span>${time}</span></p>
  <p class="text">
   ${text}
  </p>
  `;
  chatmsg.appendChild(div);
}

// 房间
function outputRoomName(room) {
  roomName.innerHTML = room;
}

//用户
function outputUsers(users) {
  userList.innerHTML = `
    ${users
      .map(
        (it) => `
      <li>${it.username}</li>
    `
      )
      .join("")}
  `;
}
