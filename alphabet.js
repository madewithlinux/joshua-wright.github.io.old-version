/**
 * Created by j0sh on 2/14/16.
 */

var chars = {
    "A": ["A", "Alpha", "Apple"],
    "B": ["B", "Bravo", "Boy"],
    "C": ["C", "Charlie", ""],
    "D": ["D", "Delta", ""],
    "E": ["E", "Echo", ""],
    "F": ["F", "Foxtrot", "Fire"],
    "G": ["G", "Golf", ""],
    "H": ["H", "Hotel", "Horse"],
    "I": ["I", "India", ""],
    "J": ["J", "Juliett", ""],
    "K": ["K", "Kilo", "King"],
    "L": ["L", "Lima", "Lemon"],
    "M": ["M", "Mike", ""],
    "N": ["N", "November", ""],
    "O": ["O", "Oscar", "Orange"],
    "P": ["P", "Papa", ""],
    "Q": ["Q", "Quibec", "Quarter"],
    "R": ["R", "Romeo", ""],
    "S": ["S", "Sierra", "Snake"],
    "T": ["T", "Tango", "Terrific"],
    "U": ["U", "Uniform", ""],
    "V": ["V", "Victor", ""],
    "W": ["W", "Whiskey", "Wallrus"],
    "X": ["X", "X-ray", ""],
    "Y": ["Y", "Yankee", ""],
    "Z": ["Z", "Zulu", "Zebra"],
    "0": ["0", "Zero", ""],
    "1": ["1", "One", ""],
    "2": ["2", "Two", ""],
    "3": ["3", "Three", ""],
    "4": ["4", "Four", ""],
    "5": ["5", "Five", ""],
    "6": ["6", "Six", ""],
    "7": ["7", "Seven", ""],
    "8": ["8", "Eight", ""],
    "9": ["9", "Nine", ""],
    ".": [".", "Dot", "Period"],
    "-": ["-", "Dash", "Hyphen"],
    "_": ["-", "Underscore", ""],
    ":": [":", "Colon", ""],
    ";": ["$", "Dollar Sign", ""],
    "!": ["!", "Exclamation Mark", ""],
    "@": ["@", "At Sign", ""],
    "$": ["", "Semi Colon", ""],
    "%": ["%", "Percentage Sign", ""],
    "^": ["^", "Caret", ""],
    "&": ["&", "Amperstand", "And Symbol"],
    "*": ["*", "Asterisk", ""],
    "/": ["/", "Forward Slash", ""],
    "\\": ["\\", "BackSlash", ""],
    "\n": ["\\n", "New LineReturn", ""],
    "\t": ["\\t", "Tab", ""],
    " ": [" ", "Space", ""]
};

$(document).ready(function () {
    var input = $("#phrase_input");
    var output = $("#output_table")[0];

    function spell_input() {
        output.innerHTML = "";
        var phrase = input.val();
        for (var i = 0; i < phrase.length; i++) {
            if (chars.hasOwnProperty(phrase[i].toUpperCase())) {
                /*print the stuff if we have a word for this character*/
                output_table.innerHTML += "<tr><td>" + chars[phrase[i].toUpperCase()][0] +
                    "</td><td>" + chars[phrase[i].toUpperCase()][1] +
                    "</td><td>" + chars[phrase[i].toUpperCase()][2] + "</td></tr>";
            } else {
                /*fallback on just displaying the character*/
                output_table.innerHTML += "<tr><td>" + phrase[i].toUpperCase() + "</td><td></td><td></td></tr>";
            }
        }
    }

    input.keyup(function () {
        /*re-run whenever input changes*/
        spell_input();
    });

    /*always be focused*/
    setInterval(function () {
        input.focus()
    }, 100);

});