console.log("NODE ENV: ", process.env.NODE_ENV)

if(process.env.NODE_ENV !== 'production'){
    require('dotenv').config()
}

const VISUALCROSSING_API_KEY = process.env.VISUALCROSSING_API_KEY
const axios = require('axios')
const express = require('express')
const app = express()
const port = process.env.PORT || 8080

app.use(express.json())
app.use(express.static('public'))

// app.get("/", (req, res) => {
//     res.render('index.html');
// })

app.post('/weather', (req, res) => {
    const url = `https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/`
              + `${req.body.latitude}%2C%20${req.body.longitude}?unitGroup=us`
              + `&include=hours%2Cdays`
              + `&key=${VISUALCROSSING_API_KEY}`
              + `&contentType=json`

    
    const url2 = `https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/weatherdata/forecast?locations=`
               + `${req.body.latitude}%2C%20${req.body.longitude}`
               + `&includeAstronomy=true`
               + `&aggregateHours=1`
               + `&unitGroup=us`
               + `&forecastDays=2`
               + `&shortColumnNames=false`
               + `&contentType=json`
               + `&key=${VISUALCROSSING_API_KEY}`
    
    axios({
        url: url2,
        responseType: 'json'
    }).then(data => res.json(data.data))
    .catch(err => {
        console.error(err);
    });
})

app.listen(port, () => {
    console.log(`Server started on port ${port}`);
})