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

$("document").ready(function () {

    /*jQueries defined outside functions for caching*/
    var output_table = $("#output")[0];
    var input = $("#value");
    /*default values for when the page loads*/
    /*store these in an object for automatic duplicate resolution and sorting*/
    var values = {
        1: {},
        5: {},
        10: {},
        100: {},
        1000: {},
        2000: {},
        3300: {},
        5100: {},
        10000: {}
    };

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
        if (third == 0) {
            /*case where multiplier is 0, therefore value is direct*/
            var first = 0;
            var second = Math.round(value);
        } else {
            /*case where multiplier is non-zero, therefore first and second make a decimal*/
            third--;
            var first = Math.floor(value);
            var second = Math.round((10 * value) % 10);
        }
        /*simply append a row to the table*/
        output_table.innerHTML += "<tr>" +
                /*locale string adds fancy locale-appropriate commas to the number*/
            "<td>" + Number(original_value).toLocaleString() + "&#8486" + "</td>" +
            "<td style='background: " + colors[first] + ";'>" + colors[first] + "</td>" +
            "<td style='background: " + colors[second] + ";'>" + colors[second] + "</td>" +
            "<td style='background: " + colors[third] + ";'>" + colors[third] + "</td>" +
            "</tr>";
    }

    function write_values() {
        output_table.innerHTML = "";
        $.each(values, function (v, i) {
            write_value(v);
        });
    }

    function write_new() {
        /*re-generate the whole table*/
        values[Number(input.val())] = {};
        write_values();
    }

    input.keyup(function (event) {
        if (event.keyCode == 13) {
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