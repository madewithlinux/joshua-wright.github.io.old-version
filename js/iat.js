(function () {
    'use strict';

    const source_hangman = "[\n" +
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

    const source_sierpinski = "[\n" +
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

    const source_l_shape = "[\n" +
        "    [\n" +
        "        \"image\",\n" +
        "        [ [ 1, 1], [ 0.25, 0.25] ],\n" +
        "        [ [ 1,-1], [ 0.25,-0.25] ],\n" +
        "        [ [-1,-1], [-0.25,-0.25] ]\n" +
        "    ],\n" +
        "    [\n" +
        "        \"image\",\n" +
        "        [ [ 1, 1], [0,1] ],\n" +
        "        [ [ 1,-1], [1,1] ],\n" +
        "        [ [-1,-1], [1,0] ]\n" +
        "    ],\n" +
        "    [\n" +
        "        \"image\",\n" +
        "        [ [ 1, 1], [1,0] ],\n" +
        "        [ [ 1,-1], [1,-1] ],\n" +
        "        [ [-1,-1], [0,-1] ]\n" +
        "    ],\n" +
        "    [\n" +
        "        \"image\",\n" +
        "        [ [ 1, 1], [0,-1] ],\n" +
        "        [ [ 1,-1], [-1,-1] ],\n" +
        "        [ [-1,-1], [-1,0] ]\n" +
        "    ]\n" +
        "]";

    const fractal_sources = {
        sierpinski: source_sierpinski,
        hangman: source_hangman,
        l_shape: source_l_shape,
    };

    function image(px, py, p2x, p2y, qx, qy, q2x, q2y, rx, ry, r2x, r2y) {

        // efficient matrix inversion code (math from wikipedia)
        const a = px;
        const b = qx;
        const c = rx;
        const d = py;
        const e = qy;
        const f = ry;
        const g = 1;
        const h = 1;
        const i = 1;

        const A = +(e * i - f * h);
        const B = -(d * i - f * g);
        const C = +(d * h - e * g);
        const D = -(b * i - c * h);
        const E = +(a * i - c * g);
        const F = -(a * h - b * g);
        const G = +(b * f - c * e);
        const H = -(a * f - c * d);
        const I = +(a * e - b * d);

        const det = a * A + b * B + c * C;
        const det_inv = 1 / det;

        const A_inv = [
            [A, D, G],
            [B, E, H],
            [C, F, I]
        ];

        for (let i = 0; i < 3; ++i) {
            for (let j = 0; j < 3; ++j) {
                A_inv[i][j] *= det_inv;
            }
        }

        // matrix of output points
        const out_pts = [
            [p2x, q2x, r2x],
            [p2y, q2y, r2y],
            [1, 1, 1]
        ];

        const out = [
            [0, 0, 0],
            [0, 0, 0],
            [0, 0, 0]
        ];

        // now multiply output point matrix by inverse of input matrix
        for (let i = 0; i < 3; ++i) {
            for (let j = 0; j < 3; ++j) {
                let sum = 0;
                for (let k = 0; k < 3; ++k) {
                    sum += out_pts[i][k] * A_inv[k][j];
                }
                out[i][j] = sum;
            }
        }
        return out;
    }

    function calculate_transforms(transforms) {
        let out = [];
        for (let i = 0; i < transforms.length; i++) {
            const t = transforms[i];

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

    const input_textarea = document.getElementById("transforms");
    input_textarea.value = source_sierpinski;
    const go_button = document.getElementById("btn_render");
    const canvas = document.getElementById("main_canvas");
    const res_x = document.getElementById('res_x');
    const res_y = document.getElementById('res_y');
    const render_delay = document.getElementById('render_delay');
    const max_points = document.getElementById('max_points');

    function array_transform(matrices) {
        let code = "";
        code += "(function (points, out){\n";

        code += "for (let i=0; i < points.length/2; ++i) {\n";

        // helper function to eliminate empty subexpressions
        function calculate_row(ax, ay, c) {
            ax = +ax;
            ay = +ay;
            c = +c;
            let code = "";

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
        for (let idx = 0; idx < matrices.length; ++idx) {
            const m = matrices[idx];
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
        let i;
// setup canvas
        const width = canvas.width | 0;
        const height = canvas.height | 0;
        console.log(width, height);
        const ctx = canvas.getContext("2d");
        ctx.fillStyle = 'rgb(0,0,0)';
        ctx.rect(0, 0, width, height);
        ctx.fill();


        const image_data = ctx.createImageData(width, height);
        // start with black background
        for (i = 0; i < image_data.data.length; i += 4) {
            image_data.data[i] = 0;
            image_data.data[i + 1] = 0;
            image_data.data[i + 2] = 0;
            image_data.data[i + 3] = 255;
        }
        // then add points
        for (i = 0; i < points.length / 2; ++i) {
            const point_x = points[i * 2];
            const point_y = points[i * 2 + 1];
            const x = (point_x * width / 2 + width / 2) | 0;
            const y = height - (point_y * height / 2 + height / 2) | 0;
            const offset = 4 * (y * width + x);
            image_data.data[offset] = 255;
            image_data.data[offset + 1] = 255;
            image_data.data[offset + 2] = 255;
            image_data.data[offset + 3] = 255;
        }
        ctx.putImageData(image_data, 0, 0);
    }

    function set_transforms(transforms) {

        console.log("build function");
        const transform_source = array_transform(transforms);
        // console.log(transform_source);
        const transformer = eval(transform_source);

        // start with two random points
        let points = new Float64Array([Math.random() * 2 - 1, Math.random() * 2 - 1]);

        while (points.length < 10) {
            const new_points = new Float64Array(transforms.length * points.length);
            transformer(points, new_points);
            points = new_points;
        }

        display_points(points);

        // calculate rest of points async
        function continue_render() {
            if (points.length < max_points.value) {
                const new_points = new Float64Array(transforms.length * points.length);
                transformer(points, new_points);
                points = new_points;
                display_points(points);
                setTimeout(continue_render, render_delay.value);
            }
        }

        setTimeout(continue_render, render_delay.value);

    }

    function render_fractal() {
        const transforms_ = JSON.parse(input_textarea.value);
        const transforms = calculate_transforms(transforms_);
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

    const buttons = document.getElementsByClassName('fractal-btn');
    for (const btn of buttons) {
        btn.onclick = pre_defined_fractal_btn;
    }
    // for (var i = 0; i < buttons.length; i++) {
    //     buttons[i].onclick = pre_defined_fractal_btn;
    // }

})();