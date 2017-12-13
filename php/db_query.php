<?php

/**
 * Grab database temperatures
 */
class MyDB extends SQLite3
{
    function __construct()
    {
        $this->open('../database/pio.db');
    }
}

$db = new MyDB();
#query names and values
$values=$db->query("SELECT * FROM ".$_POST['table']);

#row array
$rows=array();

#loop through values by row and column
while($row = $values->fetchArray(SQLITE3_ASSOC)){
    $rows[] = $row;
}
#echo the table as JSON
#Return result to jTable
$qryResult = array();
$qryResult['rows'] = $rows;
echo json_encode($qryResult);
?>
