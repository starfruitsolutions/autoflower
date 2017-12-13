//query the db
var db_query = function (callback, tablename) {
    var query = tablename;
    console.log("Query : " + query);
    var result = '';
    $.ajax({
        type: "POST",
        url : '/table',
        cache:false,
        data: query,
        success: function(response){
            console.log("DB QUERY RESPONSE: " + response);
            callback($.parseJSON(response));
        },
        error: function(html) {
            console.log("!Error!");
        }
    });
}

//clear a table of all rows
var db_clear_table = function (callback, tablename) {
        var clear_table_cmd = '';
        var query = "execute='"+command+"'";
        $.ajax({
            type: "POST",
            url : 'php/db_execute.php',
            cache:false,
            data: query
        }).done(function(html){
            console.log(html);
        });
}

//execute sql command
// * Might modify this to be able to add rows, etc. Hide the nasty sql statements from the frontend files.
var db_execute = function (command) {
    var query = "execute='"+command+"'";
    $.ajax({
        type: "POST",
        url : 'php/db_execute.php',
        cache:false,
        data: query
    }).done(function(html){
        console.log(html);
    });
}

//Build an HTML table with json from database
// * Type is config or view. It is used to display different types of data (editable, vs info only)
var make_table = function (data, name, type){
    //dynamic table names
    table = "<table id='"+name+"_table'><tr>";
    
    //build headings
    $.each(data["1"], function(k,v){
        table += "<th>"+k+"</th>";
    });
    
    //builds rows
    $.each(data, function(i, e){
        table += "<tr>"
        $.each(e, function(k,v){
            table += "<td>"+v+"</td>";
        });
        
        if (type === "config"){
            //add button column
            table += '<td><img src="../images/minimize.png" class="table_remove_row_button" id='+e.ID+'></td>';
            table += '</tr>';
        }
    });
    
    
    if (type === "config"){
        //build new items row
        table += '<tr>';
        $.each(data["1"], function(k,v){
                table += '<td><input type="text"/></td>';
            });
        
        //the add new row button
        table += '<td><img src="../images/maximize.png"/></td>';
        table += '</tr>';
        
        table += "</tr></table>";
    }
    
    return table;
}

var get_temp_data_min = function (db, name, type) {
    plot_data = [[]];
//    db = {
//    "1":{"ID":1,"SENSOR":"1","TEMPERATURE":"27","HUMIDITY":"41","TIME":"2014-06-24 13:24:05"},
//    "2":{"ID":1,"SENSOR":"1","TEMPERATURE":"28","HUMIDITY":"41","TIME":"2014-06-24 13:25:05"},
//    "3":{"ID":1,"SENSOR":"1","TEMPERATURE":"23","HUMIDITY":"41","TIME":"2014-06-24 13:26:05"},
//    "4":{"ID":1,"SENSOR":"1","TEMPERATURE":"25","HUMIDITY":"41","TIME":"2014-06-24 13:27:05"},
//    "5":{"ID":1,"SENSOR":"1","TEMPERATURE":"27","HUMIDITY":"41","TIME":"2014-06-24 13:28:05"},
//    "6":{"ID":1,"SENSOR":"1","TEMPERATURE":"27","HUMIDITY":"41","TIME":"2014-06-24 13:29:05"},
//    };
//    
//    data = {};
//    $.each(db, function(i,e){
//        if 
//    });
    $.each(db, function(i,e) {
            date = new Date(e.TIME);
            
            temperature = e.TEMPERATURE;
            humidity = e.HUMIDITY;
            
            plot_data[0].push([date ,temperature]);
    });
    
    console.log(plot_data);
    return plot_data;
}
