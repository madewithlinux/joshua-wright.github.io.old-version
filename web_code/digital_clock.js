/**
 * Created by j0sh on 1/27/16.
 */


$(document).ready(function () {

    /*pixel map layout:*/
    // 00 01 02
    // 03 04 05
    // 06 07 08
    // 09 10 11
    // 12 13 14
    pixel_maps = {
        "0": [1, 1, 1, 1, 0, 1, 1, 0, 1, 1, 0, 1, 1, 1, 1],
        "1": [0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0],
        "2": [1, 1, 1, 0, 0, 1, 1, 1, 1, 1, 0, 0, 1, 1, 1],
        "3": [1, 1, 1, 0, 0, 1, 0, 1, 1, 0, 0, 1, 1, 1, 1],
        "4": [1, 0, 1, 1, 0, 1, 1, 1, 1, 0, 0, 1, 0, 0, 1],
        "5": [1, 1, 1, 1, 0, 0, 1, 1, 1, 0, 0, 1, 1, 1, 1],
        "6": [1, 1, 1, 1, 0, 0, 1, 1, 1, 1, 0, 1, 1, 1, 1],
        "7": [1, 1, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1],
        "8": [1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1],
        "9": [1, 1, 1, 1, 0, 1, 1, 1, 1, 0, 0, 1, 0, 0, 1],
        ".": [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0],
        ":": [0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0]
    };

    function Pixel(DOM_Object) {
        this.dom_object = DOM_Object;
        this.subpixels = [];
        for (var i = 0; i < 16; i++) {
            this.subpixels.push(this.dom_object.find(".subpixel_" + i));
        }
        this.set_display = function (val) {
            /*TODO*/
            //console.log(val);
            if (!val in pixel_maps) {
                //console.log(val);
                return;
            }
            for (var i = 0; i < 16; i++) {
                //console.log(val, i);
                if (pixel_maps[val][i] == 1) {
                    //console.log(val, i, pixel_maps[val][i]);
                    this.subpixels[i].css("background", "#333");
                } else {
                    this.subpixels[i].css("background", "#fff");
                }
            }
        }
    }

    var subpixels = $("div.subpixel");
    function set_subpixel_width() {
        subpixels.css("height", subpixels.css('width'));
    }
    set_subpixel_width();
    setInterval(set_subpixel_width, 1000);

    var pixels = [];
    for (var i = 0; i < 8; i++) {
        pixels.push(new Pixel($("#pixel_" + i)));
        pixels[i].set_display('' + i);
    }

    function get_time_string() {
        var padding = "00";
        var d = new Date();
        var hours = d.getHours();
        var minutes = d.getMinutes();
        var seconds = d.getSeconds();
        var out = "";
        out += (padding + (hours % 12)).slice(-2);
        out += ':';
        out += (padding + minutes).slice(-2);
        out += '.';
        out += (padding + seconds).slice(-2);
        return out;
    }

    function update_time() {
        var time_str = get_time_string();
        for (var i = 0; i < 8; i++) {
            pixels[i].set_display(time_str[i]);
        }
        //setTimeout(update_time, 100);
    }
    update_time();
    setInterval(update_time, 1000);
});