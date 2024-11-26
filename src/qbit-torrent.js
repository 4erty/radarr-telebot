const { qBitTorrent } = require('../config/config.json')

async function torrentsGetInfo(lastCheck) {
  try {
    const res = await fetch(`${qBitTorrent.host}:${qBitTorrent.port}/api/v2/torrents/info`)
    const data = await res.json()
    return findCompleted(data, lastCheck)
  } catch(err) {
    console.log(err)
    return []
  }
}

function findCompleted(data, lastCheck) {
  return data.filter(torrent => torrent.completion_on * 1000 >= lastCheck) 
}

module.exports = {
  torrentsGetInfo
}