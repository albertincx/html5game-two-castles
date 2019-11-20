const utils = require('./utils');

class SocketHelper {
  constructor() {
    this.sockets = {};
    this.socketCount = 0;
  }

  getToken(socket) {
    const { gid } = socket.handshake.query;
    return gid;
  }

  notifyClients(hostId, data, skipId, ev) {
    if (!skipId) {
      let newData = data;
      if (this.sockets[hostId].gameData) {
        newData = Object.assign(this.sockets[hostId].gameData, data);
      }
      this.sockets[hostId].gameData = newData;
    }
    if (this.sockets[hostId].clients) {
      this.sockets[hostId].clients.map((soc) => {
        if (skipId && soc === skipId) return;
        if (this.sockets[soc]) this.sockets[soc].emit(ev, data);
      });
    }
  }

  processClients(socket, data, ev) {
    const token = this.getToken(socket);
    let socketId = socket.id;
    let childId = false;
    if (token && this.sockets[token]) {
      this.sockets[token].emit(ev, data);
      this.putClient(token, socket.id);
      childId = socketId;
      socketId = token;
    }
    this.notifyClients(socketId, data, childId, ev);
  }

  putClient(token, socketId) {
    if (!this.sockets[token].clients) {
      this.sockets[token].clients = [];
    } else if (this.sockets[token].clients.indexOf(socketId) !== -1) {
      return;
    }
    this.sockets[token].clients.push(socketId);
  }

  childDisconnect(childId, parentId) {
    if (this.sockets[parentId] && this.sockets[parentId].clients) {
      const index = this.sockets[parentId].clients.indexOf(childId);
      if (index !== -1) {
        this.decPlayers();
        this.sockets[parentId].clients.splice(index, 1);
      }
      if (this.sockets[parentId].removed &&
          this.sockets[parentId].clients.length === 0) {
        delete this.sockets[parentId];
      }
    }
  }

  disconnect(socket) {
    const socketId = socket.id;
    const { parentId } = this.sockets[socketId];
    if (parentId) {
      this.childDisconnect(socketId, parentId);
    }
    if (Array.isArray(this.sockets[socketId].clients)) {
      if (this.sockets[socketId].clients.length) {
        this.decPlayers();
        this.sockets[socketId].removed = 1;
        return;
      }
    }
    delete this.sockets[socketId];
  }

  add(socket) {
    this.sockets[socket.id] = socket;
  }

  login(socket, data) {
    const token = this.getToken(socket);
    if (token) {
      if (this.sockets[token]) {
        this.sockets[socket.id].parentId = token;
        this.sockets[token].emit('login-event', data);
        this.putClient(token, socket.id);
        if (this.sockets[token].gameData) {
          data.gameData = this.sockets[token].gameData;
        }
        socket.emit('login-event', data);
        this.incPlayers();
      } else {
        socket.disconnect();
      }
    } else {
      this.incPlayers();
    }
  }

  incPlayers() {
    this.socketCount += 1;
  }

  decPlayers(num = 1) {
    this.socketCount -= num;
    if (this.socketCount < 0) {
      this.socketCount = 0;
    }
  }

  getInfo() {
    const mem = utils.showMem(true);
    return {
      mem,
      players: this.socketCount,
    };
  }
}

module.exports = SocketHelper;
