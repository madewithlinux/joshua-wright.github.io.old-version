(function (editor) {
    'use strict';

    //////////////////////////////////////////////////

    const sin = Math.sin;
    const cos = Math.cos;

    const translate = (x, y) => [
        [1, 0, x],
        [0, 1, y],
    ];

    const scale = (x, y, a) => [
        [a, 0, (1 - a) * x],
        [0, a, (1 - a) * y],
    ];

    const rotate = (x, y, theta) => [
        [cos(theta), -sin(theta), x + y * sin(theta) - x * cos(theta)],
        [sin(theta), cos(theta), y - y * cos(theta) - x * sin(theta)],
    ];

    // matrix multiplication, ignoring bottom row
    const compose = (m1, m2) => [
        [
            m1[0][0] * m2[0][0] + m1[0][1] * m2[1][0] + m1[0][2],
            m1[0][0] * m2[0][1] + m1[0][1] * m2[1][1] + m1[0][2],
            m1[0][0] * m2[0][2] + m1[0][1] * m2[1][2] + m1[0][2],],
        [
            m1[1][0] * m2[0][0] + m1[1][1] * m2[1][0] + m1[1][2],
            m1[1][0] * m2[0][1] + m1[1][1] * m2[1][1] + m1[1][2],
            m1[1][0] * m2[0][2] + m1[1][1] * m2[1][2] + m1[1][2],],
    ];

    //////////////////////////////////////////////////

    function pretty_print_transform(transforms) {
        let out = "[\n";
        for (let [i, t] of transforms.entries()) {
            if (t[0] === "image") {
                out += "  [ \"image\",\n";
                out += "    " + JSON.stringify(t[1]) + ",\n";
                out += "    " + JSON.stringify(t[2]) + ",\n";
                out += "    " + JSON.stringify(t[3]) + "\n";
                out += "  ]";
            } else {
                out += "  [\n";
                out += "      " + JSON.stringify(t[0]) + ",\n";
                out += "      " + JSON.stringify(t[1]) + "\n";
                out += "  ]";
            }

            if (i !== transforms.length - 1) {
                out += ",";
            }
            out += "\n";
        }
        out += "]";
        return out;
    }

    const source_hangman = [
        [
            "image",
            [[-1, 1], [0, 1]],
            [[0, 1], [0, 0.5]],
            [[0, 0.5], [-0.25, 0.5]]
        ],
        [
            "image",
            [[-1, 1], [0, 0]],
            [[0, 1], [0.5, 0]],
            [[0, 0.5], [0.5, -0.25]]
        ],
        [
            "image",
            [[0, 1], [-0.5, 0]],
            [[0, 0.5], [-0.5, -0.25]],
            [[-0.25, 0.5], [-0.625, -0.25]]
        ]
    ];

    const source_sierpinski = [
        [
            [0.5, 0.0, -0.5],
            [0.0, 0.5, -0.5]
        ],
        [
            [0.5, 0.0, 0.5],
            [0.0, 0.5, -0.5]
        ],
        [
            [0.5, 0.0, 0.0],
            [0.0, 0.5, 0.5]
        ]
    ];

    const source_l_shape = [
        [
            "image",
            [[1, 1], [0.25, 0.25]],
            [[1, -1], [0.25, -0.25]],
            [[-1, -1], [-0.25, -0.25]]
        ],
        [
            "image",
            [[1, 1], [0, 1]],
            [[1, -1], [1, 1]],
            [[-1, -1], [1, 0]]
        ],
        [
            "image",
            [[1, 1], [1, 0]],
            [[1, -1], [1, -1]],
            [[-1, -1], [0, -1]]
        ],
        [
            "image",
            [[1, 1], [0, -1]],
            [[1, -1], [-1, -1]],
            [[-1, -1], [-1, 0]]
        ]
    ];

    let hex_flower = [];
    for (let i = 0; i < 6; i++) {
        const theta = i / 6 * 2 * Math.PI;
        const x = cos(theta);
        const y = sin(theta);
        hex_flower.push(scale(x, y, 1 / 3));
    }
    // hex_flower.push(scale(0, 0, 1 / 3));
    hex_flower.push(compose(
        scale(0, 0, 0.4),
        rotate(0, 0, Math.PI / 6)
    ));

    let koch_snowflake = [];
    for (let i = 0; i < 6; i++) {
        const theta = i / 6 * 2 * Math.PI;
        const x = cos(theta);
        const y = sin(theta);
        koch_snowflake.push(scale(x, y, 1 / 3));
    }
    for (let i = 0; i < 6; i++) {
        const r = 1 / 3 * Math.sqrt(3);
        const theta = (i + 0.5) / 6 * 2 * Math.PI;
        const x = r * cos(theta);
        const y = r * sin(theta);
        koch_snowflake.push(scale(x, y, 1 / 3));
    }
    koch_snowflake.push(scale(0, 0, 1 / 3));

    let pentaflake = [];
    for (let i = 0; i < 5; i++) {
        const theta = (i + 0.25) / 5 * 2 * Math.PI;
        const x = cos(theta);
        const y = sin(theta);
        pentaflake.push(scale(x, y, 0.381966011250105151795413165634361882279690820194237137864));
    }

    const fractal_sources = {
        sierpinski: source_sierpinski,
        hangman: source_hangman,
        l_shape: source_l_shape,
        hex_flower: hex_flower,
        koch_snowflake: koch_snowflake,
        pentaflake: pentaflake,
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

    editor.setValue(pretty_print_transform(source_sierpinski));
    const go_button = document.getElementById("btn_render");
    const canvas = document.getElementById("main_canvas");
    const res_x = document.getElementById('res_x');
    const res_y = document.getElementById('res_y');
    const render_delay = document.getElementById('render_delay');
    const config_form = document.getElementById('config_form');
    const max_points = document.getElementById('max_points');
    const max_depth = document.getElementById('max_depth');


    function array_transform(matrices) {
        let code = "";
        code += "(function (out, depth, base, size){\n";

        // helper function to eliminate empty subexpressions
        function calculate_row(ax, ay, c) {
            ax = +ax;
            ay = +ay;
            c = +c;
            let code = "";

            if (ax !== 0 && ay !== 0) {
                code = `x * ${ax} + y * ${ay}`;
            } else if (ax !== 0) {
                code = `x * ${ax}`;
            } else if (ay !== 0) {
                code = `y * ${ay}`;
            }

            if (c !== 0) {
                code += ` + ${c}`;
            }

            // handle rows that are just bad
            if (ax === 0 && ay === 0 && c === 0) {
                code = "0";
            }

            return code;
        }

        code += "for (let i=base; i < (base+size); ++i) {\n";
        code += '   let n = i;\n';
        code += '   let x = 0;\n';
        code += '   let y = 0;\n';

        // expand matrices
        code += "   for (let index = 0; index < depth; index++) {\n";
        code += '       let xp = 0;\n';
        code += '       let yp = 0;\n';
        code += `       switch (n % ${matrices.length}) {\n`;
        for (let idx = 0; idx < matrices.length; ++idx) {
            const m = matrices[idx];
            code += `       case ${idx}:\n`;
            code += `           xp = ${calculate_row(m[0][0], m[0][1], m[0][2])};\n`;
            code += `           yp = ${calculate_row(m[1][0], m[1][1], m[1][2])};\n`;
            code += `           break;\n`;
        }
        code += "       }\n";
        code += "       x = xp;\n";
        code += "       y = yp;\n";
        code += `       n = ((n | 0) / ${matrices.length}) | 0;\n`;
        code += "   }\n";
        code += `   out[2 * (i-base)] = x;\n`;
        code += `   out[2 * (i-base) + 1] = y;\n`;

        code += "}\n";
        code += "})";
        return code
    }


    function clear_canvas() {
        const width = canvas.width | 0;
        const height = canvas.height | 0;
        const ctx = canvas.getContext("2d");
        ctx.fillStyle = 'rgb(0,0,0, 255)';
        ctx.rect(0, 0, width, height);
        ctx.fill();

        const image_data = ctx.createImageData(width, height);
        // start with black background
        for (let i = 0; i < image_data.data.length; i += 4) {
            image_data.data[i] = 0;
            image_data.data[i + 1] = 0;
            image_data.data[i + 2] = 0;
            image_data.data[i + 3] = 255;
        }
        ctx.putImageData(image_data, 0, 0);
    }

    function display_points(points) {
        let i;
        // setup canvas
        const width = canvas.width | 0;
        const height = canvas.height | 0;
        const ctx = canvas.getContext("2d");

        const image_data = ctx.getImageData(0, 0, width, height);
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

    let timeout = -1;

    function set_transforms(transforms) {

        if (timeout !== -1) {
            clearTimeout(timeout);
        }

        // console.log("build function");
        const transform_source = array_transform(transforms);
        // console.log("transform source", transform_source);
        const transformer = eval(transform_source);

        let depth = max_depth.value;
        let n_points = Math.pow(transforms.length, depth);
        if (n_points > max_points.value) {
            console.log(n_points, max_points.value);
            depth = Math.floor(Math.log(max_points.value) / Math.log(transforms.length));
            n_points = Math.pow(transforms.length, depth);
        }
        let base = 0;
        let size = 81920; // estimated magic number
        if (size > n_points) {
            size = n_points;
        }

        // calculate rest of points async
        function continue_render() {
            if (base < n_points) {
                // sometimes this can fail if we need more than 2^32 entries
                const points = new Float64Array(2 * size);
                transformer(points, depth, base, size);
                display_points(points);
                timeout = setTimeout(continue_render, render_delay.value);
                base += size;
            }
        }

        timeout = setTimeout(continue_render, render_delay.value);

    }

    function render_fractal() {
        const transforms = calculate_transforms(JSON.parse(editor.getValue()));
        canvas.width = res_x.value;
        canvas.height = res_y.value;
        clear_canvas();
        set_transforms(transforms);
    }

    go_button.onclick = render_fractal;
    render_fractal();

    function pre_defined_fractal_btn(e) {
        console.log(e.target.value);
        editor.setValue(pretty_print_transform(fractal_sources[e.target.value]));
        // console.log(pretty_print_transform(JSON.parse(fractal_sources[e.target.value])));
        render_fractal();
    }

    for (const btn of document.getElementsByClassName('fractal-btn')) {
        btn.onclick = pre_defined_fractal_btn;
    }

    config_form.onsubmit = (e) => {
        e.preventDefault(); // do not reload page
        render_fractal();
    }

})(window.editor);