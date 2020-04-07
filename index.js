const express = require('express')
const socketio = require('socket.io')
const path = require('path')
const http = require('http')
const { v4: uuidv4 } = require('uuid');
const app = express()
const port = 3000

var srv = http.createServer(app);
var io = socketio(srv);

io.on('connection', (socket) => {
    console.log('a user connected');
    socket.on("join", (id) => {
        socket.join(id)
    });
    socket.on("loadVideo", (data) => {
        var video_id = data.url.split('v=')[1];
        var ampersandPosition = video_id.indexOf('&');
        if (ampersandPosition != -1) {
            video_id = video_id.substring(0, ampersandPosition);
        }
        io.in(data.room).emit("loadVideo", video_id)
    })
    socket.on("playVideo", (data) => {
        io.in(data.room).emit("playVideo")
    })
});

app.use(express.static('public'));

app.get('/', (req, res) => {
    if (!req.query.id) {
        res.redirect(`/?id=${uuidv4()}`)
    } else {
        res.sendFile(path.join(__dirname, './pages/index.html'));
    }
})

app.get('/api/:uuid', (req, res) => {
    const room = req.params.uuid
    res.json({
        room: room
    })
})

srv.listen(port, () => console.log(`Example app listening at http://localhost:${port}`))