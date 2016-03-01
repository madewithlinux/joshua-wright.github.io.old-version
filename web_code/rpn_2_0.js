/**
 * Created by j0sh on 2/24/16.
 */


var tree_root = document.getElementById("main_tree");
var output_div = document.getElementById("output");
var output_hidden = document.getElementById("output_hidden");
var main_input_box = document.getElementById('input');
var copy_button = document.getElementById("copy_button");
var help_screen = document.getElementById("help_screen_container");
var help_screen_tip = document.getElementById("help_popup");

var class_container = "container";
var class_operands = "operands";
var class_operator = "operator";
var class_number = "number";
var class_numberContainer = 'numberContainer';


/*
 gigantic expression to make a nice grid for color testing:
 1 sin 2 cos + 3 tan 4 asin  − × 7 acos 8 atan ÷ 3 abs 8 ln \ ⬆ % ! 7 log 8 exp C 2 10⬆ 6 2⬆ P atan2 √
 */
var material_colors = [
    "rgb(244, 67, 54)",
    "rgb(233, 30, 99)",
    "rgb(156, 39, 176)",
    "rgb(103, 58, 183)",
    "rgb(63, 81, 181)",
    "rgb(33, 150, 243)",
    "rgb(3, 169, 244)",
    "rgb(0, 188, 212)",
    "rgb(0, 150, 136)",
    "rgb(76, 175, 80)",
    "rgb(139, 195, 74)",
    "rgb(205, 220, 57)",
    "rgb(255, 235, 59)",
    "rgb(255, 193, 7)",
    "rgb(255, 152, 0)",
    "rgb(255, 87, 34)",
    "rgb(121, 85, 72)",
    "rgb(158, 158, 158)",
    "rgb(96, 125, 139)"
];
/*Unicode operator, ASCII operator, number of operands, color, function(evaluator, stack) */
// @formatter:off
var bare_ops_table = [
['+',               '+',     2, material_colors[ 0], ['(', '+', ')'],      function(e,s){return e(s[0])+e(s[1]);}],
['−',               '-',     2, material_colors[ 1], ['(', '−', ')'],      function(e,s){return e(s[0])-e(s[1]);}],
['×',               '*',     2, material_colors[ 2], ['(', '×', ')'],      function(e,s){return e(s[0])*e(s[1]);}],
['÷',               '/',     2, material_colors[ 3], ['(', '÷', ')'],      function(e,s){return e(s[0])/e(s[1]);}],
['%',               '%',     2, material_colors[ 4], ['(', '%', ')'],      function(e,s){return e(s[0])%e(s[1]);}],
['^',               '^',     2, material_colors[ 5], ['(', '^', ')'],      function(e,s){return Math.pow(e(s[0]),e(s[1]));}],
['\\',              '\\',    2, material_colors[ 6], ['(', '\\', ')'],     function(e,s){return e(s[1])/e(s[0]);}],
['\u221A',          'sqrt',  1, material_colors[ 7], ['sqrt(', ')'],       function(e,s){return Math.sqrt(e(s[0]));}],
['sin',             'sin',   1, material_colors[ 8], ['sin(',  ')'],       function(e,s){return Math.sin(e(s[0]));}],
['cos',             'cos',   1, material_colors[ 9], ['cos(',  ')'],       function(e,s){return Math.cos(e(s[0]));}],
['tan',             'tan',   1, material_colors[10], ['tan(',  ')'],       function(e,s){return Math.tan(e(s[0]));}],
['sin\u207b\u00b9', 'asin',  1, material_colors[11], ['asin(', ')'],       function(e,s){return Math.asin(e(s[0]));}],
['cos\u207b\u00b9', 'acos',  1, material_colors[12], ['acos(', ')'],       function(e,s){return Math.acos(e(s[0]));}],
['tan\u207b\u00b9', 'atan',  1, material_colors[13], ['atan(', ')'],       function(e,s){return Math.atan(e(s[0]));}],
['atan2',           'atan2', 2, material_colors[14], ['atan2(', ',', ')'], function(e,s){return Math.atan2(e(s[0]),e(s[1]));}],
['ln',              'ln',    1, material_colors[ 0], ['ln(',  ')'],        function(e,s){return Math.log(e(s[0]));}],
['log',             'log',   1, material_colors[ 1], ['log(', ')'],        function(e,s){return Math.log10(e(s[0]));}],
['lg',              'lg',    1, material_colors[ 2], ['lg(',  ')'],        function(e,s){return Math.log2(e(s[0]));}],
['\u212f^',         'exp',   1, material_colors[ 3], ['exp(', ')'],        function(e,s){return Math.exp(e(s[0]));}],
['10^',             '10^',   1, material_colors[ 4], ['10^(', ')'],        function(e,s){return Math.pow(10,e(s[0]));}],
['2^',              '2^',    1, material_colors[ 5], ['2^(',  ')'],        function(e,s){return Math.pow(2,e(s[1]));}],
['!',               '!',     1, material_colors[14], ['(',   ')!'],        function(e,s){return math.factorial(e(s[0]));}],
['C',               'C',     2, material_colors[15], ['C(', ',', ')'],     function(e,s){return math.combinations(e(s[0]),e(s[1]));}],
['P',               'P',     2, material_colors[16], ['P(', ',', ')'],     function(e,s){return math.permutations(e(s[0]),e(s[1]));}],
['abs',             'abs',   1, material_colors[17], ['abs(', ')'],        function(e,s){return Math.abs(e(s[0]));}],
];
// @formatter:on
var constants = {
    'π': Math.PI,
    '\u212f': Math.E,
    '∞': Infinity,
    '-∞': -Infinity,
};
var constant_replacements = [
    ['pi', 'π'],
    ['e', 'ℯ'],
    ['ℯxp', 'ℯ^'],
    ['inf', '∞'],
    ['-inf', '-∞'],
];
function Operator(row, index) {
    this.index = index;
    this.unicode = row[0];
    this.ASCII = row[1];
    this.needs_replacement = (this.unicode != this.ASCII);
    this.param_count = row[2];
    this.color = row[3];
    this.apply = row[5];
    this.prints = row[4];
}
function Ops(op_table) {
    var replacements = new Map();
    var ops = [];
    var by_label = new Map();
    op_table.forEach(function (v, i) {
        var op = new Operator(v, i);
        ops.push(op);
        by_label.set(op.ASCII, op);
        by_label.set(op.unicode, op);
        if (op.needs_replacement) {
            replacements.set(op.ASCII, op.unicode);
        }
    });
    constant_replacements.forEach(function (v, i) {
        replacements.set(v[0], v[1]);
    });
    this.replacements = replacements;
    this.ops = ops;
    this.by_label = by_label;
}

var operators = new Ops(bare_ops_table);

function Node(value, children, idx_left, idx_right) {
    if (typeof value == "number") {
        this.type = 0;
        this.value = value;
        this.operation = -1;
    } else if (typeof value == "string") {
        this.type = 1;
        this.value = undefined;
        this.op = operators.by_label.get(value);
    }
    if (children != undefined) {
        this.children = children;
    } else {
        this.children = [];
    }
    this.idx_left = idx_left;
    this.idx_right = idx_right;
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
    return n.op.apply(eval_tree, n.children);
}
function print_as_infix(n) {
    if (n.type == Node.type_number) {
        return n.value.toLocaleString();
    }
    var ret = n.op.prints[0];
    for (var i = 0; i < n.children.length; i++) {
        ret += print_as_infix(n.children[i]);
        if (n.op.prints.length > 2 && i < (n.children.length - 1)) {
            ret += n.op.prints[1];
        }
    }
    ret += n.op.prints[n.op.prints.length - 1];
    return ret;
}
function parse_expression(expr) {
    var stack = [];
    var idx_left = 0;
    var idx_right;
    while (idx_left < expr.length) {
        idx_right = idx_left;
        while (expr[idx_right] != ' ' && idx_right < expr.length) {
            /*search for the next space*/
            idx_right++;
        }
        var v = expr.slice(idx_left, idx_right);
        //console.log(idx_left + " " + idx_right + " " + v);
        if (v.toLowerCase() in constants) {
            stack.push(new Node(constants[v.toLowerCase()], [], idx_left, idx_right));
        } else if (operators.by_label.has(v)) {
            /*this is an operator*/
            /*slice off the top of the stack and give it to this operator*/
            var tmp_stack = stack.slice(-operators.by_label.get(v).param_count, stack.length);
            stack = stack.slice(0, -operators.by_label.get(v).param_count);
            var new_node = new Node(v, tmp_stack, idx_left, idx_right);
            stack.push(new_node);
        } else {
            /*this is a number, because it isn't an operator*/
            stack.push(new Node(Number(v), [], idx_left, idx_right));
        }
        idx_left = idx_right;
        while (expr[idx_left] == ' ' && idx_left < expr.length) {
            idx_left++;
        }
    }
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
        parent.onclick = function () {
            main_input_box.setSelectionRange(node.idx_left, node.idx_right);
            //console.log(node.idx_left, node.idx_right);
        };
        /*need a line break after numbers*/
        parent.appendChild(number_node);
        parent.appendChild(document.createElement('br'));
        return parent;
    } else {
        var container = document.createElement('div');
        container.classList.add("box");
        container.classList.add(class_container);
        container.style.backgroundColor = node.op.color;

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
        op_parent.style.backgroundColor = container.style.backgroundColor;
        op_parent.onclick = function () {
            main_input_box.setSelectionRange(node.idx_left, node.idx_right);
        };
        var op_txt = document.createElement('div');
        op_txt.classList.add("operatorContainer");
        //op_txt.textContent = operators[node.operation];
        op_txt.textContent = node.op.unicode;
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

function toggle_help_visibility() {
    if (help_screen.style.opacity == 0) {
        /*show the help screen*/
        help_screen.style.display = "block";
        //document.body.style.zIndex = 1;
        //help_screen.style.opacity = "1";
        /*use a 0-delay timeout so that it has a chance to update the partial css*/
        setTimeout(function () {
            help_screen.style.opacity = 1;
        }, 1);
    } else {
        //help_screen.style.display = "none";
        help_screen.style.opacity = 0;
        setTimeout(function () {
            /*use a delay such that it will not really hide until it is fully
             * transparent*/
            help_screen.style.display = "none";
        }, 1000 / 4);
    }
}
function trim_last_char() {
    /*trim the character right behind the cursor*/
    var cursor_idx = main_input_box.selectionStart;
    var old_val = main_input_box.value;
    main_input_box.value = old_val.slice(0, cursor_idx - 1) + old_val.slice(cursor_idx, old_val.length);
    main_input_box.setSelectionRange(cursor_idx - 1, cursor_idx - 1);
}
function do_replacements() {
    /*TODO: add a config option to not do the unicode replacements*/
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
        if (operators.replacements.has(v.toLowerCase())) {
            tokens.push(operators.replacements.get(v.toLowerCase()));
            /*keep track of how much we're changing the cursor index*/
            if (old_end < index_old_str) {
                //balance_end += replacements[v.toLowerCase()].length - v.length;
                balance_end += operators.replacements.get(v.toLowerCase()).length - v.length;
            }
            if (old_start < index_old_str) {
                //balance_start += replacements[v.toLowerCase()].length - v.length;
                balance_start += operators.replacements.get(v.toLowerCase()).length - v.length;
            }
        } else if (v.length > 1 && v.startsWith('−')) {
            /*fix the unicode minus sign for numbers*/
            tokens.push('-' + v.slice(1, v.length));
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
        trim_last_char();
        toggle_help_visibility();
        help_screen_tip.style.opacity = 0;
        setTimeout(function () {
            help_screen_tip.style.display = "none";
        }, 300);
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
        /*handle constants and unicode and such*/
        do_replacements();
        //console.log("e.keyCode: " + e.keyCode);
        /*parse the rpn expression into an expression tree*/
        var tree = parse_expression(main_input_box.value);
        /*display the tree*/
        display_expression(tree);
        /*evaluate the tree for a numerical value*/
        var output = eval_tree(tree[0]);
        /*process the first separately*/
        var out_locale = '<table class="output"> <tbody class="output">';
        out_locale += '<tr><td>';
        out_locale += output.toLocaleString();
        out_locale += '</td><td>=</td><td>';
        out_locale += print_as_infix(tree[0]);
        out_locale += '</td></tr>';
        var out_raw = output.toString();
        for (var i = 1; i < tree.length; i++) {
            /*process the next, adding line breaks only as needed*/
            output = eval_tree(tree[i]);
            out_locale += '<tr><td>';
            //out_locale += '<br>';
            out_locale += output.toLocaleString();
            out_locale += '</td><td>=</td><td>';
            out_locale += print_as_infix(tree[i]);
            out_locale += '</td></tr>';
            out_raw += '<br>' + output.toString();
        }
        /*set the HTML content*/
        out_locale += '</tbody></table>';
        output_div.innerHTML = out_locale;
        output_hidden.innerHTML = out_raw;
        console.log(print_as_infix(tree[0]));
    }
};
/*call the event handler on page load*/
main_input_box.onkeyup({});
/*make sure the output is always focused*/
console.log(setInterval(function () {
    main_input_box.focus()
}, 100));


