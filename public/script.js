const searchElement = document.querySelector('[data-city-search]')
const searchBox = new google.maps.places.SearchBox(searchElement)
searchBox.addListener('places_changed', () => {
    const place = searchBox.getPlaces()[0]
    if (place == null) return
    const latitude = place.geometry.location.lat()
    const longtitude = place.geometry.location.lng()
    fetch('/weather', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        },
        body: JSON.stringify({
            latitude: latitude,
            longtitude: longtitude
        })
    }).then(res => res.json()).then(data => {
        setWeatherData(data, place.formatted_address)
    })
})

const statusElement = document.querySelector('[data-status]')
const locationElement = document.querySelector('[data-location]')
const windElement = document.querySelector('[data-wind')
const temperatureElement = document.querySelector('[data-temperature]')
const precipitationElement = document.querySelector('[data-precipitation]')

function setWeatherData(data, place){
    locationElement.textContent = place
    statusElement.textContent = data.weather_descriptions[0]
    windElement.textContent = data.wind_speed
    temperatureElement.textContent = data.temperature
    precipitationElement.textContent = data.precip
    
}