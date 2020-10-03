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
  function sendDb_data($sql_connection, $table,$apiData){
    delDb_data($sql_connection, $table);
    $currency_object = $apiData['rates'];//json_decode($data, true); //Convert JSON String into PHP Array
    foreach($currency_object as $key => $value) //Extract the Array Values by using Foreach Loop
    {          
      $query .= "INSERT INTO $table (currency_code , currency_rate) VALUES ('$key', $value);";         
    }    
    
    if(mysqli_multi_query($sql_connection, $query)) //Run Mutliple Insert Query
    {
      global $display_echo;
      writeMsg("employee data inserted",$display_echo);      
    }
}

function getDb_data($sql_connection, $table, $currency_code)
    {
      $retrive ="SELECT currency_code, currency_rate FROM $table";
      $curr_result = mysqli_query($sql_connection, $retrive);
      $currencyValue = 0;
      global $display_echo;

      if (mysqli_num_rows($curr_result) > 0) {
        // output data of each row
        while($row = mysqli_fetch_assoc($curr_result)) {
          // echo "currency_code: " . $row["currency_code"]. " - currency_rate: " . $row["currency_rate"]. "<br>";
          if (!strcmp($row["currency_code"],$currency_code))
          {
            $currencyValue = $row["currency_rate"];
            break;
          }
        }
      } else {
        writeMsg("No entries in database",$display_echo);      
      }

      return $currencyValue;
  }


  $display_echo = false;
  $table_name = "my_table";

    $executionStartTime = microtime(true) / 1000;
    $url='https://openexchangerates.org/api/latest.json?app_id=0f69fa8292e147f7ba4e3d02a4fa52f0';
    if (empty($_REQUEST['curr_code']))
    {$currency_code = "AUD";}
    else {$currency_code = $_REQUEST['curr_code'];}

    

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

    //  Delete or update old data
    // delDb_data($connect, $table_name);    
    

    // send entries to database
    $milliseconds = 5000;
    $seconds=(int)$milliseconds/1000;
    while(true)
    {
      sendDb_data($connect, $table_name,$decode);
      sleep($seconds);
    }
    

    // retrive data from database
    $output['data'] = getDb_data($connect, $table_name, $currency_code);  


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
     
 

