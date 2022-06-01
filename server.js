if(process.env.NODE_ENV !== 'production'){
    require('dotenv').config()
}

const WEATHERSKY_API_KEY = process.env.WEATHERSKY_API_KEY
const VIRTUALCROSSING_API_KEY = process.env.VIRTUALCROSSING_API_KEY
const axios = require('axios')
const express = require('express')
const app = express()

app.use(express.json())
app.use(express.static('public'))

app.post('/weather', (req, res) => {
    const url = `https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/${req.body.latitude}%2C%20${req.body.longitude}?unitGroup=us&include=hours%2Cdays&key=${VIRTUALCROSSING_API_KEY}&contentType=json`
    // const url = `http://api.weatherstack.com/current?access_key=${WEATHERSKY_API_KEY}&query=${req.body.latitude},${req.body.longitude}&units=f`
    axios({
        url: url,
        responseType: 'json'
    }).then(data => res.json(data.data.location))
})

app.listen(8080, () => {
    console.log('Server Started');
})