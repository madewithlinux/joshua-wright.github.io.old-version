/**
 * Created by j0sh on 2/14/16.
 */

chars = {
    "A": "<tr><td>A</td><td>Alpha</td><td>Apple</td></tr>",
    "B": "<tr><td>B</td><td>Bravo</td><td>Boy</td></tr>",
    "C": "<tr><td>C</td><td>Charlie</td><td></td></tr>",
    "D": "<tr><td>D</td><td>Delta</td><td></td></tr>",
    "E": "<tr><td>E</td><td>Echo</td><td></td></tr>",
    "F": "<tr><td>F</td><td>Foxtrot</td><td>Fire</td></tr>",
    "G": "<tr><td>G</td><td>Golf</td><td></td></tr>",
    "H": "<tr><td>H</td><td>Hotel</td><td>Horse</td></tr>",
    "I": "<tr><td>I</td><td>India</td><td></td></tr>",
    "J": "<tr><td>J</td><td>Juliett</td><td></td></tr>",
    "K": "<tr><td>K</td><td>Kilo</td><td>King</td></tr>",
    "L": "<tr><td>L</td><td>Lima</td><td>Lemon</td></tr>",
    "M": "<tr><td>M</td><td>Mike</td><td></td></tr>",
    "N": "<tr><td>N</td><td>November</td><td></td></tr>",
    "O": "<tr><td>O</td><td>Oscar</td><td>Orange</td></tr>",
    "P": "<tr><td>P</td><td>Papa</td><td></td></tr>",
    "Q": "<tr><td>Q</td><td>Quibec</td><td>Quarter</td></tr>",
    "R": "<tr><td>R</td><td>Romeo</td><td></td></tr>",
    "S": "<tr><td>S</td><td>Sierra</td><td>Snake</td></tr>",
    "T": "<tr><td>T</td><td>Tango</td><td>Terrific</td></tr>",
    "U": "<tr><td>U</td><td>Uniform</td><td></td></tr>",
    "V": "<tr><td>V</td><td>Victor</td><td></td></tr>",
    "W": "<tr><td>W</td><td>Whiskey</td><td>Wallrus</td></tr>",
    "X": "<tr><td>X</td><td>X-ray</td><td></td></tr>",
    "Y": "<tr><td>Y</td><td>Yankee</td><td></td></tr>",
    "Z": "<tr><td>Z</td><td>Zulu</td><td>Zebra</td></tr>",
    "0": "<tr><td>0</td><td></td><td></td></tr>",
    "1": "<tr><td>1</td><td></td><td></td></tr>",
    "2": "<tr><td>2</td><td></td><td></td></tr>",
    "3": "<tr><td>3</td><td></td><td></td></tr>",
    "4": "<tr><td>4</td><td></td><td></td></tr>",
    "5": "<tr><td>5</td><td></td><td></td></tr>",
    "6": "<tr><td>6</td><td></td><td></td></tr>",
    "7": "<tr><td>7</td><td></td><td></td></tr>",
    "8": "<tr><td>8</td><td></td><td></td></tr>",
    "9": "<tr><td>9</td><td></td><td></td></tr>",
    ".": "<tr><td>.</td><td>Dot</td><td>Period</td></tr>"
};

function spell_input() {
    var phrase = $("#phrase_input").val();
    var output = $("#output_table")[0];
    output.innerHTML = "";
    for (var i = 0; i < phrase.length; i++) {
        if (phrase[i] == ' ') {
            /*skip spaces*/
            continue;
        }
        output.innerHTML += chars[phrase[i].toUpperCase()];
    }
}
$(document).ready(function () {
    $("#phrase_input").keyup(function () {
        /*re-run whenever input changes*/
        spell_input();
    });

});