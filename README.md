# Project GaZetteer 

GaZetteer is a single page application that is designed to be mobile first, but work equally as well on desktops which provides information about countries geographical, economical, demographics and weather information.

On loading, the system determines the current location of the device and display a map showing the country that the user is currently in. 

![GaZetteer](/images/weblayout.png?raw=true)
 
The following Api's are used to retrive the countries information using AJAX call 
1) Open Weather
2) Rest Countries
3) Open Exchange Rates
4) Opencage
5) Open street map

Tasks are scheduled on the server to retrieve exchange rates from API on a frequent basis (every 3hrs) and stores it in the database to reduce reliance on the API.

## Credits
Country facts are obtained from https://github.com/iancoleman/cia_world_factbook_api






 





