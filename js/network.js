class Socket {
  constructor() {
    game.castle.gold = -250;
    game.castle2.gold = -180;
  }

  makeDecision() {}
}

var gid = '';
var server = `${location.protocol}//${location.host}`;
var socket;

function copyOnlinelink(e) {
  const el = document.createElement('textarea');
  el.value = `${server}?gid=${socket.id}`;
  document.body.appendChild(el);
  el.select();
  document.execCommand('copy');
  document.body.removeChild(el);
  document.querySelector('.ingame-menu-online div').innerText = 'Copied!';
}

var searchGid = location.href.match('gid=(.*?)$');
if (searchGid && searchGid[1]) {
  gid = searchGid[1];
  startOnline();
}

function startOnline(e) {
  if (!socket) {
    socket = io(`${server}${gid ? `?gid=${gid}` : ''}`);
    if (e) e.innerHTML = 'Connecting...';
    setTimeout(() => {
      window.modeOnline = true;
      window.onlinegid = gid;
      socket.emit('login-event', {});
      game.startGame('twoPlayers');
      document.querySelector('.ingame-menu-online').style.display = 'none';
      if (gid) {
        document.querySelector('#player-one-buttons').style.display = 'none';
        document.querySelector('.restart-button').style.display = 'none';
      } else {
        document.querySelector('.ingame-menu-online').style.display = 'block';
      }
    }, 1000);
  }
}
