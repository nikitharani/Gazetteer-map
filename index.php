<?php
  function writeMsg($stringText, $writeflag) {
    if ($writeflag)
    {
    echo "$stringText <br>";
    }
  }

    $executionStartTime = microtime(true) / 1000;
    $url='https://openexchangerates.org/api/latest.json?app_id=0f69fa8292e147f7ba4e3d02a4fa52f0';
    $currency_code = $_REQUEST['curr_code'];
    // $currency_code = "AUD";
    $display_echo = false;


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


    //connection to Database
    $connect = mysqli_connect("localhost", "root", "", "currency_db"); //Connect PHP to MySQL Database
    if (!$connect){
      die("Connection failed:".mysql_connect_error());
    }
    writeMsg("connection established",$display_echo);

    $query = '';
    $table_data = '';

    // Delete or update old data
    $del_query = "DELETE FROM my_table";
    $flag = mysqli_query($connect, $del_query);
    if ($flag)
    {
      writeMsg("Deleted table successfully",$display_echo);
    }

    // send entries to database
    $currency_object = $decode['rates'];//json_decode($data, true); //Convert JSON String into PHP Array
    foreach($currency_object as $key => $value) //Extract the Array Values by using Foreach Loop
    {          
      $query .= "INSERT INTO my_table (currency_code , currency_rate) VALUES ('$key', $value);";   
      // $query2 .= "CREATE EVENT test_event_03
      //             ON SCHEDULE EVERY 1 MINUTE
      //             STARTS CURRENT_TIMESTAMP
      //             ENDS CURRENT_TIMESTAMP + INTERVAL 1 HOUR
      //             DO
      //             INSERT INTO messages(message,created_at)
      //             VALUES('Test MySQL recurring Event',NOW())";

      if (!strcmp($key,$currency_code))
      {
        $output['data'] = $value;
        break;
      }

    }    
    if(mysqli_multi_query($connect, $query)) //Run Mutliple Insert Query
    {
      writeMsg("employee data inserted",$display_echo);      
    }

    // retrive data from database
    $retrive = "SELECT FROM my_table";
    $curr_result = mysqli_query($connect, $retrive);

    // close sql connection
      $connect_close  = mysqli_close($connect);
      if ($connect_close)
      {
        writeMsg("connection closed successfuly",$display_echo);      
      }
      else {
        writeMsg("Error in closing :connection ".mysqli_error($connect), $display_echo);
      }

      // output for ajax
      header('Content-Type: application/json; charset=UTF-8');    
      echo json_encode($output); 


?>
     
 

