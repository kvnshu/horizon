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
    }).then(res => res.json()).then(data => {
        // console.log(data)
        var todayDate = new Date()
        var todaySunsetDate = new Date(data.locations[latitude + ", " + longitude].currentConditions.sunset)
        var nextSunsetDate = todaySunsetDate

        // get next sunset
        if(todayDate.getTime() > todaySunsetDate.getTime()){
            // console.log(todayDate.toLocaleTimeString() + "is after " + todaySunsetDate.toLocaleTimeString())
            var nextDayHours = 24 - todayDate.getHours()
            var nextSunsetDate = new Date(data.locations[latitude + ", " + longitude].values[nextDayHours].sunset)
            // console.log(`the next sunset is tomorrow at ${nextSunsetDate.toLocaleTimeString()}`)
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
        const sunsetHumidity = data.locations[latitude + ", " + longitude].values[nextSunsetHours].humidity / 100
        const sunsetCloudCover = data.locations[latitude + ", " + longitude].values[nextSunsetHours].cloudcover / 100
        const sunsetPop = data.locations[latitude + ", " + longitude].values[nextSunsetHours].pop / 100
        const sunsetPrecip = data.locations[latitude + ", " + longitude].values[nextSunsetHours - 1].precip / 100

        // console.log(sunsetHumidity)
        // console.log(sunsetCloudCover)
        // console.log(sunsetPop)

        // create model 
        var pSunset = 0;
        pSunset += 1 - sunsetHumidity
        pSunset += Math.exp(-16*((sunsetCloudCover-0.5)**2))
        // pSunset += 1 - sunsetPop
        // pSunset += sunsetPrecip/4.5

        // console.log(`The probability of a sunset is ${pSunset/2 * 100}%`)
        
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
    probElement.textContent = `The probability of a sunset is ${(Math.round(sunsetProb*100)/100)/2 * 100}%`
    cloudcoverElement.textContent = `${data.cloudcover}%`
    timeElement.textContent = (new Date(data.sunset)).toLocaleTimeString()
    temperatureElement.textContent = data.temp + "℉"

}