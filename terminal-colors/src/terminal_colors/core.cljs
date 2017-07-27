(ns terminal-colors.core
  (:require [reagent.core :as r]
            [reagent.cookies :as cookies]
            [clojure.string :as str]
            [terminal-colors.data :as data]
            [thi.ng.color.core :as col]
            [goog.string :as gstring]
            [goog.string.format]
            [goog.object :as object]))

(enable-console-print!)

(def ^:const cookie-key "terminal-colors")
(def ansi-colors
  (cookies/get
    cookie-key
    {"ansi-black"          "595959"
     "ansi-red"            "C1494A"
     "ansi-green"          "90A959"
     "ansi-yellow"         "D6A056"
     "ansi-blue"           "6A9FB5"
     "ansi-magenta"        "AA759F"
     "ansi-cyan"           "419284"
     "ansi-white"          "404850"
     "ansi-bright-black"   "595959"
     "ansi-bright-red"     "C1494A"
     "ansi-bright-green"   "90A959"
     "ansi-bright-yellow"  "D6A056"
     "ansi-bright-blue"    "6A9FB5"
     "ansi-bright-magenta" "AA759F"
     "ansi-bright-cyan"    "75B5AA"
     "ansi-bright-white"   "404850"
     "background"          "f0f0f0"
     "foreground"          "3b3b3b"}))
(def ^:const ansi-color-labels
  ["ansi-black"
   "ansi-red"
   "ansi-green"
   "ansi-yellow"
   "ansi-blue"
   "ansi-magenta"
   "ansi-cyan"
   "ansi-white"
   "ansi-bright-black"
   "ansi-bright-red"
   "ansi-bright-green"
   "ansi-bright-yellow"
   "ansi-bright-blue"
   "ansi-bright-magenta"
   "ansi-bright-cyan"
   "ansi-bright-white"
   "background"
   "foreground"])
(def ^:const no-ansi-color-labels
  ["black"
   "red"
   "green"
   "yellow"
   "blue"
   "magenta"
   "cyan"
   "white"
   "bright-black"
   "bright-red"
   "bright-green"
   "bright-yellow"
   "bright-blue"
   "bright-magenta"
   "bright-cyan"
   "bright-white"
   "background"
   "foreground"])

(defn st-export [colors]
  (str
    "static const char *colorname[] = {\n"
    "\t/* 8 normal colors */\n"
    "\t[ 1] = \"#" (colors "ansi-black") "\", /* black   */ \n"
    "\t[ 2] = \"#" (colors "ansi-red") "\", /* red     */ \n"
    "\t[ 3] = \"#" (colors "ansi-green") "\", /* green   */ \n"
    "\t[ 4] = \"#" (colors "ansi-yellow") "\", /* yellow  */ \n"
    "\t[ 5] = \"#" (colors "ansi-blue") "\", /* blue    */ \n"
    "\t[ 6] = \"#" (colors "ansi-magenta") "\", /* magenta */ \n"
    "\t[ 7] = \"#" (colors "ansi-cyan") "\", /* cyan    */ \n"
    "\t[ 8] = \"#" (colors "ansi-white") "\", /* white   */ \n"
    "\t/* 8 bright colors */\n"
    "\t[ 9] = \"#" (colors "ansi-bright-black") "\", /* black   */ \n"
    "\t[10] = \"#" (colors "ansi-bright-red") "\", /* red     */ \n"
    "\t[11] = \"#" (colors "ansi-bright-green") "\", /* green   */ \n"
    "\t[12] = \"#" (colors "ansi-bright-yellow") "\", /* yellow  */ \n"
    "\t[13] = \"#" (colors "ansi-bright-blue") "\", /* blue    */ \n"
    "\t[14] = \"#" (colors "ansi-bright-magenta") "\", /* magenta */ \n"
    "\t[15] = \"#" (colors "ansi-bright-cyan") "\", /* cyan    */ \n"
    "\t[16] = \"#" (colors "ansi-bright-white") "\", /* white   */ \n"
    "\t/* special colors */\n"
    "\t[256] = #" (colors "background") "\", /* background */\n"
    "\t[257] = #" (colors "foreground") "\", /* foreground */\n"
    "};\n"))

(def ^:const ansi-colors-dom (.getElementById js/document "ansi-colors"))
(def ^:const config-dom (.getElementById js/document "config-display"))
(defn update-ansi-colors [colors]
  (cookies/set! cookie-key colors)
  (let [css (apply str (map (fn [[class color]]
                              (str
                                "." class "-bg { background-color: #" color ";}"
                                "." class "-fg { color: #" color ";}"))
                            colors))]
    (set! (.-innerText ansi-colors-dom) css)
    (set! (.-innerHTML config-dom)
          (str "<pre>" (st-export colors) "</pre>"))))
(update-ansi-colors ansi-colors)

(def ansi-up (new js/AnsiUp))
(object/set ansi-up "use_classes" true)

(def ansi-reset "\033[0m")
(defn render-ansi-chunks [& chunks]
  (set! (.-innerHTML (.getElementById js/document "terminal-display"))
        (str
          "<pre>"
          ;(apply str (map #((object/get ansi-up "ansi_to_html") (str ansi-reset "\n" %)) chunks))
          (apply str (map #(.ansi-to-html ansi-up (str ansi-reset "\n" %)) chunks))
          "</pre>")))
(render-ansi-chunks data/colortest-16 data/htop data/ipython data/dstat)


(defn equiv-grey [color]
  (col/brightness (col/css (str "#" color))))

(defn hsl-color-str [color]
  (let [color @(col/as-hsla (col/css (str "#" color)))
        [h s l a] color]
    ""
    (gstring/format "hsl(%.2f,%.2f,%.2f)" h s l)))

(defn colorpicker [acolors ansi-label index aselected apicker]
  (let [color (@acolors ansi-label)]
    [:div.color-container
     {:style    {:background-color (str "#" color)
                 :color            (if (> (equiv-grey color)
                                          0.5)
                                     "#222" "#eee")}
      :on-click (fn []
                  (reset! aselected ansi-label)
                  (when-let [picker @apicker]
                    (.setColor picker (@acolors @aselected) "RGB" 1 true)
                    (.saveAsBackground picker)))}
     [:div {:class (str "color"
                        (if (= ansi-label @aselected)
                          " color-selected"))}
      [:div.color-label
       [:div.color-index (case index
                           16 256
                           17 257
                           index)]
       [:div.color-name (no-ansi-color-labels index)]]
      [:div.color-value
       (str "#" color)
       [:br]
       (hsl-color-str color)]]]))


(defn colortable []
  (let [colors   (r/atom ansi-colors)
        selected (r/atom "ansi-black")
        picker   (r/atom nil)]
    (fn []
      [:div
       (into [:div]
             (map (fn [idx] [colorpicker colors (ansi-color-labels idx) idx selected picker])
                  [0 8 1 9 2 10 3 11 4 12 5 13 6 14 7 15 16 17]))
       [:div {:id  "colorpicker-target"
              :ref (fn [elem]
                     (when elem
                       (set! (.-innerHTML elem) "")
                       (reset! picker (new js/ColorPicker
                                        (clj->js {"appendTo"
                                                  elem
                                                  "color"
                                                  (@colors @selected)
                                                  "renderCallback"
                                                  (fn [a]
                                                    (swap! colors assoc @selected (.-HEX a))
                                                    (update-ansi-colors @colors))})))))}]
       [:div.import-export
        "Import/export as JSON "
        [:input {
                 :value     (->> ansi-color-labels
                                 (map ansi-colors)
                                 vec
                                 clj->js
                                 js/JSON.stringify)
                 :on-change (fn [e]
                              (->> e
                                   .-target
                                   .-value
                                   js/JSON.parse
                                   js->clj
                                   (zipmap ansi-color-labels)
                                   (reset! colors)))}]]])))



(r/render [colortable]
          (.getElementById js/document "render-target1"))
