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
var do_unicode_replacement = document.getElementById("do_unicode_replacement");

var class_container = "container";
var class_operands = "operands";
var class_operator = "operator";
var class_number = "number";
var class_numberContainer = 'numberContainer';

/*detect if we're running in mobile*/
var is_mobile = true;
if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
    is_mobile = false;
}


/*
 gigantic expression to make a nice grid for color testing:
 1 sin ℯ^ 2 cos abs ln + π tan 10^ 1 sin⁻¹ log − × 0 cos⁻¹ 2^ 1 tan⁻¹ lg
 */
var colors = [
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
/*Unicode operator, ASCII operator, number of operands, color, priority, function(evaluator, stack) */
// @formatter:off
var bare_ops_table = [
['+',               '+',     2, colors[ 0], ['', '+', ''],        1, function(s){return s[0]+s[1];}],
['−',               '-',     2, colors[ 1], ['', '−', ''],        1, function(s){return s[0]-s[1];}],
['×',               '*',     2, colors[ 2], ['', '×', ''],        2, function(s){return s[0]*s[1];}],
['÷',               '/',     2, colors[ 3], ['', '÷', ''],        2, function(s){return s[0]/s[1];}],
['%',               '%',     2, colors[ 4], ['', '%', ''],        1, function(s){return s[0]%s[1];}],
['^',               '^',     2, colors[ 5], ['', '^', ''],        4, function(s){return Math.pow(s[0],s[1]);}],
['\\',              '\\',    2, colors[ 6], ['', '\\', ''],       2, function(s){return s[1]/s[0];}],
['\u221A',          'sqrt',  1, colors[ 7], ['sqrt(', ')'],       9, function(s){return Math.sqrt(s[0]);}],
['sin',             'sin',   1, colors[ 8], ['sin(',  ')'],       9, function(s){return Math.sin(s[0]);}],
['cos',             'cos',   1, colors[ 9], ['cos(',  ')'],       9, function(s){return Math.cos(s[0]);}],
['tan',             'tan',   1, colors[10], ['tan(',  ')'],       9, function(s){return Math.tan(s[0]);}],
['sin\u207b\u00b9', 'asin',  1, colors[11], ['asin(', ')'],       9, function(s){return Math.asin(s[0]);}],
['cos\u207b\u00b9', 'acos',  1, colors[12], ['acos(', ')'],       9, function(s){return Math.acos(s[0]);}],
['tan\u207b\u00b9', 'atan',  1, colors[13], ['atan(', ')'],       9, function(s){return Math.atan(s[0]);}],
['atan2',           'atan2', 2, colors[14], ['atan2(', ',', ')'], 9, function(s){return Math.atan2(s[0],s[1]);}],
['ln',              'ln',    1, colors[ 0], ['ln(',  ')'],        9, function(s){return Math.log(s[0]);}],
['log',             'log',   1, colors[ 1], ['log(', ')'],        9, function(s){return Math.log10(s[0]);}],
['lg',              'lg',    1, colors[ 2], ['lg(',  ')'],        9, function(s){return Math.log2(s[0]);}],
['\u212f^',         'exp',   1, colors[ 3], ['exp(', ')'],        9, function(s){return Math.exp(s[0]);}],
['10^',             '10^',   1, colors[ 4], ['10^', ''],          4, function(s){return Math.pow(10,s[0]);}],
['2^',              '2^',    1, colors[ 5], ['2^',  ''],          4, function(s){return Math.pow(2,s[0]);}],
['!',               '!',     1, colors[14], ['', '!'],            6, function(s){return math.factorial(s[0]);}],
['C',               'C',     2, colors[15], ['C(', ',', ')'],     9, function(s){return math.combinations(s[0],s[1]);}],
['P',               'P',     2, colors[16], ['P(', ',', ')'],     9, function(s){return math.permutations(s[0],s[1]);}],
['abs',             'abs',   1, colors[17], ['abs(', ')'],        9, function(s){return Math.abs(s[0]);}],
];
// @formatter:on
var constants = {
    'π': Math.PI,
    '\u212f': Math.E,
    '∞': Infinity,
    '-∞': -Infinity,
    'pi': Math.PI,
    'e': Math.E,
    'inf': Infinity,
    '-inf': -Infinity,
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
    this.priority = row[5];
    this.apply = row[6];
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

    this.as_infix = function () {
        if (this.type == Node.type_number) {
            return this.value.toLocaleString();
        }
        var ret = this.op.prints[0];
        for (var i = 0; i < this.children.length; i++) {
            /*if this isn't a function
             * AND the child has a defined priority
             * AND that priority is less than ours
             * (priority 9 is reserved for functions)*/
            if (this.op.priority != 9
                && this.children[i].type
                && this.children[i].op.priority < this.op.priority) {
                ret += '(';
            }
            ret += this.children[i].as_infix();
            if (this.op.priority != 9
                && this.children[i].type
                && this.children[i].op.priority < this.op.priority) {
                ret += ')';
            }
            /*if we have another thing to print
            * AND we aren't on the last item*/
            if (this.op.prints.length > 2 && i < (this.children.length - 1)) {
                ret += this.op.prints[1];
            }
        }
        ret += this.op.prints[this.op.prints.length - 1];
        return ret;
    };

    this.evaluate = function () {
        if (this.type == Node.type_number) {
            return this.value;
        }
        var stack = children.map(function (v) {
            return v.evaluate();
        });
        return this.op.apply(stack);
    }
}
Node.type_number = 0;
Node.type_operator = 1;

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
        //console.log(idx_left, idx_right, v);
        /*above algorithm doesn't reliably stop spaces at the start of the string*/
        if (v != "") {
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
        /*use a 0-delay timeout so that it has a chance to update the partial css*/
        setTimeout(function () {
            help_screen.style.opacity = 1;
        }, 1);
    } else {
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
    if (!is_mobile || !do_unicode_replacement.checked) {
        /*don't replace the symbols if either we are mobile or the user doesn't want to*/
        return;
    }
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
        /*normal keys*/
        if (!/\S/.test(main_input_box.value)) {
            /*if the input box is empty*/
            output_div.innerHTML = "";
            output_hidden.innerHTML = "";
            tree_root.innerHTML = "";
        } else {
            /*handle constants and unicode and such*/
            do_replacements();
            //console.log("e.keyCode: " + e.keyCode);

            /*parse the rpn expression into an expression tree*/
            var tree = parse_expression(main_input_box.value);
            /*display the tree*/
            display_expression(tree);

            /*evaluate the tree for a numerical value*/
            var output = tree[0].evaluate();
            /*make the table*/
            var out_locale = '<table class="output"> <tbody class="output">';

            /*process the first separately*/
            out_locale += '<tr><td>';
            /*number*/
            out_locale += output.toLocaleString();
            out_locale += '</td><td>=</td><td>';
            /*expression*/
            out_locale += tree[0].as_infix();
            out_locale += '</td></tr>';
            /*raw, for copying*/
            var out_raw = output.toString();

            for (var i = 1; i < tree.length; i++) {
                /*process the next*/
                output = tree[i].evaluate();
                out_locale += '<tr><td>';
                out_locale += output.toLocaleString();
                out_locale += '</td><td>=</td><td>';
                out_locale += tree[i].as_infix();
                out_locale += '</td></tr>';
                /*this way we only add raw line breaks between the numbers as
                 *needed, avoiding a trailing newline*/
                out_raw += '<br>' + output.toString();
            }
            /*set the HTML content*/
            out_locale += '</tbody></table>';
            output_div.innerHTML = out_locale;
            output_hidden.innerHTML = out_raw;
        }
    }
};
/*call the event handler on page load*/
main_input_box.onkeyup({});
/*make sure the output is always focused*/
console.log(setInterval(function () {
    main_input_box.focus()
}, 100));


