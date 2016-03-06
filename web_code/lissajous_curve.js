function lissajous_curve(a, b, sigma, t) {
    return [
        Math.sin(a * t + sigma),
        Math.cos(b * t)
    ];
}
function run_lissajous() {
    var sigma = 0;
    var main_canvas = $('#main_canvas');
    var main_canvas_0 = main_canvas[0];
    var input_res_x = document.getElementById("res_x");
    var input_line_width = document.getElementById("input_line_width");
    var input_a = document.getElementById("input_a");
    var input_b = document.getElementById("input_b");
    var input_speed = document.getElementById("input_speed");
    setInterval(function () {
        if (main_canvas_0.width != input_res_x.value) {
            main_canvas_0.width = input_res_x.value;
            main_canvas_0.height = input_res_x.value;
        }
        var context = main_canvas_0.getContext("2d");
        context.clearRect(0, 0, main_canvas_0.width, main_canvas_0.height);

        var a = input_a.value;
        var b = input_b.value;
        var step = 0.005 * Math.PI;
        var point = lissajous_curve(a, b, sigma, 0);
        var canvas_width = main_canvas_0.width;
        var middle = [canvas_width / 2, canvas_width / 2];
        var scale = canvas_width / 2.1;


        context.beginPath();
        context.strokeStyle = "#000";
        //context.lineWidth = 2;
        context.lineWidth = input_line_width.value;

        context.moveTo(point[0] * scale + middle[0], point[1] * scale + middle[1]);
        for (var i = 0; i < 2 * Math.PI; i += step) {
            point = lissajous_curve(a, b, sigma, i);
            context.lineTo(point[0] * scale + middle[0], point[1] * scale + middle[1]);
        }
        point = lissajous_curve(a, b, sigma, 0);
        context.lineTo(point[0] * scale + middle[0], point[1] * scale + middle[1]);
        context.stroke();

        sigma += Math.PI * input_speed.value / 1000;
    }, 1000 / 60);
}

$(document).ready(run_lissajous);