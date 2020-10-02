<?php

    $executionStartTime = microtime(true) / 1000;
    $url='https://openexchangerates.org/api/latest.json?app_id=0f69fa8292e147f7ba4e3d02a4fa52f0';

    $ch = curl_init($url);
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_URL,$url);

    $result=curl_exec($ch);

    curl_close($ch);

    $decode = json_decode($result,true);	

    $output['status']['code'] = "200";
    $output['status']['name'] = "ok";
    $output['status']['description'] = "Currency information";
    $output['status']['returnedIn'] = (microtime(true) - $executionStartTime) / 1000 . " ms";
    $output['data'] = $decode;

    header('Content-Type: application/json; charset=UTF-8');
    
     // echo json_encode($output); 
    // $connect = mysqli_connect("localhost", "root", "", "currency_db");
    // echo 'connection established';
 
    //connection to Database

    $connect = mysqli_connect("localhost", "root", "", "currency_db"); //Connect PHP to MySQL Database
    if (!$connect){
      die("Connection failed:".mysql_connect_error());
    }

    echo "connection established <br>";
    $query = '';
    $table_data = '';

    // Delete or update old data
    $del_query = "DELETE FROM my_table";
    $flag = mysqli_query($connect, $del_query);
    if ($flag)
    {
      echo "Deleted table successfully <br>";
    }


    $currency_object = $decode['rates'];//json_decode($data, true); //Convert JSON String into PHP Array
    foreach($currency_object as $key => $value) //Extract the Array Values by using Foreach Loop
    {          
      $query .= "INSERT INTO my_table (country_alpha3 , currency_rate) VALUES ('$key', $value);";   

    }    
    if(mysqli_multi_query($connect, $query)) //Run Mutliple Insert Query
    {
      echo 'employee data inserted';
    }

    // close sql connection
      $connect_close  = mysqli_close($connect);
      if ($connect_close)
      {
        echo "connection closed successfuly";
      }
      else {
        echo "Error in closing :connection ".mysqli_error($connect);
      }


?>
     
 

