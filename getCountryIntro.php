<?php
//Get data from existing json file
$myFile =  'factbook.json';

// using constant variable to get data from json file
define("result",file_get_contents($myFile));
define("decode",json_decode(result,true));

$executionStartTime = microtime(true) / 1000;
  if (empty($_REQUEST['country']))
  {$countryname = "india";}
  else {$countryname = $_REQUEST['country'];}

$country_data['introduction']['background'] = "Country Info Not Available!";
foreach (decode['countries'] as $key => $value) {

    $countryname_fact = (str_replace("_"," ",strtolower($key)));
    $countryname_request = strtolower($countryname);

    if (strpos($countryname_request, $countryname_fact) !== false) 
          {
            $country_data = $value['data'];
            break;
          }   

}


  // output for ajax
  $output['data']=$country_data['introduction']['background'];
  $output['status']['code'] = "200";
  $output['status']['name'] = "ok";
  $output['status']['description'] = "country introduction";
  $output['status']['returnedIn'] = (microtime(true) - $executionStartTime) / 1000 . " ms";
  header('Content-Type: application/json; charset=UTF-8');    
  echo json_encode($output); 
//   echo json_encode(decode['countries']['united_kingdom']);
//   echo json_encode(array_keys(decode['countries']));









?>