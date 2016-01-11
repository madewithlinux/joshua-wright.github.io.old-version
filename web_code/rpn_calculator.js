$(document).ready(function(){
	    ////////////////////
    // RPN Calculator //
    ////////////////////

    /*the stack will be represented using an array*/
    var stack = [0];

    /*this function prints the stack to the webpage*/
    function update_stack() {
        /*empty out the HTML already in the stack*/
        $("#stack_output").empty();
        /*print out the stack one item per line*/
        for (var i=(stack.length - 1); i>=0; i--) {
            /*print the stack in reverse order since the last (top) element is the one we care most about*/
            $("#stack_output").append(stack[i] + "<br>");
        }
    };
    /*update the stack the first time so it shows on the page*/
    update_stack();

    /*convert the numbers to strings and then back to numbers because we want to add digits to the
     * right end of them regardless of if the number has a decimal point*/
    $("#button_0").click(function(){ stack.push(Number(stack.pop().toString() + "0")); update_stack(); });
    $("#button_1").click(function(){ stack.push(Number(stack.pop().toString() + "1")); update_stack(); });
    $("#button_2").click(function(){ stack.push(Number(stack.pop().toString() + "2")); update_stack(); });
    $("#button_3").click(function(){ stack.push(Number(stack.pop().toString() + "3")); update_stack(); });
    $("#button_4").click(function(){ stack.push(Number(stack.pop().toString() + "4")); update_stack(); });
    $("#button_5").click(function(){ stack.push(Number(stack.pop().toString() + "5")); update_stack(); });
    $("#button_6").click(function(){ stack.push(Number(stack.pop().toString() + "6")); update_stack(); });
    $("#button_7").click(function(){ stack.push(Number(stack.pop().toString() + "7")); update_stack(); });
    $("#button_8").click(function(){ stack.push(Number(stack.pop().toString() + "8")); update_stack(); });
    $("#button_9").click(function(){ stack.push(Number(stack.pop().toString() + "9")); update_stack(); });
    
    /*here we leave the number as a string and let JavaScript figure out how to do math with it later*/
    $("#button_decimal").click(function(){ stack.push(stack.pop().toString() + "."); update_stack(); });

    $("#button_plus"    ).click(function(){
    	if (stack.length > 1) {
	    	stack.push(stack.pop() + stack.pop()); update_stack(); 
        }
    });
    $("#button_multiply").click(function(){
    	if (stack.length > 1) {
	    	stack.push(stack.pop() * stack.pop()); update_stack(); 
        }
    });
    /*addition and subtraction are special because we must swap around the operands, because 
     * popping them from the stack gives us them in reverse order*/
    $("#button_minus"   ).click(function(){
        if (stack.length > 1) {
            var rhs = stack.pop();
            var lhs = stack.pop();
            stack.push(lhs - rhs);
            update_stack();
        }
    });
    $("#button_divide"  ).click(function(){
        if (stack.length > 1) {
            var rhs = stack.pop();
            var lhs = stack.pop();
            stack.push(lhs / rhs);
            update_stack();
        }
    });

    /*clear all items on the stack*/
    $("#button_clear").click(function(){ stack = []; update_stack(); });
    /*reset the top element on the stack*/
    $("#button_clear_entry").click(function(){ stack[stack.length - 1] = 0; update_stack(); });
    /*push a 0 onto the stack for us to work with*/
    $("#button_enter").click(function(){ stack.push(0); update_stack(); });
    /*remove the last digit of the top element on the stack*/
    $("#button_backspace").click(function(){
        stack.push(Number(stack.pop().toString().slice(0,-1)));
        update_stack();
    });

    /*size the buttons of the calculator*/
    var size = $("#numpad").css("width").slice(0,-2) ;
    if (size > 500) {
        size = 500;
    }
    $("#numpad").css("height", size/4);
    $("#numpad").css("width", size/4);
    $(".numpad_button").css("height", size/4);
    $(".numpad_button").css("width", size/4);

});