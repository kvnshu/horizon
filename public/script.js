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
        let locationData = data.locations[latitude + ", " + longitude]
        
        // get next sunset
        let todayDateTime = new Date()
        let todaySunsetDateTime = new Date(locationData.currentConditions.sunset)
        
        let nextSunsetDateTime;
        if(todayDateTime.getTime() < todaySunsetDateTime.getTime()){ // next sunset is today
            nextSunsetDateTime = todaySunsetDateTime            
        } else { // next sunset is tomorrow
            let hoursUntilNextDay = 24 - todayDateTime.getHours()
            nextSunsetDateTime = new Date(locationData.values[hoursUntilNextDay - 1].sunset)
        }

        // round sunset time for querying the nearest hourly time data
        let nextSunsetDateTimeRounded = nextSunsetDateTime
        if(nextSunsetDateTime.getMinutes() < 30){
            nextSunsetDateTimeRounded.setMinutes(0, 0, 0)
        } else {
            nextSunsetDateTimeRounded.setHours(nextSunsetDateTime.getHours() + 1)
            nextSunsetDateTimeRounded.setMinutes(0, 0, 0)
        }

        // query weather data at next sunset
        let hoursUntilNextSunset = nextSunsetDateTimeRounded.getHours() - todayDateTime.getHours()
        if(hoursUntilNextSunset < 0){
            hoursUntilNextSunset += 24
        }

        // if hoursUntilNextSunset == 0, get locationData.currentConditions
        let sunsetWeatherData;
        if(hoursUntilNextSunset == 0){
            sunsetWeatherData = locationData.currentConditions
        } else{
            sunsetWeatherData = locationData.values[hoursUntilNextSunset]
        }

        const sunsetHumidity = sunsetWeatherData.humidity
        const sunsetCloudCover = sunsetWeatherData.cloudcover
        const sunsetVisibility = sunsetWeatherData.visibility
        
        let pSunset = await predictSunset(sunsetHumidity, sunsetCloudCover, sunsetVisibility)
        pSunset = Math.round(pSunset * 10) // not sure if to use 0-10, %, or 0-100 
        setWeatherData(locationData.values[hoursUntilNextSunset], place.formatted_address, pSunset)
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
    let localeOptions = { month: "short", day: "numeric", hour: "numeric", minute: "numeric"}
    timeElement.textContent = (new Date(data.sunset)).toLocaleString(undefined, localeOptions)
    temperatureElement.textContent = data.temp + "℉"
}