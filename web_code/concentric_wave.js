/**
 * Created by j0sh on 2/19/16.
 */

function colormap_basic_hot(input) {
    /* expects 0 <= input <= 1, then translates to 0 <= x <= 255 */
    var x = 255 * input;
    var pix = new Uint8Array([0, 0, 0]);
    /* red */
    if (x > 94) {
        pix[0] = 255;
    } else {
        pix[0] = Math.round(51.0 * x / 19.0);
    }

    /* green */
    if (x > 190) {
        pix [1] = 255;
    } else if (x > 95) {
        pix[1] = Math.round(85.0 * x / 32.0 - 8075.0 / 32.0);
    } else {
        pix[1] = 0;
    }

    /* blue */
    if (x > 191) {
        pix[2] = Math.round(255.0 * x / 64.0 - 48705.0 / 64.0);
    } else {
        pix[2] = 0;
    }
    return pix;
}
function colormap_basic_hsv(input) {
    /*TODO: this needs to return an RGB array*/
    var x = 360 * input;
    var pix = "hsl(";
    pix += x;
    pix += ',100%,50%)';
    return pix;
}
function colormap_basic_grayscale(input) {
    /* expects 0 <= input <= 1, then translates to 0 <= x <= 255 */
    var x = 255 * input;
    var pix = new Uint8Array([0, 0, 0]);
    pix[0] = Math.round(x);
    /*rudimentary anti-aliasing*/
    if (pix[0] == 255) {
        pix[0] = 64;
    } else if (pix[0] == 254) {
        pix[0] = 192;
    }
    pix[1] = pix[0];
    pix[2] = pix[0];
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

function compute_midpoint_distance(width) {
    var out = new Float64Array(width * width);
    var mid = (width - 1) / 2;
    var x = 0;
    for (var a = 0; a < width * width; a += width) {
        for (var y = 0; y < width; y++) {
            out[a + y] = Math.sqrt(Math.pow(x - mid, 2) + Math.pow(y - mid, 2));
        }
        x++;
    }
    return out;
}
function rose(k, t) {
    /*this is the function that calculates the points on the parametric rose*/
    return [
        Math.cos(k * t) * Math.cos(t),
        Math.cos(k * t) * Math.sin(t)
    ];
}
function generate_points(n, d, _step, canvas_width) {

    var middle = [canvas_width / 2, canvas_width / 2];
    var scale = canvas_width / 2.1;
    /*start at the starting point of (1,0) */
    var out_x = [middle[0] + scale];
    var out_y = [middle[1]];
    /*step in terms of PI so it will add up evenly*/
    var step = _step * Math.PI;
    /*use a threshold to determine when we've gone all the way around*/
    var threshold = 1e-5;
    var k = n / d;
    var i = step;
    var new_point;
    do {
        /*ge the next point*/
        new_point = rose(k, i);
        /*scale the point and add it to the arrays*/
        out_x.push(middle[0] + scale * new_point[0]);
        out_y.push(middle[1] + scale * new_point[1]);
        /*step to the next point*/
        i += step;
        /*while we are not approximately back at our starting point*/
    } while ((Math.abs(new_point[0] - 1) > threshold) || (Math.abs(new_point[1]) > threshold));
    /*return the values in a Float64Array for speed*/
    return {
        "x": new Float64Array(out_x),
        "y": new Float64Array(out_y)
    };
}
function compute_rose_dist(width) {
    var out = new Uint16Array(width * width);
    var points = generate_points(3, 7, 0.003, width);
    var mid = (width - 1) / 2;
    var x = 0;
    for (var a = 0; a < width * width; a += width) {
        for (var y = 0; y < width; y++) {
            //out[a + y] = Math.sqrt(Math.pow(x - mid, 2) + Math.pow(y - mid, 2));
            var min_dist = width;
            for (var i = 0; i < points.x.length; i++) {
                var dist = Math.sqrt(Math.pow(x - points.x[i], 2) + Math.pow(y - points.y[i], 2));
                if (dist < min_dist) {
                    min_dist = dist;
                }
            }
            out[a + y] = min_dist;
        }
        x++;
    }
    return out;
}


function scale_array_sine(array, scale) {
    /*results are scaled to 0 <= x <= 1*/
    var out = new Float64Array(array.length);
    for (var i = 0; i < array.length; i++) {
        out[i] = Math.sin(scale * array[i]) / 2 + 1 / 2;
    }
    return out;
}

function scale_array_sawtooth(array, scale) {
    /*results are scaled to 0 <= x <= 1*/
    var out = new Float64Array(array.length);
    for (var i = 0; i < array.length; i++) {
        out[i] = wave_sawtooth(array[i], scale);
    }
    return out;
}

function array_to_image_data(array, cached_colormap, offset) {
    /*TODO: use colormap*/
    //if (offset == undefined) {
    //    offset = 0;
    //}
    var size = Math.sqrt(array.length);
    var data = new Uint8ClampedArray(array.length * 4);
    var pix;
    for (var i = 0; i < array.length; i++) {
        /*RGBA pixel format*/
        //data[i * 4 + 0] = ((array[i] + offset) * 255) % 255;
        //data[i * 4 + 1] = ((array[i] + offset) * 255) % 255;
        //data[i * 4 + 2] = ((array[i] + offset) * 255) % 255;
        //pix = ((array[i] + offset) * 255) % 255;
        //data[i * 4 + 0] = pix;
        //data[i * 4 + 1] = pix;
        //data[i * 4 + 2] = pix;
        //var pix = colormap_basic_grayscale((array[i] + offset) % 1);
        //pix = colormap_basic_hot((array[i] + offset) % 1);
        //console.log(((array[i] + offset) % 1) * cached_colormap.length - 1);
        //pix = cached_colormap[Math.round(((array[i] + offset) % 1) * cached_colormap.length - 2)];
        //if (pix == undefined) {
        //    pix = [0, 0, 0];
        //}
        //console.log(array[i] + offset);
        pix = cached_colormap[array[i] + offset];
        data[i * 4 + 0] = pix[0];
        data[i * 4 + 1] = pix[1];
        data[i * 4 + 2] = pix[2];
        data[i * 4 + 3] = 255;
    }
    return new ImageData(data, size, size);
}

$(document).ready(function () {
    var main_canvas = $('#main_canvas');
    var main_canvas_0 = main_canvas[0];


    var canvas_width = main_canvas_0.width;
    var middle = [canvas_width / 2, canvas_width / 2];
    var length = Math.sqrt(2) * canvas_width;
    var step = 2;
    var width = 3;
    var context = main_canvas_0.getContext("2d");


    //var distances = compute_midpoint_distance(500);
    var distances = compute_rose_dist(500);
    //distances = scale_array_sine(distances, 1 / 10);
    //distances = scale_array_sawtooth(distances, 5);

    var colormap_cache = [];
    for (var i = 0; i < Math.pow(2, 16); i++) {
        colormap_cache.push(colormap_basic_hot(i / Math.pow(2, 16)));
    }
    console.log(colormap_cache);


    var current_offset = 0;
    var offset_increment = 0.01;

    function render() {

        //context.clearRect(0, 0, main_canvas_0.width, main_canvas_0.height);

        //var img_data = array_to_image_data(distances, undefined, current_offset);
        var img_data = array_to_image_data(distances, colormap_cache, current_offset);
        context.putImageData(img_data, 0, 0);
        context.stroke();

        //for (var x = 0; x < length; x += step) {
        //    context.beginPath();
        //    context.lineWidth = width;
        //    context.strokeStyle = colormap_basic_grayscale((current_offset + x / (canvas_width / 7)) % 1);
        //    context.arc(middle[0], middle[1], x, 0, 2 * Math.PI);
        //    context.stroke();
        //}
        //for (var x = 0; x < canvas_width; x += step) {
        //    context.beginPath();
        //    context.lineWidth = width;
        //    //context.strokeStyle = colormap_basic_grayscale((current_offset + x / (canvas_width / 7)) % 1);
        //    context.strokeStyle = colormap_basic_hot((current_offset + x / (canvas_width / 7)) % 1);
        //    context.moveTo(x, 0);
        //    context.lineTo(x, canvas_width);
        //    context.stroke();
        //}
        //for (var n = 0; n < 2 * Math.PI; n += 0.02) {
        //    context.beginPath();
        //    context.moveTo(middle[0], middle[1]);
        //    //context.lineWidth = width;
        //    context.lineWidth = 6;
        //    context.strokeStyle = colormap_basic_grayscale((current_offset + n / (2 * Math.PI)) % 1);
        //    var x = canvas_width / 2 * Math.cos(n) + canvas_width / 2;
        //    var y = canvas_width / 2 * Math.sin(n) + canvas_width / 2;
        //    context.lineTo(x, y);
        //    context.stroke();
        //}

        //current_offset += 0.01;
        //current_offset = (current_offset + offset_increment) % 1;
        current_offset++;
    }

    //render();
    var render_id = [setInterval(render, 1000 / 60)];
    console.log(render_id);
    $("#btn_pause").click(function () {
        offset_increment -= 0.005;
        if (offset_increment <= 0) {
            clearInterval(render_id.pop());
            console.log(render_id);
        }
        console.log("offset_increment: " + offset_increment);
    });
    $("#btn_render").click(function () {
        //if (current_offset > 0) {
        //    current_offset += 0.01;
        //} else {
        if (offset_increment <= 0) {
            console.log("render_id: " + render_id);
            render_id.push(setInterval(render, 1000 / 60));
        }
        console.log("offset_increment: " + offset_increment);
        offset_increment += 0.005;
    });

});