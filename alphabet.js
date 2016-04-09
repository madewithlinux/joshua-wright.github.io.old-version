/**
 * Created by j0sh on 2/14/16.
 */

var chars = {
    "A": ["A", "Alpha", "Apple"],
    "B": ["B", "Bravo", "Boy"],
    "C": ["C", "Charlie", ""],
    "D": ["D", "Delta", ""],
    "E": ["E", "Echo", "Elephant"],
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
    "P": ["P", "Papa", "Pilot"],
    "Q": ["Q", "Quibec", "Quarter"],
    "R": ["R", "Romeo", ""],
    "S": ["S", "Sierra", "Snake"],
    "T": ["T", "Tango", "Terrific"],
    "U": ["U", "Uniform", ""],
    "V": ["V", "Victor", ""],
    "W": ["W", "Whiskey", "Wallrus"],
    "X": ["X", "X-ray", ""],
    "Y": ["Y", "Yankee", "Yellow"],
    "Z": ["Z", "Zulu", "Zebra"],
    "0": ["0", "The Number Zero", ""],
    "1": ["1", "The Number One", ""],
    "2": ["2", "The Number Two", ""],
    "3": ["3", "The Number Three", ""],
    "4": ["4", "The Number Four", ""],
    "5": ["5", "The Number Five", ""],
    "6": ["6", "The Number Six", ""],
    "7": ["7", "The Number Seven", ""],
    "8": ["8", "The Number Eight", ""],
    "9": ["9", "The Number Nine", ""],
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
    var spaces_checkbox = $("#remove_spaces");
    var count_span_0 = $("#count")[0];
    var spaces_checkbox_0 = spaces_checkbox[0];

    function spell_input() {
        output.innerHTML = "";
        var phrase = input.val();
        var count = 0;
        for (var i = 0; i < phrase.length; i++) {
            if (chars.hasOwnProperty(phrase[i].toUpperCase())) {
                if (spaces_checkbox_0.checked && phrase[i] == " ") {
                    continue;
                }
                count++;
                /*print the stuff if we have a word for this character*/
                output_table.innerHTML += "<tr><td>" + chars[phrase[i].toUpperCase()][0] +
                    "</td><td>" + chars[phrase[i].toUpperCase()][1] +
                    "</td><td>" + chars[phrase[i].toUpperCase()][2] + "</td></tr>";
            } else {
                /*fallback on just displaying the character*/
                output_table.innerHTML += "<tr><td>" + phrase[i].toUpperCase() + "</td><td></td><td></td></tr>";
            }
        }
        count_span_0.innerHTML = "Count: " + count;
    }

    input.keyup(function (e) {
        /*re-run whenever input changes*/
        var KEYCODE_ESCAPE = 27;
        if (e.keyCode == KEYCODE_ESCAPE) {
            /*clear the input field when we hit escape*/
            input.val('');
        }
        spell_input();
    });

    spaces_checkbox.click(spell_input);

    /*always be focused*/
    setInterval(function () {
        input.focus()
    }, 100);

});