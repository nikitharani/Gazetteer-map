
    var lat=0, long=0, country_name='India',count_1='India', mymap, country_altname;
    var countries_array=[],alpha3_array=[];

    //current location     
    if('geolocation' in navigator){
        console.log('geolocation available');
        navigator.geolocation.getCurrentPosition(position =>{

            lat = position.coords.latitude;
            long = position.coords.longitude;
            console.log( lat);
            console.log( long);
            reverseGeocodingWithGoogle(lat, long);
            console.log(country_name);
            mymap.setView([lat, long], 13);
            // mymap.marker([lat, long]);
        });
        
    } else{

        console.log('geolocation not available');
    }
        //making a map and tiles
        console.log( lat);
        console.log( long);        
        
    mymap = L.map('mapid').setView([lat, long], 13);   

    L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token=pk.eyJ1IjoibmlraXRoYXJhbmkiLCJhIjoiY2tmZng1MmR5MDVqbzJ5bnZ6dTNpcHNvYSJ9.OfnnjwKssel7bB4MslNx-A', {
      maxZoom: 18,
      attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, ' +
          '<a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
          'Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
      id: 'mapbox/streets-v11',
      tileSize: 512,
      zoomOffset: -1
      }).  addTo(mymap);
    
    function applyCountryBorder(map, countryname) {
       console.log('bordr country name is :', countryname);  
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
      
            L.geoJSON(data[0].geojson, {
              color: "blue",
              weight: 2,
              opacity: 1,
              fillOpacity: 0.0 
            }).addTo(map);
          });
          console.log('applyCountryBorder -country name is :', countryname);

      }
      async function reverseGeocodingWithGoogle(latitude, longitude) {
        const response=await fetch(`https://api.opencagedata.com/geocode/v1/json?q=${latitude},${longitude}&key=4a8e59ae14f44d888ab86477950f293a`)
      const data=await response.json();
      var country_name=data['results'][0]['components']['country'];
      var country_altname=data['results'][0]['components']['ISO_3166-1_alpha-3'];
          console.log(country_name);
          console.log(country_altname);
          applyCountryBorder(mymap, country_name);
          console.log('fist play');
          displayCountryInfo(country_altname);
          console.log('second play');
       }     

    //get country api
    const countriesList = document.getElementById("countries");
    let countries; // will contain "fetched" data

// Event Listeners
// countriesList.addEventListener("change", event => displayCountryInfo(event.target.value));

countriesList.addEventListener("change", newCountrySelection);

function newCountrySelection(event) {
  console.log('this is new country func');
  displayCountryInfo(event.target.value);
  // console.log(event.target.innerText);
   applyCountryBorder(mymap,"india");
}

fetch("https://restcountries.eu/rest/v2/all")
.then(res => res.json())
.then(data => initialize(data)) 
.catch(err => console.log("Error:", err));

function initialize(countriesData) {
  countries = countriesData;
  let options = "";

  countries.forEach(country => options+=`<option value="${country.alpha3Code}">${country.name}</option>`);

  countriesList.innerHTML = options;
  // console.log('fisrt init');

  countriesList.selectedIndex = Math.floor(Math.random()*countriesList.length);
  displayCountryInfo(countriesList[countriesList.selectedIndex].value);
  // console.log('second init');

  count_1=countriesList[countriesList.selectedIndex].value;
    console.log('country name is :', count_1);
  // applyCountryBorder(mymap, count_1);
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
}