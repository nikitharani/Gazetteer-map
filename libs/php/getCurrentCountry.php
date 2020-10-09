<?php
	$executionStartTime = microtime(true) / 1000;

	if (empty($_REQUEST['lat']))
	{
        $latitude=51.509865;
        $longitude= -0.118092;
    }
    else 
    {
        $latitude=$_REQUEST['lat'];
        $longitude= $_REQUEST['lng'];
    }
	$api_key = getenv('opencage_api_key', $local_only = TRUE );

	
    $url = 'https://api.opencagedata.com/geocode/v1/json?q=' . $latitude.','.$longitude.'&key='.$api_key;

	
	$ch = curl_init($url);
	curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);// for http / https calls we use this line
	curl_setopt($ch, CURLOPT_RETURNTRANSFER, true); //this line helps you to store result in variable insted directly printing on browser
	curl_setopt($ch, CURLOPT_URL,$url);

	$result=curl_exec($ch);

	curl_close($ch);

    $decode = json_decode($result,true);
    $decode['results'][0]['components']['ISO_3166-1_alpha-3'];
	// console.log($decode);	

	$output['status']['code'] = "200";
	$output['status']['name'] = "ok";
	$output['status']['description'] = "mission saved";
	$output['status']['returnedIn'] = (microtime(true) - $executionStartTime) / 1000 . " ms";

	 
	//  $output['data'] =ucwords( $decode['weather'][0]['description']);
     $output['data'] = $decode;
     $output['data']['results'][0]['components']['alpha_3'] = $decode['results'][0]['components']['ISO_3166-1_alpha-3'];
	
	header('Content-Type: application/json; charset=UTF-8');

	echo json_encode($output); 

?>
