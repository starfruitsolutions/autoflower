$(document).ready(function () {
    $('#dht_sensor_widget').append('<div id="temperatures" class="draggable"></div>');
    
    $('#dht_sensor_widget').append('<div id="humidity" class="draggable"></div>');
    
    get_dht_data();
    setInterval(get_dht_data, 30000);
    
    function get_dht_data(){
        function db_callback(result){
            data = $.parseJSON(result["1"].DATA);
            var f = (data.temperature * (9.0/5.0) + 32).toFixed(1);
            $('#temperatures').html('<div id="temp_f" class="sensor_value">' + f + '</div>');
            
            $("#temperatures").append('<div id="temp_c" class="sensor_value">' + data.temperature + '</div>');
            
            $("#humidity").html('<div id="hum" class="sensor_value">' + data.humidity + '</div>');
            
            $('#temp_c').append("&deg;C");
            $('#temp_f').append("&deg;F");
            $('#hum').append('%');
        }
        db_query(db_callback, "SENSORS");
    }
})
