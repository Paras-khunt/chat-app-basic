const path = require('path')
const express = require('express')
const socketio = require('socket.io')
const http = require('http')
const Filter = require('bad-words')
const { addUser, removeUser, getUser, getUsersInRoom } = require('./utils/users')
//const hbs = require('hbs')

const app = express()
const server = http.createServer(app)
const io = socketio(server)

const port = process.env.PORT || 3000

const publicDirectoryPath = path.join(__dirname, '../public')



app.use(express.static(publicDirectoryPath))


io.on('connection', (socket) => {
    console.log('New websocket connection')

    socket.on('join', (options, callback) => {

        const { error, user } = addUser({ id: socket.id, ...options })
        if (error) {
            return callback(error)
        }
        socket.join(user.room)

        socket.emit('message', 'welcome')
        socket.broadcast.to(user.room).emit('message', `${user.username} has joined the group`)
        callback()
    })



    socket.on('sendMessage', (message, callback) => {
        const user = getUser(socket.id)


        const filter = new Filter()

        if (filter.isProfane(message)) {
            return callback('this message is profane!')
        }

        io.to(user.room).emit('message', message)
        callback()
        // }
        //  else {
        //     throw new Error('user is not found')
        //  }

    })

    socket.on('sendLocation', (coords, callback) => {
        const user = getUser(socket.id)
        io.to(user.room).emit('locationmessage', `https://google.com/maps?q=${coords.latitude},${coords.longitute}`)
        callback()
    })


    socket.on('disconnect', () => {
        const user = removeUser(socket.id)

        if (user) {
            io.to(user.room).emit('message', `${user.username} has left`)
        }


    })


})



server.listen(port, () => {
    console.log(`server is runing on port ${port}`)
})