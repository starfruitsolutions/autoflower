$(document).ready(function () {
    //add device divs
    //rows
    $('#room_rep_widget').append('<div id="fan_row"></div>');
    $('#room_rep_widget').append('<div id="front_row"></div>');
    $('#room_rep_widget').append('<div id="back_row"></div>');
    // * This is going to be replaced, probably by persistent dragging
    
    //add images
    load_devices();
    
    //make devices draggable
    $('.draggable').resizable({
        stop: load_devices()
    });

    //Actually builds the room representation.
    // * Needs to be made dynamic
    function load_devices(e, ui) {
        $('#fan_row').empty();
        $('#front_row').empty();
        $('#back_row').empty();
        
        $('#fan_row').append('<div class="rep_draggable fan" title="Fan 1"></div>');
        // * Probably going to make the rest of these divs. Depending on how the dynamic and arrangement flow works
        $('#fan_row').append('<img class="fan rep_draggable"  src="images/fan_on.png" title="Fan 2"/>');
        $('#front_row').append('<img class="light rep_draggable" src="images/light_on.png" title="Light 3?"/>');
        $('#front_row').append('<img class="light rep_draggable" src="images/light_on.png"/>');
        $('#back_row').append('<img class="light rep_draggable" src="images/light_on.png"/>');
        $('#back_row').append('<img class="light rep_draggable" src="images/light_on.png"/>');
        
        //Make devices draggable
        $('.rep_draggable').draggable({containment: '#room_rep'});
    }
    
})
