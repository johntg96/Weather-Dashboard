// TO-DO: Implement local storage for saving search history to browser

// global variables
const searchBox = $(`#search-box`);
const searchBtn = $(`#search-btn`);
const historyContent = $(`.history`);
const mainContent = $(`#content`);

// api variables
const openWeatherMapRootUrl = 'https://api.openweathermap.org';
const openWeatherMapApiKey = '38d00f5de5ce24fe5aa235ca54fea8f2';

// an array of all successful weather location searches (ones returned data)
let searchHistory = [];

// this adds a button of the search that returned a successful response from the API to the '.search-history' div
const addHistory = (search) => {
  if (!searchHistory.includes(search)) {
    searchHistory.push(search);
    historyContent.append(`<button class="history-item btn btn-secondary" onclick="searchFormSubmit('${search}')">${search}</button>`);
    localStorage.setItem('searchHistoryStorage', JSON.stringify(searchHistory));
  }
}

// update searchHistory array with weather locations that have been previously saved in local storage
if(localStorage.getItem(`searchHistoryStorage`) !== null) {
  searchHistoryStorage = JSON.parse(localStorage.getItem(`searchHistoryStorage`));
  for (let i = 0; i < searchHistoryStorage.length; i++) {
    searchHistory.push(searchHistoryStorage[i]);
    addHistory(searchHistoryStorage[i]);
    historyContent.append(`<button class="history-item btn btn-secondary" onclick="searchFormSubmit('${searchHistoryStorage[i]}')">${searchHistoryStorage[i]}</button>`);
  }
}

const searchFormSubmit = (search) => {
  fetchCoords(search);
}

// preliminary step of fetching location coordinates so we can use them to fetch the weather
const fetchCoords = (search) => {
  let apiUrl = `${openWeatherMapRootUrl}/geo/1.0/direct?q=${search}&limit=5&appid=${openWeatherMapApiKey}`;

  fetch(apiUrl)
    .then(function (response) {
      return response.json();
    })
    .then(function (data) {
      if (!data[0]) {
        alert('Location not found');
      } else {
        addHistory(search);
        fetchWeather(data[0]);
      }
    })
    .catch(function (err) {
      console.error(err);
    });
}

// fetches the weather with the previously fetched location coordinates
const fetchWeather = (coordsData) => {
  // api.openweathermap.org/data/2.5/forecast?lat={lat}&lon={lon}&appid={API key}
  let lat = coordsData.lat;
  let lon = coordsData.lon;
  console.log(`latitude: ${lat}, longitude:${lon}`);
  let apiUrl = `${openWeatherMapRootUrl}/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${openWeatherMapApiKey}`;

  fetch(apiUrl)
    .then(function(response) {
      return response.json();
    })
    .then(function(data) {
      console.log(data);
      let fiveDayForecast = [];
      // The api provides 40 forecasts per 5 day period but we only want 1 per day (5 total).
      // This loop gets every 8th forecast from the 40 to make the 5 day forecast (fiveDayForecast) array.
      // this INCLUDES the current day forecast.
      for (let i = 0; i < 40; i += 8) {
        fiveDayForecast.push(data.list[i])
      }
      // add the last day of the forecast to the list (day 5)
      fiveDayForecast.push(data.list.pop());

      renderForecast(data.city.name, fiveDayForecast);
    })
    .catch(function(err) {
      console.log(err);
    })
}

// openweathermap returns temp data in kelvin so this function is to convert to farenheit.
function kelvinToF(kelvinTemp) {
  return parseInt((kelvinTemp -273.15) * 9 / 5 + 32);
}

const renderForecast = (city, forecast) => {
  console.log(forecast);

  mainContent.html(`
    <h4 class="row justify-content-center mt-3 forecast-day-title">${city}</h4>
    <section class="row justify-content-center five-day-forecast">
    </section>
  `);

  let mainContentForecast = $(`.five-day-forecast`);

  // the date is the current date, then return string 'today'
  function checkCurrentDay(day) {
    console.log(day);
    let currentDay = dayjs().format(`dddd`);
    let forecastDate = forecast[day].dt_txt
    let forecastDay = dayjs(forecastDate).format('dddd');
    if (forecastDay === currentDay) {
      return `Today`;
    } else {
      return dayjs(forecast[day].dt_txt).format("dddd[, ]MMM D");
    }
  }

  for (let i = 0; i < forecast.length; i++) {
    // this is the HTML injected to create the day
    mainContentForecast.append(`
      <div class="card mb-2" style="width: 80%">
        <div class="card-body">
          <h5 class="card-title" style="font-family:'Bebas Neue',sans-serif;">${checkCurrentDay(i)}</h5>
          <p class="card-text">Temperature: <span style="font-family: monospace;"><strong>${kelvinToF(forecast[i].main.temp)}°F</strong></span></p>
          <p class="card-text">Description: ${forecast[i].weather[0].description}</p>
          <p class="card-text">Wind: <span style="font-family: monospace;font-size: 14px;">${forecast[i].wind.speed}</span></p>
          <p class="card-text">Humidity: <span style="font-family: monospace;font-size: 14px;">${forecast[i].main.humidity}</span></p>
        </div>
      </div>
    `)
  }
}

// after search button is clicked, prevent browser refresh and handle search form submission
searchBtn.on(`click`, (e) => {
  e.preventDefault();
  searchFormSubmit(searchBox.val());
});

