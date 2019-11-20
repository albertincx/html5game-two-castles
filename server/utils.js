const os = require('os');

function _log(text) {
  console.log(text);
}

function usedMem(event) {
  const used = process.memoryUsage().heapUsed;
  _log(`${event ? `${event} use ` : ''}${memLog(used)}`);
}

function memLog(d) {
  return `${Math.round((d / 1024 / 1024) * 100) / 100}MB`;
}

function showMem(ret = false) {
  if (!ret) {
    _log(memLog(os.freemem()));
    _log(memLog(os.totalmem()));
  }
  const used = process.memoryUsage().heapUsed;
  const r = `used ${memLog(used)}`;
  if (ret) {
    return r;
  }
  _log(r);
}

module.exports = {
  showMem,
};
