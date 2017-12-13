<?php
#execute SQL commands
class MyDB extends SQLite3
{
    function __construct()
    {
        $this->open('../database/pio.db');
    }
}

$db = new MyDB();

$result = $db->exec($_POST['execute']);
