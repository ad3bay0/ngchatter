const express = require('express');
const http = require('http');
const path = require('path');
const socketio = require('socket.io');
const Filter = require('bad-words');
const {generateChat,generateLocation} = require('./utils/messages');
const {addUser,removeUser,getUser,getUsersByRoom} = require('./utils/users');
const app = express();
const server = http.createServer(app);
const io = socketio(server);

const publicDirectory = path.join(__dirname, '../public');

app.use(express.static(publicDirectory));

const port = process.env.PORT || 3000;

//listening to all connection socket from client
io.on('connection', (socket) => {


    //listening to "join" socket from client
    socket.on('join',(options,callback)=>{
    
        const {error,user} = addUser({id:socket.id,...options});

        if(error){

            return callback(error);
        }

        //handles room joining 
        socket.join(user.room);

        //send message via "messages" socket on client
        socket.emit('messages', generateChat('Admin','welcome'));
        
        //send message via "messages" socket on client excluding the current connection in a room
        socket.broadcast.to(user.room).emit('messages', generateChat('Admin',`${user.username} has joined`));

        io.to(user.room).emit('roomdata',{room:user.room,users:getUsersByRoom(user.room)});


        callback();
    });

    //listening to "sendmessage" socket from client
    socket.on('sendmessage', (message, callback) => {

        const user = getUser(socket.id);
         
        //filter profane messages
        const filter = new Filter();

        if (filter.isProfane(message)) {

            return callback('profane word is not allowed');
        }

        //send message via "messages" socket on client to everyone in a room
        io.to(user.room).emit('messages', generateChat(user.username,message));

        callback();
    })

    //listening to "send location" socket on client
    socket.on('sendlocation', ({ latitude, longitude } = {},callback) => {

        const user = getUser(socket.id);

        io.to(user.room).emit('locationmessage', generateLocation(user.username,`https://google.com/maps?q=${latitude},${longitude}`));

        callback('location shared');

    });

     //listening to "disconnect" socket on client
    socket.on('disconnect', () => {

        const user = removeUser(socket.id);

        if(user){

            io.to(user.room).emit('messages', generateChat(user.username,`${user.username} has left`));
            io.to(user.room).emit('roomdata',{room:user.room,users:getUsersByRoom(user.room)});
        }

        
    });

});

server.listen(port, () => {

    console.log(`server up on port ${port}`);
});