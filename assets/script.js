// global variables
const searchBox = $(`#search-box`);
const searchBtn = $(`#search-btn`);
const historyContent = $(`.history`);

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
  var apiUrl = `${openWeatherMapRootUrl}/geo/1.0/direct?q=${search}&limit=5&appid=${openWeatherMapApiKey}`;

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
  console.log(`working!`);
}

// after search button is clicked, prevent browser refresh and handle search form submission
searchBtn.on(`click`, (e) => {
  e.preventDefault();
  searchFormSubmit(searchBox.val());
});