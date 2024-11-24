const { qBitTorrent } = require('../config/config.json')

async function torrentsGetInfo(lastCheck) {
  const res = await fetch(`${qBitTorrent.host}:${qBitTorrent.port}/api/v2/torrents/info`)
  const data = await res.json()
  return findCompleted(data)
}

function findCompleted(data, lastCheck) {
  return data.filter(torrent => torrent.completion_on * 1000 >= lastCheck) 
}

module.exports = {
  torrentsGetInfo
}