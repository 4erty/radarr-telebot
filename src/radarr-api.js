const { radarr } = require('../config/config.json')

const importProps = {
  addOptions: {
    'monitor': 'movieOnly',
    'searchForMovie': true
  },
  monitored: true,
  qualityProfileId: 3,
  minimumAvailability: 'released',
  rootFolderPath: '/media/Video',
}

async function lookUpByName (name) {
  try {
    const res = await fetch(`${radarr.host}:${radarr.port}/api/v3/movie/lookup?term=${name}`, {
      method: 'GET',
      headers: new Headers({
        "X-API-KEY": radarr.apiKey,
        'Content-Type': 'application/json',
      })
    })

    return await res.json()
  } catch(err) {
    console.log('lookUpByName', err)
  }
}

async function importMovie (movie) {
  const requestBody = [{ ...movie, ...importProps }]
  
  try {
    const res = await fetch(`${radarr.host}:${radarr.port}/api/v3/importlist/movie`, {
      method: 'POST',
      headers: new Headers({
        "X-API-KEY": radarr.apiKey,
        'Content-Type': 'application/json',
      }),
      body: JSON.stringify(requestBody)
    })

    return await res.json()
  } catch(err) {
    console.log('addMovie', err)
  }
}

module.exports = {
  lookUpByName,
  importMovie
}
