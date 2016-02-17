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

    /*jqueries for caching*/
    var output_table = $("#output")[0];
    var input = $("#value");
    /*default values for when the page loads*/
    var values = [10, 100, 1000, 2000, 3300, 5100, 10000];

    function write_value(value) {
        //weird math to get resistor color codes.
        /*TODO: fix math for resistors less than 10 ohms*/
        var third = Math.floor(Math.log10(value)) - 1;
        var first = Math.floor(value / Math.pow(10, third + 1));
        var second = Math.round(value / Math.pow(10, third)) % 10;
        //simply append a row to the table
        output_table.innerHTML += "<tr>" +
            "<td>" + value.toString() + "&#8486" + "</td>" +
            "<td style='background: " + colors[first] + ";'>" + colors[first] + "</td>" +
            "<td style='background: " + colors[second] + ";'>" + colors[second] + "</td>" +
            "<td style='background: " + colors[third] + ";'>" + colors[third] + "</td>" +
            "</tr>";
    }

    function write_values() {
        //clear existingrows from the table
        output_table.innerHTML = "";
        /*write each value back to the table*/
        values.forEach(function (v, i) {
            write_value(v);
        });
    }

    input.keyup(function (event) {
        if (event.keyCode == 13) {
            /*add the new value*/
            values.push(Number(input.val()));
            /*re-sort the array to put it in it's place*/
            values.sort(function(a,b) {return a > b;});
            /*re-generate the whole table*/
            write_values();
        }
    });

    /*generate initial values for when the page loads*/
    write_values();


});