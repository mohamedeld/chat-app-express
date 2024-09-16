const express = require('express');
const { createServer } = require('node:http');
const { join } = require('node:path');
const { Server } = require('socket.io');
const cors = require('cors');
require('dotenv').config();
const dbConnection = require("./database");
const sendEmail = require("./services/sendEmail");
const User = require('./Model/userModel');
const jwt = require('jsonwebtoken');

// const userRoute = require("./routes/userRoute");

const app = express();
app.use(cors())


dbConnection();
// app.use("/api/v1/user",userRoute)
const server = createServer(app);
const io = new Server(server);

app.get('/', (req, res) => {
  sendEmail(null,null)
  res.send("hello from backend");
});

const chats = {}

io.on('connection', (socket) => {
  console.log('a user connected');
  const chatId = socket?.request?._query?.queryConn;
  const otp = Math.floor(100000 + Math.random() + 900000)
  socket.on('login',async (data)=>{
    sendEmail(data?.email,otp);
    // await User.findOrCreate({
    //   where:{
    //     email:data?.email
    //   },
    //   defaults:{otp}
    // })
    let user = await User.findOne({where:{email:data?.email}});
    if(user){
      user.otp = otp;
      await user.save();
    }else{
      user = await User.create({
        email:data?.email,
        otp
      })
    }
    socket.emit('otpSent')
  })
  socket.on('otpVerification',async (data)=>{
    const otp = data?.otp;
    const email = otp?.email;
    const user = await User.findOne({where:{email,otp}});
    if(!user){
      socket.emit('otpFailed');
      return;
    }else{
      const token = jwt.sign({userId:user?.dataValues?.id},process.env.SECRET_KEY,{
        expiresIn:process.env.EXPIRES_AT
      });
      socket.emit('otpSuccess',token);
    }

  })

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