$('document').ready(function (){
    //Starts the clock
    function startTime() {
        var today=new Date();
        var h=today.getHours();
        var m=today.getMinutes();
        var s=today.getSeconds();
        m = checkTime(m);
        s = checkTime(s);
        $("#date").html(h+":"+m+":"+s);
        var t = setTimeout(function(){startTime()},500);
    }
    
    //Adds the zeros to the minutes and seconds
    function checkTime(i) {
        if (i<10) {i = "0" + i};  // add zero in front of numbers < 10
        return i;
    }
    
//not utilized yet
// * Window Manager
//
//    var new_window = function (name) {
//        $('#main').append('<div id="'+name+'_card"</div>');
//        $('#'+name+'_card').resizable();
//        $('#'+name+'_card').draggable();
//        $('#'+name+'_card').append('<div id="'+name+'_bar"></div>');
//        $('#'+name+'_card_bar').append(name);
//        $('#'+name+'_card').append('<div id="'+name+'_card_contents"></div>');
//        $('#'+name+'_card_contents').load('pages/shell/shell.html');
//    }
//

    //This handles the toggling of the card info popout
    var current ='';
    var toggle_card_info = function (info_name, type) {
        if ($('#growroom_card_info_container').length){
            $('#growroom_card_info_container').empty();
            if (info_name === current){
                current = '';
                return;
            }
        }
        switch (type) {
            case "config":
                current = info_name;
                $('#growroom_card_info_container').append('<div id="growroom_'+info_name+'"></div>');
                db_query(function (result) {
                    $("#growroom_"+info_name).html(make_table(result, "growroom_"+info_name, type));
                    $('.table_remove_row_button').click(function (){
                        delete_id = $(this).attr("id");
                        console.log("table="+info_name+"&id="+delete_id);
                        // JSON data = {table: info_name, id:delete_id}
                        // * Evolve post requests to use json instead of url formating
                        $.post('/delete',"table="+info_name+"&id="+delete_id);
                    });
                    }, info_name);
                break;
            case "view":
                current = info_name;
                $('#growroom_card_info_container').append('<div id="growroom_'+info_name+'"></div>');
                //db_query(function (result) {$("#growroom_"+info_name).html(make_table(result, "growroom_"+info_name, type))}, info_name);
                target = 'growroom_'+info_name
                
                db_query(function (result) {
                    var data = get_temp_data_min(result)
                    $('#growroom_'+info_name).jqplot(data, { 
                          title:'Temperatures (Minute)',
                          axes:{yaxis:{max:30, min:20, autoscale:true, tickInterval:1}, xaxis:{autoscale:true, renderer:$.jqplot.DateAxisRenderer}},
                          grid: {
                            gridLineColor: '#000000',
                            background: 'rgba(0,0,0,0.18)',
    //                        borderWidth: 3
                            },
                          series:[{color:'#AFD402'}],
                          textColor:"#41581C",
                          height:500,
                          width:800
                    });
                }, info_name);
                
                var live_plot_timeout = setTimeout(function(){
                    console.log("Update plot");
                    db_query(function (result) {
                        $('#growroom_'+info_name).data('jqplot').data = get_temp_data_min(result);
                        $('#growroom_'+info_name).data('jqplot').replot();
                    }, info_name);
                }, 5000);
                    
                
//                db_query(function (result) {
//                    
//                    var temp_plot = $.jqplot(target,  get_temp_data_min(result),
//                    { 
//                          title:'Temperatures (Minute)',
//                          axes:{yaxis:{min:0, max:60}, xaxis:{renderer:$.jqplot.DateAxisRenderer}},
//                          series:[{color:'#5FAB78'}],
//                          autoscale:true
//                    });
//                }, info_name);
                
                break;
        }
    }
    
    //This is for the time and status bar at the top of the page
    $('body').append('<div id="tabs" class="shadow"></div>');
    $('body').append('<div id="status_bar" class="shadow"></div>');
    $('#status_bar').append('<div id="date"></div>');
    //$('#status_bar').append('<img src="images/database_up.png" id="db_status"/>')
    
    $('body').append('<div id="main"></div>');
    
    //Interval to update time
    startTime();
    
    //This is the tab bar on the right side
    // * Need to decide on final bar locations and setup
    $('#tabs').append('<ul></ul>');
    $('#tabs > ul').append('<li><img id="schedules" src="images/schedule.png"></li>');
    $('#tabs > ul').append('<li><img id="temperature" src="images/temperature.png"></li>');
    $('#tabs > ul').append('<li><a href="pages/schedule/schedule.html"><img src="images/server_config.png"></a></li>');
    $('#tabs > ul').append('<li><a href="pages/device_config/device_config.html"><img src="images/device_config.png"></a></li>');
    $('#tabs > ul').append('<li><img id = "shell" src="images/terminal.png"></a></li>');
    $('#shell').click(function () {new_window("shell")});
    $('#tabs > ul').append('<li><a href=""><img src="images/historical.png"></a></li>');
    
    //add the growroom card and makes it draggable and resizable
    // * Dynamicization
    // * Window Manager
    $('#main').append('<div id="growroom_card"></div>');
    $('#growroom_card').resizable();
    $('#growroom_card').draggable();
    
    //This starts building the growroom card
    // * Dynamicization
    // * Window Manager
    $('#growroom_card').append('<div id="card_bar" class="shadow"></div>');
    $('#card_bar').append('Growroom');
    
    //This is where one would add "minimize buttons"
    //    $('#card_bar').append('<img src="images/minimize.png" />');
    $('#growroom_card').append('<div id="growroom_card_contents"></div>');
    
    //Build card panel
    // * Window Manager
    $('#growroom_card_contents').append('<div id="growroom_card_panel" class="shadow card_background"></div>')
    $('#growroom_card_panel').append('<ul></ul>');
    $('#growroom_card_panel > ul').append('<li><img id="growroom_schedule_button" src="images/schedule.png"></li>');
    $('#growroom_schedule_button').click(function () {toggle_card_info("TIMERS", "config")});
    $('#growroom_card_panel > ul').append('<li><img id="growroom_device_config_button" src="images/device_config.png"></li>');
    $('#growroom_device_config_button').click(function () {toggle_card_info("PIN_STATES", "config")});
    $('#growroom_card_panel > ul').append('<li><img id="growroom_historical_data_button" src="images/historical.png"></li>');
    $('#growroom_historical_data_button').click(function () {toggle_card_info("HISTORICAL_TEMPERATURE", "view")});
    $('#growroom_card_panel > ul').append('<li><img id="growroom_temperature_control_button" src="images/temperature.png"></li>');
    $('#growroom_temperature_control_button').click(function () {toggle_card_info("TEMP_CONTROL", "config")});
    $('#growroom_card_panel > ul').append('<li><img id="growroom_dht_sensor_button" src="images/server_config.png"></li>');
    $('#growroom_dht_sensor_button').click(function () {toggle_card_info("SENSORS", "config")});
    
    //Add Sensor summary div and load the widgets
    $('#growroom_card_contents').append('<div id="growroom_sensor_summary" class="shadow card_background"></div>');
    $('#growroom_sensor_summary').load('widgets/dht_sensor/dht_sensor.html');
    
    //Setup container for historical data popout
    $('#growroom_card').append('<div id="growroom_historical_data_container"></div>');
    
    //Add container for card info popout
    $('#growroom_card_contents').append('<div id="growroom_card_info_container" class="shadow card_background"></div>');
    
    //setup and add room_rep div and widgets
    $('#growroom_card_contents').append('<div id="room_rep" class="shadow card_background"></div>');
    $('#room_rep').append('<div id="growroom_room_rep"></div>');
    $('#room_rep').load('widgets/room_rep/room_rep.html');
})
