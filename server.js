//引入
const express = require("express");
const path = require("path");
const socketio = require("socket.io");
const http = require("http");
const formatMessage = require(".//utils/messages.js");
const {
  userJoin,
  getCurrentUser,
  userLeave,
  getRoomUsers,
} = require(".//utils/users.js");

//初始化
const app = express();
const server = http.createServer(app);
const io = socketio(server);

//设置静态文件
app.use(express.static(path.join(__dirname, "public")));

const botName = "聊天小助手";
//监听客户端是否触发连接
io.on("connection", (socket) => {
  console.log("websocket is connection...");
  //监听加入房间事件
  socket.on("joinRoom", ({ username, room }) => {
    let user = userJoin(socket.id, username, room);
    // 加入通信，房间
    socket.join(user.room);

    // 消息一对一发送
    socket.emit("message", formatMessage(botName, "欢迎加入聊天室！"));
    // 消息广播（除了自身以外其他客户端都可以收到）
    socket.broadcast
      .to(user.room)
      .emit(
        "message",
        formatMessage(botName, `欢迎${user.username}加入聊天室！`)
      );
    // 发送用户和房间信息给客户端
    io.to(user.room).emit("roomUsers", {
      room: user.room,
      users: getRoomUsers(user.room),
    });
  });

  //获取客户端消息
  socket.on("chatmsg", (msg) => {
    console.log(msg);
    let user = getCurrentUser(socket.id);
    io.to(user.room).emit("message", formatMessage(user.username, msg));
  });

  // 监听是否断开
  socket.on("disconnect", () => {
    let user = userLeave(socket.id);
    if (user) {
      console.log(user);
      //所有人都可以收到
      io.to(user.room).emit(
        "message",
        formatMessage(botName, `${user.username}已下线`)
      );

      // 发送用户和房间信息给客户端
      io.to(user.room).emit("roomUsers", {
        room: user.room,
        users: getRoomUsers(user.room),
      });
    }
  });
});

// 端口号
const PORT = process.env.PORT || 5000;
// 监听端口
server.listen(PORT, () => {
  console.log(`app listening on port ${PORT}`);
});
