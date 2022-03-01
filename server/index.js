// Backend for chat app

const express = require('express');
const app = express();
const socketio = require('socket.io');
const http = require('http');
const cors = require('cors');

const {addUser, removeUser, getUser, getUsersInRoom} = require('./users');
const PORT = process.env.PORT || 5000;
// socket-io server initialization
const server = http.createServer(app);
const io = socketio(server);

const router = require('./router');
app.use(router);
app.use(cors());

// We are managing the socket that just connected.
io.on('connection', (socket) => {
    // this socket is client side socket
    socket.on('join', ({name,room}, callback) => {
        const {error, user} = addUser({id:socket.id, name: name, room: room});

        // if(error){
        //     return callback(error);
        // }
        
        // only to the user.
        // emit is for showing the stuff on frontend
        socket.emit('message', {user: 'admin', text: `${user.name}, welcome to ${user.room}`});
        
        // only to other people in a particular room except the user.
        socket.broadcast.to(user.room).emit('message', {user: 'Admin', text: `${user.name} has joined`});
        
        // joins in a room
        socket.join(user.room);
        io.to(user.room).emit('roomData', {room: user.room, users: getUsersInRoom(user.room)})
        // callback();
    })

    // on is expecting
    socket.on('sendMessage', (message, callback)  => {
        const user = getUser(socket.id);

        // like this we are emitting the message on frontend
        if(user){
            io.to(user.room).emit('message', {user: user.name, text: message});
            io.to(user.room).emit('roomData', {user: user.name, users: getUsersInRoom(user.room)});
            
            callback();
        }
        
    });
    socket.on('disconnect', () => {
        // here we have to remove user
        const user = removeUser(socket.id);


        if(user){
            io.to(user.room).emit('message', {user :'Admin', text: `${user.name} has left`});
        }
    });

});



server.listen(PORT, () => {
    console.log(`Server is listening to ${PORT}`);
})