<?php
//echo function
  function writeMsg($stringText, $writeflag=false) {
    if ($writeflag)
    {
    echo "$stringText <br>";
    }
  }

  // Delete or update old data function  
  function delDb_data($sql_connection, $table)
  {
    $del_query = "DELETE FROM $table";
    $flag = mysqli_query($sql_connection, $del_query);
    if ($flag)
    {
      global $display_echo;
      writeMsg("Deleted table successfully",$display_echo);
    }
  }

  // send entries to database function  
  function sendDb_data($sql_connection, $table, $apiData){
    global $currency_code;
    $query = '';
    $currencyValue = 0;
    $currency_object = $apiData['rates'];//json_decode($data, true); //Convert JSON String into PHP Array
    $time_stamp = $apiData['timestamp'];
    foreach($currency_object as $key => $value) //Extract the Array Values by using Foreach Loop
    {          
      $query .= "INSERT INTO $table (time_stamp, currency_code , currency_rate) VALUES ($time_stamp, '$key', $value);";  
      if (!strcmp($key,$currency_code))
          {
            $currencyValue = $value;
          }       
    }    
    
    if(mysqli_multi_query($sql_connection, $query)) //Run Mutliple Insert Query
    {
      global $display_echo;
      writeMsg("employee data inserted",$display_echo);      
    }
    return $currencyValue;
}

function getDb_data($sql_connection, $table, $currency_code)
    {
      $retrive ="SELECT time_stamp, currency_code, currency_rate FROM $table";
      $curr_result = mysqli_query($sql_connection, $retrive);
      $currencyValue = 0;
      global $display_echo;
      global $time_database;

      if (mysqli_num_rows($curr_result) > 0) {
        // output data of each row
        while($row = mysqli_fetch_assoc($curr_result)) {
          // echo "currency_code: " . $row["currency_code"]. " - currency_rate: " . $row["currency_rate"]. "<br>";
          $time_database = $row["time_stamp"];
          if (!strcmp($row["currency_code"],$currency_code))
          {
            $currencyValue = $row["currency_rate"];
            break;
          }
        }
        writeMsg("Found entries in database",$display_echo);
      } else {
        writeMsg("No entries in database",$display_echo);      
      }

      return $currencyValue;
  }

  function getTimeDiffInMins($current_dateTime,$previous_dateTime)
  {
    //--------------------------------------------------------------//
    // Find the time difference b/w current & previous time request//
    //--------------------------------------------------------------//

    $start_date = new DateTime($current_dateTime);
    $since_start = $start_date->diff(new DateTime($previous_dateTime));
  
    //To get the total number of minutes:
    $minutes = $since_start->days * 24 * 60;
    $minutes += $since_start->h * 60;
    $minutes += $since_start->i;
    return $minutes;
  }

   // Get currency json from API
   function getCurrencyApi(){
    $url='https://openexchangerates.org/api/latest.json?app_id=0f69fa8292e147f7ba4e3d02a4fa52f0';    

    $ch = curl_init($url);
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_URL,$url);

    $result=curl_exec($ch);

    curl_close($ch);

    $decode = json_decode($result,true);	
    return $decode;

   }

  // global variables here
  $display_echo = false;
  $table_name = "my_table";
  $myFile = "curr_data.json";
  $useApiData=true;
  $current_dateTime = gmdate("Y-m-d H:i:s");
  $time_database = 0;

  $executionStartTime = microtime(true) / 1000;
  if (empty($_REQUEST['curr_code']))
  {$currency_code = "AUD";}
  else {$currency_code = $_REQUEST['curr_code'];}

    // // write json to a file
    // if(file_put_contents($myFile, $result))
    //  {
    //   writeMsg('Data successfully saved to Json file',$display_echo);
    //  }
    // else {writeMsg('error in saving data to json file',$display_echo);}      

    // //Get data from existing json file
    // $result = file_get_contents($myFile);

    //connection to Database
    $connect = mysqli_connect("3306", "zv0a53oapkf1iys1", "l1s23a5lxmd3hxjh", "ru6bg7210tmn6vac"); //Connect PHP to MySQL Database
    if (!$connect){
      die("Connection failed:".mysql_connect_error());
    }
    writeMsg("connection established",$display_echo);

    // retrive data from database
    $output['data'] = getDb_data($connect, $table_name, $currency_code);  
    $previous_dateTime = gmdate("Y-m-d H:i:s", $time_database);
    $minutes = getTimeDiffInMins($current_dateTime,$previous_dateTime);
    writeMsg("minutes: $minutes",$display_echo);
    writeMsg("current_dateTime: $current_dateTime",$display_echo);
    writeMsg("previous_dateTime: $previous_dateTime",$display_echo);

    if($minutes>180){
      //get currency using Api
      $decode=getCurrencyApi();
      //  Delete or update old data
      delDb_data($connect, $table_name); 
      // send entries to database
      $output['data']=sendDb_data($connect, $table_name,$decode);
    }  

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
      $output['status']['code'] = "200";
      $output['status']['name'] = "ok";
      $output['status']['description'] = "Currency information";
      $output['status']['returnedIn'] = (microtime(true) - $executionStartTime) / 1000 . " ms";
      header('Content-Type: application/json; charset=UTF-8');    
      echo json_encode($output); 


?>
     
 

