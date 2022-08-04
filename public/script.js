import {predictSunset} from './model.js'

const searchElement = document.querySelector('[data-city-search]')
const searchBox = new google.maps.places.SearchBox(searchElement)

searchBox.addListener('places_changed', () => {
    const place = searchBox.getPlaces()[0]
    if (place == null) return
    const latitude = place.geometry.location.lat()
    const longitude = place.geometry.location.lng()
    fetch('/weather', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        },
        body: JSON.stringify({
            latitude: latitude,
            longitude: longitude
        })
    }).then(res => res.json()).then(async data => {
        // get next sunset
        var todayDate = new Date()
        var todaySunsetDate = new Date(data.locations[latitude + ", " + longitude].currentConditions.sunset)
        var nextSunsetDate = todaySunsetDate
        if(todayDate.getTime() > todaySunsetDate.getTime()){
            var nextDayHours = 24 - todayDate.getHours()
            var nextSunsetDate = new Date(data.locations[latitude + ", " + longitude].values[nextDayHours].sunset)
        }

        // round off sunset time
        var roundedSunsetDate = nextSunsetDate
        if(nextSunsetDate.getMinutes() < 30){
            roundedSunsetDate.setMinutes(0, 0, 0)
        } else {
            roundedSunsetDate.setHours(nextSunsetDate.getHours() + 1)
            roundedSunsetDate.setMinutes(0, 0, 0)
        }

        // get sunset measurements
        var nextSunsetHours = roundedSunsetDate.getHours() - todayDate.getHours()
        // console.log(`${nextSunsetHours} hours until sunset.`)
        // what if nextSunsetHours == 0? get currentConditions or values[0]? or are they the same?
        const sunsetHumidity = data.locations[latitude + ", " + longitude].values[nextSunsetHours].humidity
        const sunsetCloudCover = data.locations[latitude + ", " + longitude].values[nextSunsetHours].cloudcover
        const sunsetVisibility = data.locations[latitude + ", " + longitude].values[nextSunsetHours].visibility
        
        let pSunset = await predictSunset(sunsetHumidity, sunsetCloudCover, sunsetVisibility)
        pSunset = Math.round(pSunset * 10) / 10 
        setWeatherData(data.locations[latitude + ", " + longitude].values[nextSunsetHours], place.formatted_address, pSunset)
    })
})

const locationElement = document.querySelector('[data-location]')
const probElement = document.querySelector('[data-prob]')
const cloudcoverElement = document.querySelector('[data-cloudcover]')
const timeElement = document.querySelector('[data-datetime]')
const temperatureElement = document.querySelector('[data-temperature]')

function setWeatherData(data, location, sunsetProb){
    locationElement.textContent = location
    probElement.textContent = `Predicted sunset score: ${sunsetProb}`
    cloudcoverElement.textContent = `${data.cloudcover}%`
    timeElement.textContent = (new Date(data.sunset)).toLocaleTimeString()
    temperatureElement.textContent = data.temp + "℉"
}