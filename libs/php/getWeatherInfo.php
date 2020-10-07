<?php
	$executionStartTime = microtime(true) / 1000;

	if (empty($_REQUEST['city']))
	{$city = "delhi";}
	else {$city = $_REQUEST['city'];}
	$api_key = '93cb5e76b3c67107884e4ce968c5b551';
	
	$url = 'http://api.openweathermap.org/data/2.5/weather?q=' . $city . '&appid='.$api_key;

	
	$ch = curl_init($url);
	curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);// for http / https calls we use this line
	curl_setopt($ch, CURLOPT_RETURNTRANSFER, true); //this line helps you to store result in variable insted directly printing on browser
	curl_setopt($ch, CURLOPT_URL,$url);

	$result=curl_exec($ch);

	curl_close($ch);

	$decode = json_decode($result,true);
	// console.log($decode);	

	$output['status']['code'] = "200";
	$output['status']['name'] = "ok";
	$output['status']['description'] = "mission saved";
	$output['status']['returnedIn'] = (microtime(true) - $executionStartTime) / 1000 . " ms";

	 
	//  $output['data'] =ucwords( $decode['weather'][0]['description']);
	 $output['data'] = $decode;
	
	header('Content-Type: application/json; charset=UTF-8');

	echo json_encode($output); 

?>
