function lissajous_curve(a, b, sigma, t) {
    return [
        Math.sin(a * t + sigma),
        Math.cos(b * t)
    ];
}
$(document).ready(function() {
    var sigma = 0;
    var main_canvas = $('#main_canvas');
    var main_canvas_0 = main_canvas[0];
    var input_res_x = document.getElementById("res_x");
    var input_res_y = document.getElementById("res_y");
    var input_line_width = document.getElementById("input_line_width");
    var input_a = document.getElementById("input_a");
    var input_b = document.getElementById("input_b");
    var input_speed = document.getElementById("input_speed");
    setInterval(function () {
        if (main_canvas_0.width != input_res_x.value ||
            main_canvas_0.height != input_res_y.value) {
            main_canvas_0.width = input_res_x.value;
            main_canvas_0.height = input_res_y.value;
        }
        var context = main_canvas_0.getContext("2d");
        context.clearRect(0, 0, main_canvas_0.width, main_canvas_0.height);

        var a = input_a.value;
        var b = input_b.value;
        var step = 0.005 * Math.PI;
        var point = lissajous_curve(a, b, sigma, 0);
        var canvas_width = main_canvas_0.width;
        var canvas_height = main_canvas_0.height;
        var middle = [canvas_width / 2, canvas_height / 2];
        var scale_x = canvas_width / 2.1;
        var scale_y = canvas_height / 2.1;


        context.beginPath();
        context.strokeStyle = "#000";
        //context.lineWidth = 2;
        context.lineWidth = input_line_width.value;

        context.moveTo(point[0] * scale_x + middle[0], point[1] * scale_y + middle[1]);
        for (var i = 0; i < 2 * Math.PI; i += step) {
            point = lissajous_curve(a, b, sigma, i);
            context.lineTo(point[0] * scale_x + middle[0], point[1] * scale_y + middle[1]);
        }
        point = lissajous_curve(a, b, sigma, 0);
        context.lineTo(point[0] * scale_x + middle[0], point[1] * scale_y + middle[1]);
        context.stroke();

        sigma += Math.PI * input_speed.value / 1000;
    }, 1000 / 60);

    function set_fullscreen() {
        $("div.config").hide();
        //var input_res_x = document.getElementById("res_x");
        //var input_res_y = document.getElementById("res_y");
        input_res_x.value = window.innerWidth;
        input_res_y.value = window.innerHeight;
        c.width = size;
        c.height = size;
        $("#main_canvas").css({"margin": "auto", "float": "none"});
    }
    $('#fullscreen_button').click(set_fullscreen);
    if (window.location.toString().endsWith("#fullscreen")) {
        set_fullscreen();
    }

    /*unhide the config, undo fullscreen*/
    var KEYCODE_ESC = 27;
    $(document).keyup(function (e) {
        if (e.keyCode == KEYCODE_ESC) {
            input_res_x.value = 500;
            input_res_y.value = 500;
            $("div.config").show();
            $("#main_canvas").css({"margin": "0", "float": "right"});
        }
    });

});