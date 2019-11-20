const express = require('express');
const http = require('http');
const socketio = require('socket.io');

const SocketHelper = require('./server/socket');

const socketHelper = new SocketHelper({});
const app = express();
const httpServer = http.Server(app);
const io = socketio(httpServer);
app.get('/', function (req, res) {
  res.sendFile(__dirname + '/index.html');
});
app.use(express.static('./'));
app.get('/status', (req, res) => {
  const mem = socketHelper.getInfo();
  res.json(mem);
});

io.on('connection', (socket) => {
  socket.on('disconnect', () => {
    socketHelper.disconnect(socket);
  });

  socket.on('game-event', (data) => {
    socketHelper.processClients(socket, data, 'game-event');
  });
  socket.on('player-cmd', (data) => {
    socketHelper.processClients(socket, data, 'player-cmd');
  });
  socket.on('login-event', (data) => {
    socketHelper.login(socket, data);
  });
  socketHelper.add(socket);
});

const port = process.env.PORT;
httpServer.listen(port, () => {
  console.log(`listening on *:${port}`);
});
