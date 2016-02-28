/**
 * Created by j0sh on 2/16/16.
 */

/*color-value correlations*/
var colors = {
    0: "Black",
    1: "Brown",
    2: "Red",
    3: "Orange",
    4: "Yellow",
    5: "Green",
    6: "Blue",
    7: "Violet",
    8: "Gray",
    9: "White"
};
var storage_cookie = "resistor_values";

$("document").ready(function () {

    /*jQueries defined outside functions for caching*/
    var output_table = $("#output")[0];
    var input = $("#value");
    var values;
    if (Cookies.get(storage_cookie) == undefined) {
        /*no cookie to load from, so set defaults*/
        values = new Set([1, 5, 10, 100, 1000, 2000, 3300, 5100, 10000]);
        Cookies.set(storage_cookie, [1, 5, 10, 100, 1000, 2000, 3300, 5100, 10000]);
    } else {
        /*load from the cookie*/
        /*Using eval(): unsafe? Maybe. Works? Yes.*/
        values = new Set(eval(Cookies.get(storage_cookie)));
    }

    function write_value(value) {
        /*preserve the original value for printing later*/
        var original_value = value;
        /*weird math to get resistor color codes*/
        var third = 0;
        /*find the multiplier*/
        while (value >= 10) {
            value /= 10;
            third++;
        }
        var first;
        var second;
        if (third == 0) {
            /*case where multiplier is 0, therefore value is direct*/
            first = 0;
            second = Math.round(value);
        } else {
            /*case where multiplier is non-zero, therefore first and second make a decimal*/
            third--;
            first = Math.floor(value);
            second = Math.round((10 * value) % 10);
        }
        /*simply append a row to the table*/
        output_table.innerHTML += "<tr>" +
                /*locale string adds fancy locale-appropriate commas to the number*/
            "<td>" + Number(original_value).toLocaleString() + "&#8486" + "</td>" +
            "<td style='background: " + colors[first] + ";'>" + colors[first] + "</td>" +
            "<td style='background: " + colors[second] + ";'>" + colors[second] + "</td>" +
            "<td style='background: " + colors[third] + ";'>" + colors[third] + "</td>" +
                /*store the unformatted number in the id attribute*/
            "<td class='remove_btn' id='" + Number(original_value).toString() + "'> <strong><a href='#'>X</a></strong></td>" +
            "</tr>";
    }

    function save_values() {
        var values_tmp = [];
        values.forEach(function (v, i) {
            values_tmp.push(v);
        });
        /*save resistor values*/
        Cookies.set(storage_cookie, values_tmp);
    }

    function write_values() {
        output_table.innerHTML = "";
        var values_tmp = [];
        values.forEach(function (v, i) {
            values_tmp.push(v);
        });
        values_tmp.sort(function (a, b) {
            /*use subtraction, not comparison operators, because sort needs
             * three-output comparison*/
            return a - b;
        });
        values_tmp.forEach(function (v, i) {
            write_value(v);
        });
        console.log(values_tmp);
        a = values_tmp;
        /*set callbacks for remove buttons*/
        /*re-run the jQuery evey time, because the page layout will has changed*/
        $(".remove_btn").click(function () {
            values.delete(Number(this.id));
            this.parentNode.remove();
            save_values();
        });
        save_values();
    }

    function write_new() {
        /*add the new number*/
        values.add(Number(input.val()));
        /*re-generate the whole table*/
        write_values();
    }

    input.keyup(function (event) {
        if (event.keyCode == 13/*enter key*/) {
            write_new();
        }
    });

    $("#go_btn").click(function () {
        write_new();
    });

    /*generate initial values for when the page loads*/
    write_values();

})
;