$(document).ready(function(){
    //table
    var table=''
    $(".table_name").each(function(){table=this.id});
    //categories array of categories to select from table
    //get form ids
    var form_fields=[]
        $('.field').each(function() {
        form_fields.push(this.id);
        });
    
    //GET URL(php/get_table.php?table=[tablename]&category[]=[category1]&category[]=[category2]&category[]=...
    var get_url='php/get_table.php?table='+table;
    //append settings to URL
    for (category in form_fields){
        get_url+='&category[]='+form_fields[category];
    }
    
    
    //set command variables
    var name="";
    var pin="";

    //load the table
    var load_table=function(url){
    $("#table").load(url,edit_table);
    };
    //function to remove rows
    var edit_table=function(){
        //make the table organizable
        $("table tbody").sortable();
        //delete rows on click
        $('.delete').click(function(){
            var sql="DELETE FROM "+table+" where id='"+this.id+"'";
            //post to process the sql in database.php
            $.post( "php/database.php", { execute: sql } );
            load_table(get_url);
        });  
    };
    
    //load table
    load_table(get_url);
          
    //format sql categories
    var sql_categories='';
    for(each in form_fields){
        sql_categories+=form_fields[each]+',';
    }
    //chop off the trailing comma
    sql_categories = sql_categories.substring(0, sql_categories.length - 1);
    console.log(sql_categories);
    
        
    //on click post the info from the form
    $('button').click(function(){
        
        
        //grab values
        var sql_values=''
        for(each in form_fields){
            sql_values+="'"+$("#"+form_fields[each]).val()+"'"+","
        }
        //chop off the trailing comma
        sql_values = sql_values.substring(0, sql_values.length - 1);
    
        //Format sql command
        sql="INSERT INTO "+table+" ("+sql_categories+") VALUES ("+sql_values+")";
        console.log(sql);
        //post command
        $.post( "php/database.php", { execute: sql  } );
        /*reset form
        for(each in form_fields){
        $("#"+form_fields[each]).val('')
        }
        */
        
        //reload table
        load_table(get_url);
    });  
      
});
