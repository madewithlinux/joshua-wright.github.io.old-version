$(document).ready(function() {
    var c = $("#main_canvas")[0];
    var ctx = c.getContext('2d');
    var middle = [c.width / 2, c.height / 2];
    var font = "'PT Sans'";

    /*make the canvas device-width if it starts out as wider*/
    (function(){
        var canvas = $('#main_canvas')[0];
        if (window.innerWidth < canvas.width) {
            $('#clock_size')[0].value = window.innerWidth;
            canvas.width = window.innerWidth;
            canvas.height = window.innerWidth;
        }
    })();

    /**
     * compute x-coordinate of a circle
     * @param  {number} r     radius
     * @param  {number} theta angle in radians
     * @return {number}       x coordinate of point
     */
    circle_x = function(r, theta) {
        return r * Math.cos(theta);
    };

    /**
     * compute y-coordinate of a circle
     * @param  {number} r     radius
     * @param  {number} theta angle in radians
     * @return {number}       y coordinate of point
     */
    circle_y = function(r, theta) {
        return r * Math.sin(theta);
    };

    /**
     * draws the outer circle of the clock and the lines representing numbers
     * @param {bool} use_numbers  (optional) whether to use numbers. Legal values are false, "major", "all"
     * @return {none} none
     */
    draw_clock_circle = function(use_numbers) {

        function is_major_num(num) { return [0, 3, 6, 9].indexOf(Math.round(num/(2*Math.PI)*12)) > -1; };
        /*default argument*/
        if (use_numbers == null) { use_numbers = false; }
        /*draw static parts of clock*/
        /*outer circle*/
        ctx.beginPath();
        /*reset the color because if we switched from the modern clock face, the last color was blue*/
        ctx.strokeStyle = "#000";
        ctx.lineWidth = Number($('input[name=line_width]').val());
        ctx.lineCap = "round";
        ctx.arc(middle[0], middle[1], 0.99 * middle[0], 0, 2 * Math.PI, true);
        ctx.stroke();
        /*modern looking number lines*/
        for (var i = 0; i < (2 * Math.PI); i += (2 * Math.PI) / 12) {
            var line_length = 20;
            /*longer lines for the major 4 numbers*/
            if (is_major_num(i)) {
                line_length = 40;
            }
            var line_padding = 5;
            ctx.beginPath();
            ctx.font = "30px " + font;
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.lineCap = "round";
            ctx.moveTo(
                middle[0] + circle_x(middle[0] - line_length, i),
                middle[1] + circle_y(middle[1] - line_length, i)
            );
            if (use_numbers == "all" ||
                (use_numbers == "major" && is_major_num(i) ) ) {
                ctx.fillText(
                    /*weird arithmetic to convert from radians to clock numbers*/
                    (Math.round(i / (2 * Math.PI) * 12) + 2) % 12 + 1,
                    middle[0] + circle_x(0.96 * middle[0] - line_padding, i),
                    middle[1] + circle_y(0.96 * middle[1] - line_padding, i)
                    );
            } else {
                ctx.lineTo(
                    middle[0] + circle_x(0.99 * middle[0] - line_padding, i),
                    middle[1] + circle_y(0.99 * middle[1] - line_padding, i)
                );
            }
            ctx.stroke();
        }
    }

    /**
     * renders basic clock hands
     * @param  {number} hours  
     * @param  {number} minutes
     * @param  {number} seconds
     * @return {none} none
     */
    render_clock_normal = function(hours, minutes, seconds, use_numbers) {
        draw_clock_circle(use_numbers);
        $.each([seconds, minutes, hours], function(i, v) {
            // v *= -1;
            v -= 0.25;
            var line_padding = 60 * i;
            ctx.beginPath();
            ctx.lineWidth = Number($('input[name=line_width]').val());
            ctx.moveTo(middle[0], middle[1]);
            ctx.lineTo(
                middle[0] + circle_x(0.75 * middle[0] - line_padding, v * 2 * Math.PI),
                middle[1] + circle_y(0.75 * middle[1] - line_padding, v * 2 * Math.PI)
            );
            ctx.stroke();
        });
    }


    render_clock_arc = function(hours, minutes, seconds, use_numbers) {
        /*constants*/
        var thickness = c.width / 12;
        // var thickness = 100;
        var spacing = 10;
        var colors = [ "#AE81FF", "#A6E22E", "#66D9EF"];
        var maximums = [60, 60, 12];
        var max_width = middle[0] - (3 * thickness + 3 * spacing);
        var offset = 0.5 * max_width;
        var num_size = 0.4 * max_width;
        
        ctx.beginPath();
        /*draw outer circle*/
        ctx.fillStyle = "#272822"
        ctx.arc(middle[0], middle[1], middle[0], 0, 2 * Math.PI, true);
        ctx.fill();
        /*draw circular progress bars*/
        $.each([seconds, minutes, hours], function(i, v) {
            var line_padding = (thickness + spacing) * i;
            ctx.beginPath();
            ctx.strokeStyle = colors[i];
            ctx.lineWidth = thickness;
            ctx.lineCap = "round";
            ctx.arc(
                middle[0], middle[1], 
                middle[0] - spacing - (thickness/2) - line_padding, 
                -Math.PI/2, 
                (v-0.25) * 2 * Math.PI,
                false
            );
            ctx.stroke();

            if (use_numbers != "none" && use_numbers != null) {
                /*draw text in the middle*/
                ctx.beginPath();
                ctx.font = num_size + "px " + font;
                ctx.textAlign = "center";
                ctx.textBaseline = "middle";
                ctx.fillStyle = colors[i];
                /*pad with zeros using string concatenation and slicing*/
                var pad = "00"
                ctx.fillText(
                    (pad + Math.round(maximums[i]*v)).slice(-2),
                    middle[0] + (1-i)*offset, middle[1]
                );
                ctx.stroke();
            }
        });
        /*draw the colon between hours and minutes, and make it blink*/
        if (use_numbers != "none" && use_numbers != null && Math.round(seconds*60) % 2 == 0) {
            /*render only every other second*/
            ctx.beginPath();
            ctx.font = num_size + "px " + font;
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillStyle = "#fff";
            ctx.fillText(
                ":",
                middle[0] - 0.5 * offset, middle[1]
            );
            ctx.stroke();
        }

    }

    /**
     * updates the clock to the current time
     * @return {none} none
     */
    updateTime = function() {
        /*clear the canvas*/
        var size = Number($("#clock_size").val());
        c.width = size;
        middle = [c.width / 2, c.height / 2];
        c.height = size;
        ctx.clearRect(0, 0, c.width, c.height);
        var now = new Date();
        var ms = now.getMilliseconds();
        var seconds = (now.getSeconds() + ms / 1000) / 60;
        var minutes = (now.getMinutes() + seconds) / 60;
        var hours = ((now.getHours() % 12) + minutes) / 12;
        // var p = 10; /*precision*/
        // console.log("H: " + hours.toFixed(p) + "M: " + minutes.toFixed(p) + "S: " + seconds.toFixed(p));
        switch ($('input[name=clock_style]:checked').val()) {
            case "classic":
                render_clock_normal(hours, minutes, seconds, $('input[name=clock_number_style]:checked').val());
                break;
            case "modern":
                render_clock_arc(hours, minutes, seconds, $('input[name=clock_number_style]:checked').val());
        }
        /*60 fps*/
        setTimeout(updateTime, 1000 / 60);
    };
    updateTime();
});