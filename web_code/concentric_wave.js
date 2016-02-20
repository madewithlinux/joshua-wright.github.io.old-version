/**
 * Created by j0sh on 2/19/16.
 */

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
    var pix = "rgb(";
    pix += Math.round(x) + ',';
    pix += Math.round(x) + ',';
    pix += Math.round(x);
    pix += ')';
    return pix;
}

function wave_sine(x, wave_size) {
    return (Math.sin(x / wave_size) + 1) / 2;
}
function wave_sawtooth(x, wave_size) {
    return (x / (wave_size * 6)) % 1;
}
function wave_triangle(x, wave_size) {
    return Math.abs(((x / (wave_size * 4)) % 2) - 1);
}


$(document).ready(function () {
    var main_canvas = $('#main_canvas');
    var main_canvas_0 = main_canvas[0];

    var offset = 0;

    var canvas_width = main_canvas_0.width;
    var middle = [canvas_width / 2, canvas_width / 2];
    var length = Math.sqrt(2) * canvas_width;
    var step = 2;
    var width = 3;
    var context = main_canvas_0.getContext("2d");

    function render() {

        context.clearRect(0, 0, main_canvas_0.width, main_canvas_0.height);

        //for (var x = 0; x < length; x += step) {
        //    context.beginPath();
        //    context.lineWidth = width;
        //    context.strokeStyle = colormap_basic_grayscale((offset + x / (canvas_width / 7)) % 1);
        //    context.arc(middle[0], middle[1], x, 0, 2 * Math.PI);
        //    context.stroke();
        //}
        for (var x = 0; x < canvas_width; x += step) {
            context.beginPath();
            context.lineWidth = width;
            //context.strokeStyle = colormap_basic_grayscale((offset + x / (canvas_width / 7)) % 1);
            context.strokeStyle = colormap_basic_hot((offset + x / (canvas_width / 7)) % 1);
            context.moveTo(x, 0);
            context.lineTo(x, canvas_width);
            context.stroke();
        }
        //for (var n = 0; n < 2 * Math.PI; n += 0.02) {
        //    context.beginPath();
        //    context.moveTo(middle[0], middle[1]);
        //    //context.lineWidth = width;
        //    context.lineWidth = 6;
        //    context.strokeStyle = colormap_basic_grayscale((offset + n / (2 * Math.PI)) % 1);
        //    var x = canvas_width / 2 * Math.cos(n) + canvas_width / 2;
        //    var y = canvas_width / 2 * Math.sin(n) + canvas_width / 2;
        //    context.lineTo(x, y);
        //    context.stroke();
        //}

        offset += 0.01;
        //offset++;
    }

    //render();
    var render_id = [setInterval(render, 1000 / 60)];
    console.log(render_id);
    $("#btn_pause").click(function () {
        clearInterval(render_id.pop());
        console.log(render_id);
    });
    $("#btn_render").click(function () {
        console.log(render_id);
        //if (render_id[0] != 'a') {
        //    render_id[0] = setInterval(render, 1000 / 60);
        //}
        render_id.push(setInterval(render, 1000 / 60));
    });

});