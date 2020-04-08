const express = require('express')
const socketio = require('socket.io')
const path = require('path')
const http = require('http')
const { v4: uuidv4 } = require('uuid');
const app = express()
const port = 3000

var srv = http.createServer(app);
var io = socketio(srv);

var intervals = {}

io.on('connection', (socket) => {
    console.log('a user connected');
    socket.on("join", (id) => {
        socket.join(id)
    });
    socket.on("play", (data) => {
        var video_id = data.url.split('v=')[1];
        var ampersandPosition = video_id.indexOf('&');
        if (ampersandPosition != -1) {
            video_id = video_id.substring(0, ampersandPosition);
        }
        io.in(data.room).emit("load", video_id)

        if (intervals[data.room]) {
            clearTimeout(intervals[data.room])
        }
        intervals[data.room] = setTimeout(() => {
            io.in(data.room).emit("play")
        }, 6 * 1000);
    })
});

app.use(express.static('public'));

app.get('/', (req, res) => {
    if (!req.query.id) {
        res.redirect(`/?id=${uuidv4().substr(0, 5)}`)
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

srv.listen(port, "0.0.0.0", () => console.log(`Example app listening at http://localhost:${port}`))