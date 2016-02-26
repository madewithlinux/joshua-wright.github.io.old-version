/**
 * Created by j0sh on 2/24/16.
 */


var tree_root = document.getElementById("main_tree");
var output_div = document.getElementById("output");
var output_hidden = document.getElementById("output_hidden");
var main_input_box = document.getElementById('input');
var copy_button = document.getElementById("copy_button");

var class_container = "container";
var class_operands = "operands";
var class_operator = "operator";
var class_number = "number";
var class_numberContainer = 'numberContainer';


/*
gigantic expression to make a nice grid for color testing:
1 sin 2 cos + 3 tan 4 asin  − × 7 acos 8 atan ÷ 3 abs 8 ln \ ⬆ % ! 7 log 8 exp C 2 10⬆ 6 2⬆ P atan2 √
 */
var constants = {
    'π': Math.PI,
    'ℯ': Math.E,
    '∞': Infinity
};
var replacements = {
    '*': '×',
    "-": '−',
    '/': '÷',
    '^': '⬆',
    'pi': 'π',
    'e': 'ℯ',
    'inf': '∞',
    '10^': '10⬆',
    '2^': '2⬆',
    'sqrt': '√'
};
var operators = ['+', '−', '×', '÷', '%', '⬆', '\\',
    'sin', 'cos', 'tan', 'asin', 'acos', 'atan',
    'abs', 'ln', 'log', 'lg', 'exp', '10⬆', '2⬆', '!', 'C', 'P', 'atan2', '√'];
var op_param_counts = {
    '+': 2,
    '−': 2,
    '×': 2,
    '÷': 2,
    '%': 2,
    '⬆': 2,
    '\\': 2,
    'sin': 1,
    'cos': 1,
    'tan': 1,
    'asin': 1,
    'acos': 1,
    'atan': 1,
    'abs': 1,
    'ln': 1,
    'log': 1,
    'lg': 1,
    'exp': 1,
    '10⬆': 1,
    '2⬆': 1,
    '!': 1,
    'C': 2,
    'P': 2,
    'atan2': 2,
    '√': 1
};
var op_indexes = {
    '+': 0,
    '−': 1,
    '×': 2,
    '÷': 3,
    '%': 4,
    '⬆': 5,
    '\\': 6,
    'sin': 7,
    'cos': 8,
    'tan': 9,
    'asin': 10,
    'acos': 11,
    'atan': 12,
    'abs': 13,
    'ln': 14,
    'log': 15,
    'lg': 16,
    'exp': 17,
    '10⬆': 18,
    '2⬆': 19,
    '!': 20,
    'C': 21,
    'P': 22,
    'atan2': 23,
    '√': 24
};
var op_colors = [
    "#ddecb1",
    "#98d3ed",
    "#7ee324",
    "#4bd2fa",
    "#af2846",
    "#b852d5",
    "#fcf844",
    "#90973e",
    "#c658d6",
    "#689fde",
    "#a2cab0",
    "#4bc379",
    "#f462c6",
    "#d1f446",
    "#804a82",
    "#e2f0af",
    "#b076e9",
    "#eef399",
    "#c27bfc",
    "#4a58ce",
    "#af9f73",
    "#5154e7",
    "#3040ac",
    "#3ba859",
    "#b2b4b3",
    "#6e8c8d",
    "#fdde69",
    "#8d66d1",
    "#b0d6e4",
    "#e4e7f5",
    "#d09228",
    "#414c96",
    "#7d8adb",
    "#856fef",
    "#d8ea2b",
    "#53b051",
    "#b0562f",
    "#d4b78f"
];


function Node(value, children) {
    if (typeof value == "number") {
        this.type = 0;
        this.value = value;
        this.operation = -1;
    } else if (typeof value == "string") {
        this.type = 1;
        this.value = undefined;
        this.operation = op_indexes[value];
    }
    if (children != undefined) {
        this.children = children;
    } else {
        this.children = [];
    }
}
Node.type_number = 0;
Node.type_operator = 1;


function eval_tree(n) {
    if (n == undefined) {
        return 0;
    }
    if (n.type == Node.type_number) {
        return n.value;
    }
    var val;
    switch (n.operation) {
        case op_indexes['+']: /*addition*/
            val = 0;
            /*use a for loop. will be useful if we want multi-input operators*/
            n.children.forEach(function (v, i) {
                val += eval_tree(v);
            });
            return val;
        case op_indexes['×']: /*multiplication*/
            val = 1;
            n.children.forEach(function (v, i) {
                val *= eval_tree(v);
            });
            return val;
        case op_indexes['−']: /*subtraction*/
            return eval_tree(n.children[0]) - eval_tree(n.children[1]);
        case op_indexes['÷']: /*division*/
            return eval_tree(n.children[0]) / eval_tree(n.children[1]);
        case op_indexes['']: /*modulo*/
            return eval_tree(n.children[0]) % eval_tree(n.children[1]);
        case op_indexes['⬆']: /*exponent*/
            return Math.pow(eval_tree(n.children[0]), eval_tree(n.children[1]));
        case op_indexes['\\']: /*backward division*/
            return eval_tree(n.children[1]) / eval_tree(n.children[0]);
        case op_indexes['sin']:
            return Math.sin(eval_tree(n.children[0]));
        case op_indexes['cos']:
            return Math.cos(eval_tree(n.children[0]));
        case op_indexes['tan']:
            return Math.tan(eval_tree(n.children[0]));
        case op_indexes['asin']:
            return Math.asin(eval_tree(n.children[0]));
        case op_indexes['acos']:
            return Math.acos(eval_tree(n.children[0]));
        case op_indexes['atan']:
            return Math.atan(eval_tree(n.children[0]));
        case op_indexes['abs']:
            return Math.abs(eval_tree(n.children[0]));
        case op_indexes['ln']:
            return Math.log(eval_tree(n.children[0]));
        case op_indexes['log']:
            return Math.log10(eval_tree(n.children[0]));
        case op_indexes['lg']:
            return Math.log2(eval_tree(n.children[0]));
        case op_indexes['exp']:
            return Math.exp(eval_tree(n.children[0]));
        case op_indexes['10⬆']:
            return Math.pow(10, eval_tree(n.children[0]));
        case op_indexes['2⬆']:
            return Math.pow(2, eval_tree(n.children[0]));
        case op_indexes['!']:
            return math.factorial(eval_tree(n.children[0]));
        case op_indexes['C']:
            return math.combinations(Math.floor(eval_tree(n.children[0])),
                Math.floor(eval_tree(n.children[1])));
        case op_indexes['P']:
            return math.permutations(Math.floor(eval_tree(n.children[0])),
                Math.floor(eval_tree(n.children[1])));
        case op_indexes['atan2']:
            return Math.atan2(eval_tree(n.children[1]), eval_tree(n.children[0]));
        case op_indexes['√']:
            return Math.sqrt(eval_tree(n.children[0]));
        default:
            console.log("Bad Node!");
            console.log(n);
    }
}
function parse_expression(expr) {
    var stack = [];
    var stream = expr.split(' ');
    stream.forEach(function (v, i) {
        if (v == "") {
            /*double spaces cause empty strings after splitting*/
            return;
        }
        var op = operators.indexOf(v);
        if (v.toLowerCase() in constants) {
            stack.push(new Node(constants[v.toLowerCase()]));
        } else if (op == -1) {
            /*this is a number, because it isn't an operator*/
            stack.push(new Node(Number(v)));
        } else {
            /*this is an operator*/
            /*slice off the top of the stack and give it to this operator*/
            var tmp_stack = stack.slice(-op_param_counts[v], stack.length);
            stack = stack.slice(0, -op_param_counts[v]);
            var new_node = new Node(v, tmp_stack);
            stack.push(new_node);
        }
    });
    return stack;
}


function render_expression(node) {
    if (node.type == Node.type_number) {
        var number_node = document.createElement('div');
        number_node.classList.add('box');
        number_node.classList.add(class_number);
        number_node.textContent = node.value.toLocaleString();
        var parent = document.createElement('div');
        parent.classList.add(class_numberContainer);
        /*need a line break after numbers*/
        parent.appendChild(number_node);
        parent.appendChild(document.createElement('br'));
        return parent;
    } else {
        var container = document.createElement('div');
        container.classList.add("box");
        container.classList.add(class_container);
        container.style.backgroundColor = op_colors[node.operation];

        var operands = document.createElement('div');
        operands.classList.add("box");
        operands.classList.add(class_operands);
        for (var i = 0; i < node.children.length; i++) {
            /*add each child node to the container*/
            operands.appendChild(render_expression(node.children[i]));
        }
        /*add the operands to the container*/
        container.appendChild(operands);

        /*add the operator node*/
        var op_parent = document.createElement('div');
        op_parent.classList.add("box");
        op_parent.classList.add(class_operator);
        //op_parent.textContent = operators[node.operation];
        op_parent.style.backgroundColor = op_colors[node.operation];
        var op_txt = document.createElement('div');
        op_txt.classList.add("operatorContainer");
        op_txt.textContent = operators[node.operation];
        op_parent.appendChild(op_txt);
        container.appendChild(op_parent);

        return container;
    }
}
function center_operators() {
    var elements = document.getElementsByClassName(class_operator);
    for (var i = 0; i < elements.length; i++) {
        var height = elements[i].previousSibling.getBoundingClientRect().height;
        elements[i].position = "relative";
        elements[i].style.height = (height - 20) + 'px';
    }
}
function display_expression(node) {
    /*clear the expression already there*/
    var nodes = [];
    if (node instanceof Node) {
        /*assume it's a single node*/
        nodes.push(render_expression(node));
    } else {
        /*assume it's iterable*/
        node.forEach(function (v, i) {
            nodes.push(render_expression(v));
        })
    }
    if (nodes.length > 0) {
        tree_root.innerHTML = "";
        nodes.forEach(function (v, i) {
            tree_root.appendChild(v);
        });
    }
    center_operators();
}

function trim_last_char() {
    /*trim the character right behind the cursor*/
    var cursor_idx = main_input_box.selectionStart;
    var old_val = main_input_box.value;
    main_input_box.value = old_val.slice(0, cursor_idx - 1) + old_val.slice(cursor_idx, old_val.length);
    //console.log("old value: " + old_val + ", new value: " + main_input_box.value);
    main_input_box.setSelectionRange(cursor_idx - 1, cursor_idx - 1);
    console.log(cursor_idx - 1);
}
function do_replacements() {
    /*backup the selection indexes*/
    var old_start = main_input_box.selectionStart;
    var old_end = main_input_box.selectionEnd;
    var expr = main_input_box.value;
    var stream = expr.split(' ');
    var tokens = [];
    var index_old_str = 0;
    var balance_start = 0;
    var balance_end = 0;
    stream.forEach(function (v, i) {
        /*+1 for the space*/
        index_old_str += v.length + 1;
        if (v.toLowerCase() in replacements) {
            tokens.push(replacements[v.toLowerCase()]);
            /*keep track of how much we're changing the cursor index*/
            if (old_end < index_old_str) {
                balance_end += replacements[v.toLowerCase()].length - v.length;
            }
            if (old_start < index_old_str) {
                balance_start += replacements[v.toLowerCase()].length - v.length;
            }
        } else {
            tokens.push(v);
        }
    });
    /*put the edited value back in the text box*/
    main_input_box.value = tokens.join(' ');
    /*put the cursor where it belongs*/
    old_end += balance_end;
    old_start += balance_start;
    main_input_box.setSelectionRange(old_start, old_end);
}
main_input_box.onkeyup = function (e) {
    var KEYCODE_SLASH_QUESTION_MARK = 191;
    var KEYCODE_EIGHT_MULTIPLY = 56;
    var KEYCODE_C = 67;
    var KEYCODE_R = 82;
    var KEYCODE_ARROW_KEYS = {37: 0, 38: 0, 39: 0, 40: 0};
    if (e.keyCode in KEYCODE_ARROW_KEYS) {
        /*do nothing for arrow keys*/
    } else if (e.keyCode == KEYCODE_SLASH_QUESTION_MARK && e.shiftKey) {
        /*question mark*/
        /*TODO: show help*/
        console.log("TODO: show help");
        trim_last_char();
    } else if (e.keyCode == KEYCODE_R && e.shiftKey) {
        trim_last_char();
        /*we need to de-focus the input box, so we need to bakckup the cursor index*/
        var old_start = main_input_box.selectionStart;
        var old_end = main_input_box.selectionEnd;
        //e.preventDefault();
        /*TODO: make this work in firefox*/
        /*make a selection range*/
        var range = document.createRange();
        /*make the hidden output visible for copying*/
        output_hidden.style.display = "block";
        /*add the hidden output to the selection range*/
        range.selectNode(output_hidden);
        //console.log(range.toString());
        d = window.getSelection();
        /*remove whatever was selected before, because the selection must be contiguous*/
        d.removeAllRanges();
        /*select the selection object*/
        d.addRange(range);
        /*ask the web browser to copy that selection*/
        console.log("copy enabled: " + document.queryCommandEnabled("copy"));
        var result = document.execCommand("copy");
        console.log(result);
        /*clean up: set no selection*/
        d.removeAllRanges();
        /*hide the hidden output box again*/
        output_hidden.style.display = "none";
        /*focus the input box in case it lost focus*/
        main_input_box.focus();
        main_input_box.setSelectionRange(old_start, old_end);
    } else {
        do_replacements();
        //console.log("e.keyCode: " + e.keyCode);
        /*parse the rpn expression into an expression tree*/
        var tree = parse_expression(main_input_box.value);
        /*display the tree*/
        display_expression(tree);
        /*evaluate the tree for a numberical value*/
        var output = eval_tree(tree[0]);
        output_div.textContent = output.toLocaleString();
        output_hidden.textContent = output.toString();
    }
};
/*call the event handler on page load*/
main_input_box.onkeyup({});
/*make sure the output is always focused*/
console.log(setInterval(function () {
    main_input_box.focus()
}, 100));

/*instanciate the clipboard object*/
//var clipboard = new Clipboard('.btn');

