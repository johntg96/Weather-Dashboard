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

// this adds a button of the search that returned a successful response from the API to the '.search-history' div
const addHistory = (search) => {
  if (!searchHistory.includes(search)) {
    searchHistory.push(search);
    historyContent.append(`<button class="history-item btn btn-secondary" onclick="searchFormSubmit('${search}')">${search}</button>`);
  }
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
      let fiveDayForecast = [];
      // The api provides 40 forecasts per 5 day period but we only want 1 per day (5 total).
      // This loop gets every 8th forecast from the 40 to make the 5 day forecast (fiveDayForecast) array.
      for (let i = 0; i < 40; i += 8) {
        fiveDayForecast.push(data.list[i])
      }
      renderForecast(data.city.name, fiveDayForecast);
    })
    .catch(function(err) {
      console.log(err);
    })
}

// openweathermap returns temp data in kelvin so this function is to convert to farenheit.
function kelvinToF(kelvinTemp) {

}

const renderForecast = (city, forecast) => {
  console.log(forecast);

  mainContent.html(`
    <h4 class="forecast-day-title">${city}</h4>
    <section class="five-day-forecast">
    </section>
  `);

  let mainContentForecast = $(`.five-day-forecast`);

  for (let i = 0; i < forecast.length; i++) {
    // this is the HTML injected to create the day
    mainContentForecast.append(`
      <div class="card">
        <div class="card-body">
          <h5 class="card-title">Day ${i + 1}</h5>
          <p class="card-text">Temperature: ${forecast[i].main.temp}</p>
          <p class="card-text">Description: ${forecast[i].weather[0].description}</p>
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

