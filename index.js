const express = require('express');
const { createServer } = require('node:http');
const { join } = require('node:path');
const { Server } = require('socket.io');
const cors = require('cors');
require('dotenv').config();
const dbConnection = require("./database")
// const userRoute = require("./routes/userRoute");

const app = express();
app.use(cors())


dbConnection();
// app.use("/api/v1/user",userRoute)
const server = createServer(app);
const io = new Server(server);

app.get('/', (req, res) => {
  res.send("hello from backend");
});

const chats = {}

io.on('connection', (socket) => {
  console.log('a user connected');
  const chatId = socket?.request?._query?.queryConn;
  if (!chatId) {
    console.error('No chatId provided');
    return;
  }
  if(!chats[chatId]){
    chats[chatId] = new Set();
  }
  chats[chatId].add(socket)
  socket.join(chatId); 
  socket.on('message',message=>{
    
    socket.to(chatId).emit('message',message,{
      ...message,
      senderId:socket?.id
    });
  });

  socket.on('disconnect',()=>{
    console.log('user is disconnected')
    chats[chatId].delete(socket);
    if (chats[chatId].size === 0) {
      delete chats[chatId];
    }
    socket.leave(chatId);
  })
});

server.listen(3000, () => {
  console.log('server running at http://localhost:3000');
});