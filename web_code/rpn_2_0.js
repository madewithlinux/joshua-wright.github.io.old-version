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

var operators = ['+', '-', '×', '÷', '%', '^'];
var operator_colors = [
    "#aaa",
    "#ccc",
    "#eee",
    "#fff",
    "#fff",
    "#fff",
    "#fff",
    "#fff",
    "#fff",
    "#fff",
    "#fff",
    "#fff",
    "#fff"
];


function Node(value, children) {
    if (typeof value == "number") {
        this.type = 0;
        this.value = value;
        this.operation = -1;
    } else if (typeof value == "string") {
        this.type = 1;
        this.value = undefined;
        this.operation = operators.indexOf(value);
    }
    if (children != undefined) {
        this.children = children;
    } else {
        this.children = [];
    }
}
Node.type_number = 0;
Node.type_operator = 1;


function evaluate_expression(node) {
    if (node == undefined) {
        return 0;
    }
    if (node.type == Node.type_number) {
        return node.value;
    }
    var val;
    switch (node.operation) {
        case 0: /*addition*/
            val = 0;
            node.children.forEach(function (v, i) {
                val += evaluate_expression(v);
            });
            break;
        case 2: /*multiplication*/
            val = 1;
            node.children.forEach(function (v, i) {
                val *= evaluate_expression(v);
            });
            break;
        case 1: /*subtraction*/
            val = evaluate_expression(node.children[0]) - evaluate_expression(node.children[1]);
            break;
        case 3: /*division*/
            val = evaluate_expression(node.children[0]) / evaluate_expression(node.children[1]);
            break;
        case 4: /*modulo*/
            val = evaluate_expression(node.children[0]) % evaluate_expression(node.children[1]);
            break;
        case 5: /*exponent*/
            val = Math.pow(evaluate_expression(node.children[0]), evaluate_expression(node.children[1]));
            break;
    }
    return val;
}
function parse_expression(expr) {
    var stack = [];
    var stream = expr.split(' ');
    stream.forEach(function (v, i) {
        if (v == "") {
            return;
        }
        var op = operators.indexOf(v);
        if (op == -1) {
            /*this is a number, because it isn't an operator*/
            stack.push(new Node(Number(v)));
        } else {
            /*this is an operator*/
            /*TODO: will need to change this for non-binary operators*/
            var i2 = stack.pop();
            var i1 = stack.pop();
            var new_node = new Node(v, [i1, i2]);
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
        container.style.backgroundColor = operator_colors[node.operation];

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
        op_parent.style.backgroundColor = operator_colors[node.operation];
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
        //var height = elements[i].parentElement.clientHeight;
        //var height = elements[i].parentElement.getBoundingClientRect().height;
        var height = elements[i].previousSibling.getBoundingClientRect().height;
        elements[i].position = "relative";
        elements[i].style.height = (height - 20) + 'px';
    }
}
function display_expression(node) {
    //console.log(node);
    //if (node == undefined) {
    //    return;
    //}
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
    /*use a timeout to give the browser time to see the new HTML nodes*/
    //setTimeout(center_operators, 10);
    center_operators();
}

function trim_last_char() {
    main_input_box.value = main_input_box.value.slice(0, -1);
}
main_input_box.onkeyup = function (e) {
    var KEYCODE_SLASH_QUESTION_MARK = 191;
    var KEYCODE_EIGHT_MULTIPLY = 56;
    var KEYCODE_C = 67;
    if (e.keyCode == KEYCODE_SLASH_QUESTION_MARK && e.shiftKey) {
        /*question mark*/
        /*TODO: show help*/
        console.log("TODO: show help");
        trim_last_char();
    } else if (e.keyCode == KEYCODE_C && e.ctrlKey) {
        e.preventDefault();
        /*TODO: copy output*/
        //console.log("TODO: copy output");
        /*make a selection range*/
        var range = document.createRange();
        /*make the hidden output visible for copying*/
        output_hidden.style.display = "block";
        /*add the hidden output to the selection range*/
        range.selectNode(output_hidden);
        console.log(range.toString());
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
    } else {
        if (e.keyCode == KEYCODE_SLASH_QUESTION_MARK) {
            trim_last_char();
            main_input_box.value += "÷";
        } else if (e.keyCode == KEYCODE_EIGHT_MULTIPLY && e.shiftKey) {
            trim_last_char();
            main_input_box.value += "×";
        }
        console.log("e.keyCode: " + e.keyCode);
        /*parse the rpn expression into an expression tree*/
        var tree = parse_expression(main_input_box.value);
        /*display the tree*/
        display_expression(tree);
        /*evaluate the tree for a numberical value*/
        var output = evaluate_expression(tree[0]);
        output_div.textContent = output.toLocaleString();
        output_hidden.textContent = output.toString();
    }
};
main_input_box.onkeyup({});
/*make sure the output is always focused*/
console.log(setInterval(function () {
    main_input_box.focus()
}, 100));

/*instanciate the clipboard object*/
//var clipboard = new Clipboard('.btn');

