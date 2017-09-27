(function () {
    'use strict';

    var source_hangman = "[\n" +
        "    [\n" +
        "        \"image\",\n" +
        "        [ [-1,1],  [0,1] ],\n" +
        "        [ [0,1],   [0,0.5] ],\n" +
        "        [ [0,0.5], [-0.25,0.5] ]\n" +
        "    ],\n" +
        "    [\n" +
        "        \"image\",\n" +
        "        [ [-1,1],  [0,0] ],\n" +
        "        [ [0,1],   [0.5,0] ],\n" +
        "        [ [0,0.5], [0.5, -0.25] ]\n" +
        "    ],\n" +
        "    [\n" +
        "        \"image\",\n" +
        "        [ [0,1], [-0.5,0] ],\n" +
        "        [ [0,0.5], [-0.5,-0.25] ],\n" +
        "        [ [-0.25,0.5], [-0.625,-0.25] ]\n" +
        "    ]\n" +
        "]";

    var source_sierpinski = "[\n" +
        "    [\n" +
        "        [0.5, 0.0, -0.5],\n" +
        "        [0.0, 0.5, -0.5]\n" +
        "    ],\n" +
        "    [\n" +
        "        [0.5, 0.0, 0.5],\n" +
        "        [0.0, 0.5, -0.5]\n" +
        "    ],\n" +
        "    [\n" +
        "        [0.5, 0.0, 0.0],\n" +
        "        [0.0, 0.5, 0.5]\n" +
        "    ]\n" +
        "]";
    var fractal_sources = {
        sierpinski: source_sierpinski,
        hangman: source_hangman,
    };

    function image(px, py, p2x, p2y, qx, qy, q2x, q2y, rx, ry, r2x, r2y) {

        // efficient matrix inversion code (math from wikipedia)
        var a = px;
        var b = qx;
        var c = rx;
        var d = py;
        var e = qy;
        var f = ry;
        var g = 1;
        var h = 1;
        var i = 1;

        var A = +(e * i - f * h);
        var B = -(d * i - f * g);
        var C = +(d * h - e * g);
        var D = -(b * i - c * h);
        var E = +(a * i - c * g);
        var F = -(a * h - b * g);
        var G = +(b * f - c * e);
        var H = -(a * f - c * d);
        var I = +(a * e - b * d);

        var det = a * A + b * B + c * C;
        var det_inv = 1 / det;

        var A_inv = [
            [A, D, G],
            [B, E, H],
            [C, F, I]
        ];

        for (var i = 0; i < 3; ++i) {
            for (var j = 0; j < 3; ++j) {
                A_inv[i][j] *= det_inv;
            }
        }

        // matrix of output points
        var out_pts = [
            [p2x, q2x, r2x],
            [p2y, q2y, r2y],
            [1, 1, 1]
        ];

        var out = [
            [0, 0, 0],
            [0, 0, 0],
            [0, 0, 0]
        ];

        // now multiply output point matrix by inverse of input matrix
        for (var i = 0; i < 3; ++i) {
            for (var j = 0; j < 3; ++j) {
                var sum = 0;
                for (var k = 0; k < 3; ++k) {
                    sum += out_pts[i][k] * A_inv[k][j];
                }
                out[i][j] = sum;
            }
        }
        return out;
    }

    function calculate_transforms(transforms) {
        var out = [];
        for (var i = 0; i < transforms.length; i++) {
            var t = transforms[i];

            if (Array.isArray(t) && typeof(t[0][0]) === 'number') {
                out.push(t);
            } else if (Array.isArray(t) && t[0] === 'image') {
                // expects 3 pairs of points
                out.push(image(
                    t[1][0][0], t[1][0][1], t[1][1][0], t[1][1][1],
                    t[2][0][0], t[2][0][1], t[2][1][0], t[2][1][1],
                    t[3][0][0], t[3][0][1], t[3][1][0], t[3][1][1]));
            }
        }
        return out;
    }

    var input_textarea = document.getElementById("transforms");
    input_textarea.value = source_sierpinski;
    var go_button = document.getElementById("btn_render");
    var canvas = document.getElementById("main_canvas");
    var res_x = document.getElementById('res_x');
    var res_y = document.getElementById('res_y');
    var render_delay = document.getElementById('render_delay');

    function array_transform(matrices) {
        var code = "";
        code += "(function (points, out){\n";

        code += "for (var i=0; i < points.length/2; ++i) {\n";

        // helper function to eliminate empty subexpressions
        function calculate_row(ax, ay, c) {
            ax = +ax;
            ay = +ay;
            c = +c;
            var code = "";

            if (ax !== 0 && ay !== 0) {
                code = "points[2*i  ] * " + ax + " + points[2*i+1] * " + ay;
            } else if (ax !== 0) {
                code = "points[2*i  ] * " + ax;
            } else if (ay !== 0) {
                code = "points[2*i+1] * " + ay;
            }

            if (c !== 0) {
                code += " + " + c;
            }

            // handle rows that are just bad
            if (ax === 0 && ay === 0 && c === 0) {
                code = "0";
            }

            return code;
        }

        // expand matrices
        for (var idx = 0; idx < matrices.length; ++idx) {
            var m = matrices[idx];
            code += "out[" + (2 * matrices.length) + "*i + " + (2 * idx + 0) + "] = ";
            code += calculate_row(m[0][0], m[0][1], m[0][2]);
            code += ";\n";

            code += "out[" + (2 * matrices.length) + "*i + " + (2 * idx + 1) + "] = ";
            code += calculate_row(m[1][0], m[1][1], m[1][2]);
            code += ";\n";
        }

        code += "}\n";
        code += "return out;\n";
        code += "})";
        return code
    }

    function display_points(points) {
        // setup canvas
        var width = canvas.width | 0;
        var height = canvas.height | 0;
        console.log(width, height);
        var ctx = canvas.getContext("2d");
        ctx.fillStyle = 'rgb(0,0,0)';
        ctx.rect(0, 0, width, height);
        ctx.fill();


        var image_data = ctx.createImageData(width, height);
        // start with black background
        for (var i = 0; i < image_data.data.length; i += 4) {
            image_data.data[i] = 0;
            image_data.data[i + 1] = 0;
            image_data.data[i + 2] = 0;
            image_data.data[i + 3] = 255;
        }
        // then add points
        for (var i = 0; i < points.length / 2; ++i) {
            var point_x = points[i * 2];
            var point_y = points[i * 2 + 1];
            var x = (point_x * width / 2 + width / 2) | 0;
            var y = height - (point_y * height / 2 + height / 2) | 0;
            var offset = 4 * (y * width + x);
            image_data.data[offset] = 255;
            image_data.data[offset + 1] = 255;
            image_data.data[offset + 2] = 255;
            image_data.data[offset + 3] = 255;
        }
        ctx.putImageData(image_data, 0, 0);
    }

    function set_transforms(transforms) {

        console.log("build function");
        var transform_source = array_transform(transforms);
        // console.log(transform_source);
        var transformer = eval(transform_source);

        // start with two random points
        var points = new Float64Array([Math.random() * 2 - 1, Math.random() * 2 - 1]);

        while (points.length < 10) {
            var new_points = new Float64Array(transforms.length * points.length);
            transformer(points, new_points);
            points = new_points;
        }

        display_points(points);

        // calculate rest of points async
        function continue_render() {
            if (points.length < 3e6) {
                var new_points = new Float64Array(transforms.length * points.length);
                transformer(points, new_points);
                points = new_points;
                display_points(points);
                setTimeout(continue_render, render_delay.value);
            }
        }

        setTimeout(continue_render, render_delay.value);

    }

    function render_fractal() {
        var transforms = JSON.parse(input_textarea.value);
        transforms = calculate_transforms(transforms);
        canvas.width = res_x.value;
        canvas.height = res_y.value;
        set_transforms(transforms);
    }

    go_button.onclick = render_fractal;
    go_button.onclick();

    function pre_defined_fractal_btn(e) {
        console.log(e.target.value);
        input_textarea.value = fractal_sources[e.target.value];
        render_fractal();
    }

    var buttons = document.getElementsByClassName('fractal-btn');
    for (var i = 0; i < buttons.length; i++) {
        buttons[i].onclick = pre_defined_fractal_btn;
    }

})();