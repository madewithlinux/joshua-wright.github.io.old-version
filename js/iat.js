var x;
(function () {
    'use strict';

    function array_transform(matrices) {
        var code = "";
        code += "(function (points, out){\n";

        // TODO iterate by two instead of by one?
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

    // doesn't work very well
    // var barnsley_fern = [
    //     [
    //         [0, 0, 0],
    //         [0, 0.16, 0],
    //         [0, 0, 1]
    //     ],
    //     [
    //         [0.85, 0.04, 0],
    //         [-0.04, 0.85, 1.60],
    //         [0, 0, 1]
    //     ],
    //     [
    //         [0.20, -0.26, 0],
    //         [ 0.23, 0.22, 1.60],
    //         [0, 0, 1]
    //     ],
    //     [
    //         [-0.15, 0.28, 0],
    //         [0.26, 0.24, 0.44],
    //         [0, 0, 1]
    //     ]
    // ];

    var sierpinski = [
        [
            [0.5, 0.0, -0.5],
            [0.0, 0.5, -0.5],
            [0.0, 0.0, 1.0]
        ],
        [
            [0.5, 0.0, 0.5],
            [0.0, 0.5, -0.5],
            [0.0, 0.0, 1.0]
        ],
        [
            [0.5, 0.0, 0.0],
            [0.0, 0.5, 0.5],
            [0.0, 0.0, 1.0]
        ]
    ];

    console.log("build source");
    var transform_source = array_transform(sierpinski);
    console.log(transform_source);

    console.log("eval source");
    var transformer = eval(array_transform(sierpinski));

    // console.log(transformer(new Float64Array([0, 0]), new Float64Array(3)));
    var n_points = 1;
    console.log("allocate array");
    var points = new Float64Array(n_points * 2);
    console.log("fill with data");
    for (var i = 0; i < 2 * n_points; i++) {
        points[i] = Math.random() * 2 - 1;
    }
    console.log("begin calculate");
    // for (i = 0; i < 16; i++) {
    //     points = transformer(points);
    // }
    while (points.length < 1e6) {
        var new_points = new Float64Array(sierpinski.length * points.length);
        transformer(points, new_points);
        points = new_points;
    }

    console.log("calculate finished, size=" + points.length);

    // setup canvas
    var size = 1000;
    var canvas = document.getElementById("main_canvas");
    canvas.width = size;
    canvas.height = size;
    var ctx = canvas.getContext("2d");
    ctx.fillStyle = 'rgb(0,0,0)';
    ctx.rect(0, 0, size, size);
    ctx.fill();

    // fill points
    var image_data = ctx.getImageData(0, 0, size, size);
    console.log(image_data);
    for (var i = 0; i < points.length / 2; ++i) {
        var point_x = points[i * 2];
        var point_y = points[i * 2 + 1];
        var x = (point_x * size / 2 + size / 2) | 0;
        var y = size - (point_y * size / 2 + size / 2) | 0;
        var offset = 4 * (y * size + x);
        image_data.data[offset] = 255;
        image_data.data[offset + 1] = 255;
        image_data.data[offset + 2] = 255;
        // image_data[4 * (point_x * size + point_y) + 3] = 255;
    }
    ctx.putImageData(image_data, 0, 0);

})();