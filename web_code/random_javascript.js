/**
 * Created by j0sh on 2/20/16.
 */

$(document).ready(function () {

    /*cache jQueries for speed*/
    var number_to_factor = $("#number_to_factor");
    var number_to_factor_0 = number_to_factor[0];
    var factor_output = $("#factor_output");
    var factor_output_0 = factor_output[0];
    var max_prime = $("#max_prime");
    var max_prime_0 = max_prime[0];
    var prime_output = $("#prime_output");
    var prime_output_0 = prime_output[0];

    ///////////////
    // factoring //
    ///////////////
    function do_factoring() {
        var num = number_to_factor_0.value;
        /*this strategy for updating the HTML all at once is faster than updating
         * it inside the loop*/
        var output = "";
        for (var i = 1; i <= num; i++) {
            if (num % i === 0) {
                output += "<tr><td>" + i + "</td><td>" + (num / i) + "</tr></td>";
            }
        }
        factor_output_0.innerHTML = output;

    }

    /*when the user releases the enter key, trigger the action*/
    number_to_factor.keyup(function (e) {
        /*check that the key was the enter key (keycode 13)*/
        if (e.keyCode == 13) {
            do_factoring();
        }
    });
    /*also trigger the action when the button is clicked*/
    $("#factor_button").click(do_factoring);
    /*all we have to do to clear it is set all the HTML inside it to an empty string*/
    $("#factor_clear").click(function () {
        factor_output_0.innerHTML = "";
    });


    ////////////
    // primes //
    ////////////
    function find_max_primes() {
        /*get the start time*/
        var time_start = new Date().getTime();
        /*get the target value*/
        var max_prime_value = max_prime_0.value;
        /*clear the output box*/
        prime_output_0.innerHTML = "";
        var i = 2; /*the starting prime*/
        /*allocate an array of primes. uint8 is the smallest typed (fast) array
         * in JavaScript*/
        var primes = new Uint8Array(max_prime_value);
        /*fill it with true, and we'll 'cross out' the ones for which prime isn't true */
        primes.fill(1);
        /*cross out the non-primes*/
        while (i * i < max_prime_value) {
            for (var j = i * i; j < max_prime_value; j += i) {
                primes[j] = 0;
            }
            i++;
        }
        /*get the ending time*/
        var time_taken = new Date().getTime() - time_start;
        /*output the remaining primes that passed the test*/
        /*make a string of the output before we output it. This lets the browser
         * process all the HTML at once, which is far more efficient than each
         * bit one at a time*/
        var output = "Time: " + time_taken + "ms<br>";
        for (var k = 2; k < primes.length; k++) {
            if (primes[k]) {
                output += k + " ";
            }
        }
        /*pass this HTML to the browser all in one chunk*/
        prime_output_0.innerHTML = output;
    }

    max_prime.bind("enterKey", find_max_primes);

    /*when the user releases the enter key, trigger the action*/
    max_prime.keyup(function (e) {
        if (e.keyCode == 13) {
            find_max_primes();
        }
    });

    /*also trigger the action when the button is clicked*/
    $("#prime_button").click(find_max_primes);
    $("#prime_clear").click(function () {
        //$("#prime_output").empty();
        prime_output_0.innerHTML = "";
    });

});