(function () {
    'use strict';

    var input_textarea = document.getElementById("transforms");
    input_textarea.value = "[\n" +
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
    var go_button = document.getElementById("btn_render");
    var canvas = document.getElementById("main_canvas");
    var res_x = document.getElementById('res_x');
    var res_y = document.getElementById('res_y');
    var size = 1000;
    var step_delay = 0;

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
                setTimeout(continue_render, step_delay);
            }
        }

        setTimeout(continue_render, step_delay);

    }

    go_button.onclick = function () {
        var transforms = JSON.parse(input_textarea.value);
        canvas.width = res_x.value;
        canvas.height = res_y.value;
        set_transforms(transforms);
    };

    go_button.onclick();

})();