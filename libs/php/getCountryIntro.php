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

  // Initialise country_data
  $country_data=[];

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
  if (empty($country_data)) // if country not found in fact book
  {
    $output['status']['code'] = "100";
    $output['status']['name'] = "No data!";
    $output['data'] = "Country Info Not Available!";
  }
  else {
    $output['data']['introduction']=$country_data['introduction']['background'];

    $output['data']['gdp']['value']=($country_data['economy']['gdp']['purchasing_power_parity']['annual_values'][0]['value'])/pow(10,9);
    $output['data']['economy']=$country_data['economy']['overview'];
    // $output['data']['gdp']['units']=$country_data['economy']['gdp']['purchasing_power_parity']['annual_values'][0]['units'];

    $lan ="";
    $counter = 0;
    foreach ($country_data['people']['languages']['language'] as $lang)
    {
      
      $counter++;
      if (count($country_data['people']['languages']['language']) == $counter)
      {
        $lan .= $lang["name"];
      }
      else{
        $lan .= $lang["name"].", ";
      }
    }

    $eth = "";
    $counter = 0;
    foreach ($country_data['people']['ethnic_groups']['ethnicity'] as $ethnic)
    {
      $counter++;
      if (count($country_data['people']['ethnic_groups']['ethnicity']) == $counter)
      {
        $eth .= $ethnic["name"];      }
      else{
        $eth .= $ethnic["name"].", ";      }
      
    }

    $rel = "";
    $counter = 0;
    foreach ($country_data['people']['religions']['religion'] as $relig)
    {
      $counter++;
      if (count($country_data['people']['religions']['religion']) == $counter)
      {
        $rel .= $relig["name"];     }
      else{
        $rel .= $relig["name"].", ";      }
      
    }

    $output['data']['people']['languages'] = $lan;
    $output['data']['people']['ethnic_groups'] = $eth;
    $output['data']['people']['religions'] = $rel;
    $output['data']['people']['death_rate'] = $country_data['people']['death_rate']['deaths_per_1000_population'];
    $output['data']['people']['birth_rate'] = $country_data['people']['birth_rate']['births_per_1000_population'];
    $output['data']['people']['unemployment_rate'] = $country_data['people']['youth_unemployment']['total']['value'];
    $output['data']['people']['sex_ratio'] = $country_data['people']['sex_ratio']['total_population']['value']; //html(males/female)

    $output['status']['code'] = "200";
    $output['status']['name'] = "ok";
  }

  $output['status']['description'] = "country introduction";
  $output['status']['returnedIn'] = (microtime(true) - $executionStartTime) / 1000 . " ms";
  header('Content-Type: application/json; charset=UTF-8');    
  echo json_encode($output); 
  // echo json_encode(decode['countries']['australia']);
  // echo json_encode(array_keys(decode['countries']));









?>