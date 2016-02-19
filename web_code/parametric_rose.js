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

function rose(k, t) {
    /*this is the function that calculates the points on the parametric rose*/
    return [
        Math.cos(k * t) * Math.cos(t),
        Math.cos(k * t) * Math.sin(t)
    ];
}

$(document).ready(function () {

    /*jQuery selectors
     * cache these outside worker functions so that worker functions are really fast*/
    var main_canvas = $('#main_canvas');
    var main_canvas_0 = main_canvas[0];
    var res_x_0 = $('#res_x')[0];
    var res_y_0 = $('#res_y')[0];
    var hide_while_rendering = $('#hide_while_rendering');
    var input_wavyness = $("#input_wavyness");
    var colormap_gray_0 = $("#colormap_gray")[0];
    var colormap_hsv_0 = $("#colormap_hsv")[0];
    var colormap_hot_0 = $("#colormap_hot")[0];
    var wave_type_sine_0 = $("#wave_type_sine")[0];
    var wave_type_sawtooth_0 = $("#wave_type_sawtooth")[0];
    var wave_type_triangle_0 = $("#wave_type_triangle")[0];
    var progress_0 = $("#progress")[0];
    var input_linewidth_0 = $('#input_linewidth')[0];
    var input_step_0 = $("#input_step")[0];
    var input_n_0 = $("#input_n")[0];
    var input_d_0 = $("#input_d")[0];
    var do_waves_0 = $("#waves")[0];


    function basic_plot(color, lineWidth) {
        /*this function re-plots the rose when one of the inputs changes*/

        var context = main_canvas_0.getContext("2d");
        /*get n and d for using in our equation*/
        var input_n = input_n_0.value;
        var input_d = input_d_0.value;
        var k = input_n / input_d;

        var middle = [main_canvas_0.width / 2, main_canvas_0.height / 2];
        var scale = Math.min(main_canvas_0.width, main_canvas_0.height) / 2.1;

        /*use a threshold to determine when we've gone all the way around*/
        var threshold = 1e-4;
        var old_point = [1, 0];

        context.beginPath();
        context.strokeStyle = color;
        context.moveTo(middle[0] + scale * old_point[0], middle[1] + scale * old_point[1]);
        context.lineWidth = lineWidth;

        var step = Number(input_step_0.value) * Math.PI;
        var i = step;
        var new_point;
        do {
            new_point = rose(k, i);
            context.lineTo(middle[0] + scale * new_point[0], middle[1] + scale * new_point[1]);
            old_point = new_point;
            i += step;
            /*while we are not approximately back at our starting point*/
        } while ((Math.abs(new_point[0] - 1) > threshold) || (Math.abs(new_point[1]) > threshold));
        context.stroke();
    }


    if (window.innerWidth < main_canvas_0.width) {
        res_x_0.value = window.innerWidth;
        res_y_0.value = window.innerWidth;
        main_canvas_0.width = window.innerWidth;
        /*want it to be square, so assign width to height*/
        //noinspection JSSuspiciousNameCombination
        main_canvas_0.height = window.innerWidth;
    }

    function plot_range(current) {
        /*we need to round this because if it's a fraction the modulo will never ==0*/
        var max_len = Math.round(1.2 * Math.max(res_x_0.value, res_y_0.value) / 2);
        var start;
        if (current == null) {
            /*we were run without a starting parameter, so start at the beginning*/
            var canvas = main_canvas[0];
            var context = canvas.getContext("2d");
            /*clear the canvas because we're going to ask plot() not to clear it*/
            context.clearRect(0, 0, canvas.width, canvas.height);
            /*determine how far we need to draw stuff out*/
            start = max_len;
            if (hide_while_rendering[0].checked) {
                /*hide the canvas while we render onto it, because the bright flashes can hurt your eyes*/
                main_canvas.hide();
            }
        } else {
            start = current;
        }
        for (var i = start; i > 0; i--) {

            /*find which radio button is selected without using expensive jQuery*/
            var color_index;
            if (wave_type_sine_0.checked) {
                color_index = wave_sine(i, input_wavyness.val());
            } else if (wave_type_triangle_0.checked) {
                color_index = wave_triangle(i, input_wavyness.val());
            } else if (wave_type_sawtooth_0.checked) {
                color_index = wave_sawtooth(i, input_wavyness.val());
            }

            var color;
            if (colormap_gray_0.checked) {
                color = colormap_basic_grayscale(color_index);
            } else if (colormap_hsv_0.checked) {
                color = colormap_basic_hsv(color_index);
            } else if (colormap_hot_0.checked) {
                color = colormap_basic_hot(color_index);
            }
            basic_plot(color, i);
            /*update progress on percentages*/
            /*same reason for rounding here as above*/
            if (i % Math.round(max_len / 10) == 0) {
                //progress.html("Progress: " + Math.round(100 - 100 * i / max_len) + "%");
                progress_0.innerHTML = "Progress: " + Math.round(100 - 100 * i / max_len) + "%";
                /*100 - because we start at the far end*/
                /*In order to let the UI update, we must run the rest of the math later*/
                /*0ms delay means it will just be in line to be processed by the javascript thread*/
                setTimeout(function () {
                    plot_range(i - 1);
                }, 0);
                return;
            }
        }
        /*this will only run when we are completely done, since we return in the if-block above*/
        /*clear the progress field*/
        progress_0.innerHTML = "";
        /*show the canvas, since we're now done rendering on it*/
        main_canvas.show();
    }

    function plot() {

        /*don't reset the canvas height if we don't need to, because resetting the size of the canvas clears it*/
        if (main_canvas_0.width != res_x_0.value) {
            main_canvas_0.width = res_x_0.value;
        }
        if (main_canvas_0.height != res_y_0.value) {
            main_canvas_0.height = res_y_0.value;
        }

        /*clear the canvas for the next operation*/
        var context = main_canvas_0.getContext("2d");
        context.clearRect(0, 0, main_canvas_0.width, main_canvas_0.height);


        /*decide if it's a regular plot or wavy filled in one*/
        if (do_waves_0.checked) {
            plot_range();
        } else {
            basic_plot("rgb(0,0,0)", input_linewidth_0.value);
        }
    }

    /*event handler for render button*/
    $("#btn_render").click(plot);
    /*event handler for enter key for all input fields*/
    $("input").keyup(function (e) {
        if (e.keyCode == 13/*enter key*/) {
            plot();
        }
    });

    plot();
});