
    var lat=0, long=0, country_name='India', mymap, country_alpaname='Ind',currency_code='INR',capital_city='delhi';
    var countries; // will contain "fetched" data
    var latLngBounds;
    var timeZones;
    
    //current location     
    if('geolocation' in navigator){
        console.log('geolocation available');
        navigator.geolocation.getCurrentPosition(position =>{

            lat = position.coords.latitude;
            long = position.coords.longitude;
            reverseGeocodingWithGoogle(lat, long);
            mymap.setView([lat, long], 5);
            // mymap.marker([lat, long]);
        });
        
    } else{

        console.log('geolocation not available');
    }
        //making a map and tiles
        console.log( lat);
        console.log( long);      
      
    create_map();

    function create_map()
    {
      mymap = L.map('mapid').setView([lat, long], 5);   

      L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token=pk.eyJ1IjoibmlraXRoYXJhbmkiLCJhIjoiY2tmZng1MmR5MDVqbzJ5bnZ6dTNpcHNvYSJ9.OfnnjwKssel7bB4MslNx-A', {
        maxZoom: 18,
        attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, ' +
            '<a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
            'Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
        id: 'mapbox/streets-v11',
        tileSize: 512,
        zoomOffset: -1
        }).  addTo(mymap);
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
          .then(function(data) {
            latLngBounds = data[0].boundingbox;      
            L.geoJSON(data[0].geojson, {
              color: "blue",
              weight: 2,
              opacity: 1,
              fillOpacity: 0.0 
            }).addTo(map);
            map.fitBounds([
              [parseFloat(latLngBounds[0]),parseFloat(latLngBounds[2])],
              [parseFloat(latLngBounds[1]),parseFloat(latLngBounds[3])]]);
          });
          

      }
      function reverseGeocodingWithGoogle(latitude, longitude) 
      {
        xmlhttp_php("libs/php/getCurrentCountry.php?lat=" + latitude +"&lng="+ longitude, displayCurrentCountryInfo);
      }     

    //get country api
    const countriesList = document.getElementById("countries");

// Event Listeners
// countriesList.addEventListener("change", event => displayCountryInfo(event.target.value));

countriesList.addEventListener("change", newCountrySelection);

function newCountrySelection(event) {
    
  var indx = parseInt(event.target.value);
  if (country_name != countries[indx].name)  
  {  
    var loc = window.location.pathname;
    var dir = loc.substring(0, loc.lastIndexOf('/'));

    country_alpaname = countries[indx].alpha3Code;
    country_name = countries[indx].name;
    currency_code = countries[indx]["currencies"][0]['code'];
    capital_city = countries[indx].capital;
 
    mymap.remove();
    create_map();
    displayCountryInfo(country_alpaname);
    applyCountryBorder(mymap,country_name);

    xmlhttp_php("libs/php/index.php?curr_code=" + currency_code, displayCurrencyInfo);
    xmlhttp_php("libs/php/getWeatherInfo.php?city=" + capital_city, displayWeatherInfo);
    xmlhttp_php("libs/php/getCountryIntro.php?country=" + country_name, displayCountryIntro);
    
  }
}

fetch("https://restcountries.eu/rest/v2/all")
.then(res => res.json())
.then(data => initialize(data)) 
.catch(err => console.log("Rest Countries fetch Error:", err));

function initialize(countriesData) {
  countries = countriesData;
  let options = "";

  for(i =0; i<countries.length; i++)
  {
    options+=`<option value="${i}">${countries[i].name}</option>`;
  }

  countriesList.innerHTML = options;
  
}

function displayCountryInfo(countryByAlpha3Code) {
  const countryData = countries.find(country => country.alpha3Code === countryByAlpha3Code);
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

// get currencies using ajax call
function displayCurrencyInfo(xhttp){    
        var myArr = JSON.parse(xhttp.responseText);
        document.getElementById("currency").innerHTML = myArr.data +" "+ currency_code;

}

// get weather using ajax call
function displayWeatherInfo(xmlhttp){
  
      var weatherInfo = JSON.parse(xmlhttp.responseText);
      document.getElementById("weathercity").innerHTML = weatherInfo.data.name;
      document.getElementById("mintemp").innerHTML = weatherInfo.data.main.temp_max ;
      document.getElementById("maxtemp").innerHTML = weatherInfo.data.main.temp_min ;
      document.getElementById("wind").innerHTML = weatherInfo.data.wind.speed ;
      document.getElementById("humidity").innerHTML = weatherInfo.data.main.humidity ;
      document.getElementById("description").innerHTML = weatherInfo.data.weather[0].description ;

}

//get geolocation country from opencage
function displayCurrentCountryInfo(xmlhttp){
  
  var CurrentCountryInfo = JSON.parse(xmlhttp.responseText);
  country_name = CurrentCountryInfo.data.results[0].components.country;
  country_alpaname = CurrentCountryInfo.data.results[0].components.alpha_3;        
  currency_code = CurrentCountryInfo.data.results[0].annotations.currency.iso_code;      
  capital_city = getCapital(country_alpaname);
  timeZones = getTimeZones(country_alpaname);

  applyCountryBorder(mymap, country_name);          
  displayCountryInfo(country_alpaname);

  xmlhttp_php("libs/php/index.php?curr_code=" + currency_code, displayCurrencyInfo);
  xmlhttp_php("libs/php/getWeatherInfo.php?city=" + capital_city, displayWeatherInfo);
  xmlhttp_php("libs/php/getCountryIntro.php?country=" + country_name, displayCountryIntro);

}

// get countryIntro using ajax call
function displayCountryIntro(xhttp){    
  var countryIntro = JSON.parse(xhttp.responseText);
  document.getElementById("country-intro").innerHTML = countryIntro.data.introduction;
  document.getElementById("gdp").innerHTML = "$" + (countryIntro.data.gdp.value).toString()+ " billion (in 2017)"; 
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

function xmlhttp_php(url, func)
{
  var xmlhttp = new XMLHttpRequest();
  xmlhttp.onreadystatechange = function() {
    if (this.readyState == 4 && this.status == 200) {
      func(this);
    }
    else if(this.status != 200 && this.status !=0 ){
      console.log(this.status);
      console.log(`cannot get information from :${url}`);
    }
  };
  xmlhttp.open("GET", url, true);
  xmlhttp.send();
}

function getCapital(alphaCode)
{
  for(i =0; i<countries.length; i++)
  {
    if (!(countries[i].alpha3Code.localeCompare(alphaCode)))
    {
      return countries[i].capital
    }
  }

  return "";
  
}
function getTimeZones(alphaCode)
{
  for(i =0; i<countries.length; i++)
  {
    if (!(countries[i].alpha3Code.localeCompare(alphaCode)))
    {
      return countries[i].timezones
    }
  }

  return "";
  
}



  