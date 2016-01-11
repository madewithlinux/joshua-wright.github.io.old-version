function colormap_basic_hot(input) {
    /* expects 0 <= input <= 1, then translates to 0 <= x <= 255 */
    var x = 255 * input;
    var pix = "rgb(";
    /* red */
    if (x > 94) {
        pix += '255';
    } else {
        pix += Math.round(51.0 * x / 19.0);
    }
    pix += ',';

    /* green */
    if (x > 190) {
        pix += '255';
    } else if (x > 95) {
        pix += Math.round(85.0 * x / 32.0 - 8075.0 / 32.0);
    } else {
        pix += '0';
    }
    pix += ',';

    /* blue */
    if (x > 191) {
        pix += Math.round(255.0 * x / 64.0 - 48705.0 / 64.0);
    } else {
        pix += '0';
    }
    pix += ')';
    return pix;
}
function colormap_basic_hsv(input) {
    var x = 360 * input;
    var pix = "hsl(";
    pix += x;
    pix += ',100%,50%)';
    return pix;
}
function colormap_basic_grayscale(input) {
    /* expects 0 <= input <= 1, then translates to 0 <= x <= 255 */
    var x = 255 * input;
    var pix = "rgb(" ;
    pix += Math.round(x) + ',';
    pix += Math.round(x) + ',';
    pix += Math.round(x);
    pix += ')';
    return pix;
}

function rose(k, t) {
    /*this is the function that calculates the points on the parametric rose*/
    return [
        Math.cos(k * t) * Math.cos(t),
        Math.cos(k * t) * Math.sin(t)
    ];
}

function basic_plot(color, lineWidth, clear) {
    if (color == null) {
        /*if unspecified, draw in black*/
        color = "rgb(0,0,0)";
    }
    if (clear == null) {
        clear = true;
    }
    if (lineWidth == null) {
        lineWidth = $('#input_linewidth')[0].value;
    }
    /*this function re-plots the rose when one of the inputs changes*/
    var canvas = $('#main_canvas')[0];
    var width  = $('#res_x')[0].value;
    var height = $('#res_y')[0].value;

    /*don't reset the canvas height if we don't need to*/
    if (canvas.width != width) {
        canvas.width  = width;
    }
    if (canvas.height != height) {
        canvas.height  = height;
    }
    var context = canvas.getContext("2d");
    /*get n and d for using in our equation*/
    var input_n = document.getElementById('input_n').value;
    var input_d = document.getElementById('input_d').value;
    var k = input_n / input_d;

    if (clear) {
        context.clearRect(0, 0, canvas.width, canvas.height);
    }

    middle = [width/2, height/2];
    scale = Math.min(width, height) / 2.1;
    /*use a threshold to determine when we've gone all the way around*/
    var threshold = 1e-4;   
    var point;
    context.beginPath();
    var old_point = [1, 0];
    
    context.beginPath();
    context.strokeStyle = color;
    context.moveTo(middle[0] + scale * old_point[0], middle[1] + scale * old_point[1]);
    context.lineWidth = lineWidth;

    var step = 0.03*Math.PI;
    var i = step;
    do {
        point = rose(k, i);
        context.lineTo(middle[0] + scale * point[0], middle[1] + scale * point[1]);
        old_point = point;
        i += step;
    } while ( (Math.abs(point[0] - 1) > threshold) || (Math.abs(point[1]) > threshold));
    context.stroke();
}

function plot_range(current) {
    /*we need to round this because if it's a fraction the modulo will never ==0*/
    var max_len = Math.round(1.2 * Math.max($('#res_x')[0].value, $('#res_y')[0].value) / 2);
    if (current == null) {
        var canvas = $('#main_canvas')[0];
        var context = canvas.getContext("2d");
        /*clear the canvas because we're going to ask plot() not to clear it*/
        context.clearRect(0, 0, canvas.width, canvas.height);
        /*determine how far we need to draw stuff out*/
        var start = max_len;
        if ($('#hide_while_rendering')[0].checked) {
            /*hide the canvas while we render onto it, because the bright flashes can hurt your eyes*/
            $('#main_canvas').hide();
        }
    } else {
        var start = current;
    }
    for (var i=start; i > 0; i--) {
        /*divide by 'wavyness' or else the value varies much too rapidly*/
        var color_index = (Math.sin(i/$("#input_wavyness")[0].value) + 1) / 2;
        var color;
        if ($("#colormap_gray")[0].checked) {
            color = colormap_basic_grayscale(color_index);
        } else if ($("#colormap_hsv")[0].checked) {
            color = colormap_basic_hsv(color_index);
        } else if ($("#colormap_hot")[0].checked) {
            color = colormap_basic_hot(color_index);
        }
        basic_plot(color, i, false);
        /*update progress on percentages*/
        /*same reason for rounding here as above*/
        if (i % Math.round(max_len / 100) == 0) {
            $("#progress").html("Progress: " + Math.round(100 -  100 * i / max_len) + "%");
            /*100 - because we start at the far end*/
            /*In order to let the UI update, we must run the rest of the math later*/
            setTimeout(function(){plot_range(i-1);}, 0);
            console.log(100 -  100 * i / max_len);
            return;
        }
    }
    /*this will only run when we are completely done, since we return in the if-block above*/
    $("#progress").html("");
    $('#main_canvas').show();
}

function plot(){
    /*decide if it's a regular plot or wavy filled in one*/
    if ($("#waves")[0].checked) {
        plot_range();
    } else {
        basic_plot();
    }
};


$(document).ready(function(){
    (function(){
        var canvas = $('#main_canvas')[0];
        // var context = canvas.getContext("2d");
        if (window.innerWidth < canvas.width) {
            $('#res_x')[0].value = window.innerWidth;
            $('#res_y')[0].value = window.innerWidth;
            canvas.width = window.innerWidth;
            canvas.height = window.innerWidth;
        }
    })();
    plot();
});