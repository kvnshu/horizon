if(process.env.NODE_ENV !== 'production'){
    require('dotenv').config()
}

const WEATHERSKY_API_KEY = process.env.WEATHERSKY_API_KEY
const VISUALCROSSING_API_KEY = process.env.VISUALCROSSING_API_KEY
const axios = require('axios')
const express = require('express')
const app = express()

app.use(express.json())
app.use(express.static('public'))

app.post('/weather', (req, res) => {
    const url = `https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/${req.body.latitude}%2C%20${req.body.longitude}?unitGroup=us&include=hours%2Cdays&key=${VISUALCROSSING_API_KEY}&contentType=json`
    const url2 = `https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/weatherdata/forecast?locations=${req.body.latitude}%2C%20${req.body.longitude}&aggregateHours=1&unitGroup=us&forecastDays=7&shortColumnNames=false &contentType=json&key=${VISUALCROSSING_API_KEY}`
    axios({
        url: url2,
        responseType: 'json'
    }).then(data => res.json(data.data))
})

app.listen(8080, () => {
    console.log('Server Started');
})