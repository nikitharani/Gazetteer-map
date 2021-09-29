
var lat = 0, long = 0, country_name = 'India', mymap, country_alpaname = 'Ind', currency_code = 'INR', capital_city = 'delhi';
var rest_countries; // will contain "fetched" data
var latLngBounds;
var timeZones;
var borderLayer;
var layerGroup;

//current location     
if ('geolocation' in navigator) {
  console.log('geolocation available');
  navigator.geolocation.getCurrentPosition(position => {

    lat = position.coords.latitude;
    long = position.coords.longitude;
    reverseGeocoding(lat, long);
    mymap.setView([lat, long], 5);
    // mymap.marker([lat, long]);
  });

} else {

  console.log('geolocation not available');
}
//making a map and tiles
console.log(lat);
console.log(long);

//creating map
create_map();

//pointing to html dropdown list coutries
const countriesList = document.getElementById("countries");

// Event Listeners
countriesList.addEventListener("change", newCountrySelection);

//get countries info from Restcountries Api
fetch("https://restcountries.com/v2/all")
  .then(res => res.json())
  .then(data => initialize(data))
  .catch(err => console.log("Rest Countries fetch Error:", err));

function initialize(countriesData) {
  rest_countries = countriesData;
  let options = "";

  for (i = 0; i < rest_countries.length; i++) {
    if (i == 0) {
      options += '<option value="" disabled selected>Choose your country</option>';
    }
    options += `<option value="${i}">${rest_countries[i].name}</option>`;
  }

  countriesList.innerHTML = options;

}

function displayCountryInfo(countryByAlpha3Code) {
  const countryData = rest_countries.find(country => country.alpha3Code === countryByAlpha3Code);
  // options+=`<option value="">${countryData.name}</option>`;
  document.querySelector("#flag-container img").src = countryData.flag;
  document.querySelector("#flag-container img").alt = `Flag of ${countryData.name}`;
  document.getElementById("capital").innerHTML = countryData.capital;
  document.getElementById("dialing-code").innerHTML = `+${countryData.callingCodes[0]}`;
  document.getElementById("population").innerHTML = countryData.population.toLocaleString("en-US");
  document.getElementById("currencies").innerHTML = countryData.currencies.filter(c => c.name).map(c => `${c.name} (${c.code})`).join(", ");
  document.getElementById("region").innerHTML = countryData.region;
  document.getElementById("subregion").innerHTML = countryData.subregion;
  document.getElementById("area").innerHTML = countryData.area;
  document.getElementById("country-name").innerHTML = countryData.name;
  document.getElementById("time-zones").innerHTML = countryData.timezones; // create in html


}

function newCountrySelection(event) {

  var indx = parseInt(event.target.value);
  if (country_name != rest_countries[indx].name) {
    var loc = window.location.pathname;
    var dir = loc.substring(0, loc.lastIndexOf('/'));

    country_alpaname = rest_countries[indx].alpha3Code;
    country_name = rest_countries[indx].name;
    currency_code = rest_countries[indx]["currencies"][0]['code'];
    capital_city = rest_countries[indx].capital;

    // Remove previous border if exists
    if(borderLayer){
    layerGroup.removeLayer(borderLayer);}

    displayCountryInfo(country_alpaname);
    applyCountryBorder(mymap, country_name);

    xmlhttp_php("libs/php/getCurrencyInfo.php?curr_code=" + currency_code, displayCurrencyInfo);
    xmlhttp_php("libs/php/getWeatherInfo.php?city=" + capital_city, displayWeatherInfo);
    xmlhttp_php("libs/php/getCountryIntro.php?country=" + country_name, displayCountryIntro);

  }
}

// get currencies using ajax call
function displayCurrencyInfo(xhttp) {
  var myArr = JSON.parse(xhttp.responseText);
  document.getElementById("currency").innerHTML = myArr.data + " " + currency_code;

}

// get weather using ajax call
function displayWeatherInfo(xmlhttp) {

  var weatherInfo = JSON.parse(xmlhttp.responseText);
  document.getElementById("weathercity").innerHTML = weatherInfo.data.name;
  document.getElementById("mintemp").innerHTML = weatherInfo.data.main.temp_max;
  document.getElementById("maxtemp").innerHTML = weatherInfo.data.main.temp_min;
  document.getElementById("wind").innerHTML = weatherInfo.data.wind.speed;
  document.getElementById("humidity").innerHTML = weatherInfo.data.main.humidity;
  document.getElementById("description").innerHTML = weatherInfo.data.weather[0].description;

}

//get geolocation country from opencage
function displayCurrentCountryLocationInfo(xmlhttp) {

  var CurrentCountryInfo = JSON.parse(xmlhttp.responseText);
  country_alpaname = CurrentCountryInfo.data.results[0].components.alpha_3;

  // Display geolocation country in dropdown
  var restIndex = getIndex(country_alpaname);
  var restCountry_name = rest_countries[restIndex].name;//getCountryName(country_alpaname);
  var $display_country = $('#countries');
  $display_country.find('option[value="' + restIndex.toString() + '"]').prependTo(restCountry_name);
  $display_country.val(restIndex);

  // creating evt(json object) to match with newCountrySelection function argument 
  var evt = { "target" : {"value":restIndex}};
  // display country context
  newCountrySelection(evt);
}

// get countryIntro using ajax call(factbook.json)
function displayCountryIntro(xhttp) {
  var countryIntro = JSON.parse(xhttp.responseText);
  document.getElementById("IntroCountry").innerHTML = countryIntro.data.introduction;
  document.getElementById("gdp").innerHTML = "$" + (countryIntro.data.gdp.value).toString() + " billion (in 2017)";
  document.getElementById("economy").innerHTML = countryIntro.data.economy;

  // console.log(countryIntro.data);

  document.getElementById("languages").innerHTML = countryIntro.data.people.languages;
  document.getElementById("religions").innerHTML = countryIntro.data.people.religions;
  document.getElementById("ethnic-groups").innerHTML = countryIntro.data.people.ethnic_groups;
  document.getElementById("death-rate").innerHTML = countryIntro.data.people.death_rate;
  document.getElementById("birth-rate").innerHTML = countryIntro.data.people.birth_rate;
  document.getElementById("unemployment").innerHTML = countryIntro.data.people.unemployment_rate;
  document.getElementById("sex-ratio").innerHTML = countryIntro.data.people.sex_ratio;

}

// base php ajax call function
function xmlhttp_php(url, func) {
  var xmlhttp = new XMLHttpRequest();
  xmlhttp.onreadystatechange = function () {
    if (this.readyState == 4 && this.status == 200) {
      func(this);
    }
    else if (this.status != 200 && this.status != 0) {
      console.log(this.status);
      console.log(`cannot get information from :${url}`);
    }
  };
  xmlhttp.open("GET", url, true);
  xmlhttp.send();
}

function getCapital(alphaCode) {
  for (i = 0; i < rest_countries.length; i++) {
    if (!(rest_countries[i].alpha3Code.localeCompare(alphaCode))) {
      return rest_countries[i].capital
    }
  }

  return "";

}
function getTimeZones(alphaCode) {
  for (i = 0; i < rest_countries.length; i++) {
    if (!(rest_countries[i].alpha3Code.localeCompare(alphaCode))) {
      return rest_countries[i].timezones
    }
  }

  return "";

}
function getCountryName(alphaCode) {
  for (i = 0; i < rest_countries.length; i++) {
    if (!(rest_countries[i].alpha3Code.localeCompare(alphaCode))) {
      return rest_countries[i].name
    }
  }

  return "";

}
function getIndex(alphaCode) {
  for (i = 0; i < rest_countries.length; i++) {
    if (!(rest_countries[i].alpha3Code.localeCompare(alphaCode))) {
      return i
    }
  }

  return "";

}

function create_map() {
  mymap = L.map('mapid').setView([lat, long], 5);

  L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token=pk.eyJ1IjoibmlraXRoYXJhbmkiLCJhIjoiY2tmZng1MmR5MDVqbzJ5bnZ6dTNpcHNvYSJ9.OfnnjwKssel7bB4MslNx-A', {
    maxZoom: 18,
    attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, ' +
      '<a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
      'Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
    id: 'mapbox/streets-v11',
    tileSize: 512,
    // This map option disables world wrapping.
    continuousWorld: false,
    // This option disables loading tiles outside of the world bounds. By default, it is false.
    noWrap: true,
    zoomOffset: -1
  }).addTo(mymap);

  layerGroup = new L.LayerGroup();
  layerGroup.addTo(mymap);

  //delete
  L.easyButton('fa-search', function () {
    $("#Background").modal("show");
  }, 'Country Introduction').addTo(mymap);

  L.easyButton('fa-info-circle', function () {
    $("#Info").modal("show");
  }, 'Country Information').addTo(mymap);

  L.easyButton('fa-users', function () {
    $("#PeopleInfo").modal("show");
  }, 'People').addTo(mymap);

  L.easyButton('fa-cloud', function () {
    $("#Weather").modal("show");
  }, 'Weather').addTo(mymap);

  L.easyButton('fa-coins', function () {
    $("#Economy").modal("show");
    $('#Economy').modal('handleUpdate');
  }, 'Economy').addTo(mymap);

  L.easyButton('fa-clock', function () {
    $("#Timezones").modal("show");
  }, 'Timezones').addTo(mymap);


}

function applyCountryBorder(map, countryname) {
  jQuery
    .ajax({
      type: "GET",
      dataType: "json",
      url:
        "https://nominatim.openstreetmap.org/search?country=" +
        countryname.trim() +
        "&polygon_geojson=1&format=json"
    })
    .then(function (data) {
      latLngBounds = data[0].boundingbox;
      borderLayer = L.geoJSON(data[0].geojson, {
        color: "blue",
        weight: 2,
        opacity: 1,
        fillOpacity: 0.0
      }).addTo(map);
      layerGroup.addLayer(borderLayer);
      map.fitBounds([
        [parseFloat(latLngBounds[0]), parseFloat(latLngBounds[2])],
        [parseFloat(latLngBounds[1]), parseFloat(latLngBounds[3])]]);
    });


}

function reverseGeocoding(latitude, longitude) {
  xmlhttp_php("libs/php/getCurrentCountry.php?lat=" + latitude + "&lng=" + longitude, displayCurrentCountryLocationInfo);
}
