(ns terminal-colors.core
  (:require [reagent.core :as r]
            [clojure.string :as str]
            [terminal-colors.data :refer [htop more-prompt]]
            [terminal-colors.data :as data]
            [thi.ng.color.core :as col]))

(enable-console-print!)
(println "---------------------------------------------------------")
(println "---------------------------------------------------------")
(println "---------------------------------------------------------")

(def ansi-colors
  {"ansi-black"          "595959"
   "ansi-red"            "c1494a"
   "ansi-green"          "90a959"
   "ansi-yellow"         "d6a056"
   "ansi-blue"           "6a9fb5"
   "ansi-magenta"        "aa759f"
   "ansi-cyan"           "419284"
   "ansi-white"          "404850"
   "ansi-bright-black"   "595959"
   "ansi-bright-red"     "c1494a"
   "ansi-bright-green"   "90a959"
   "ansi-bright-yellow"  "d6a056"
   "ansi-bright-blue"    "6a9fb5"
   "ansi-bright-magenta" "aa759f"
   "ansi-bright-cyan"    "75b5aa"
   "ansi-bright-white"   "404850"})
(def ansi-color-labels
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
   "ansi-bright-white"])
(def no-ansi-color-labels
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
   "bright-white"])

(def ansi-colors-dom (.getElementById js/document "ansi-colors"))
(defn update-ansi-colors [colors]
  (let [css (apply str (map (fn [[class color]]
                              (str
                                "." class "-bg { background-color: #" color ";}"
                                "." class "-fg { color: #" color ";}"))
                            colors))]
    (set! (.-innerText ansi-colors-dom) css)))
(update-ansi-colors ansi-colors)

(def ansi-up (new js/AnsiUp))
(set! ansi-up.use_classes true)

(def ansi-reset "\033[0m")
(defn render-ansi-chunks [& chunks]
  (set! (.-innerHTML (.getElementById js/document "terminal-display"))
        (str
          "<pre>"
          (apply str (map #(.ansi_to_html ansi-up (str ansi-reset "\n" %)) chunks))
          "</pre>")))
(render-ansi-chunks data/htop data/ipython data/dstat)


(defn equiv-grey [color]
  (.-colors.equivalentGrey (new js/Colors (clj->js {"color" color}))))
(println (equiv-grey "#000000"))
(println (equiv-grey "#ffffff"))
(defn lab-color [color]
  (let [color [@(col/as-hsla (col/css (str "#" color)))]
        [h s l a] color]
    (println color)
    (set! js/b color)
    ""
    (str "hsl(" h "," s "," l ")")))

(defn colorpicker [acolors ansi-label index aselected apicker]
  [:div {:class    "color-container"
         :style    {:background-color (str "#" (@acolors ansi-label))
                    :color (if (> (equiv-grey (@acolors ansi-label))
                                 0.5)
                             "#222" "#eee")}

         :on-click (fn []
                     (reset! aselected ansi-label)
                     (when-let [picker @apicker]
                       (.setColor picker (@acolors @aselected) "RGB" 1 true)))}
   [:div {:class (str
                   "color"
                   (if (= ansi-label @aselected)
                     " color-selected"))}
    [:div {:class "color-index"} index]
    [:div {:class "color-label"} (no-ansi-color-labels index)]
    [:div {:class "color-value"}
     (str "#" (@acolors ansi-label))
     [:br]
     (lab-color (@acolors ansi-label))]]])

(defn colortable []
  (let [colors   (r/atom ansi-colors)
        selected (r/atom "ansi-black")
        picker   (r/atom nil)]
    (fn []
      [:div
       (into [:div]
             (map (fn [idx] [colorpicker colors (ansi-color-labels idx) idx selected picker])
                  [0 8 1 9 2 10 3 11 4 12 5 13 6 14 7 15]))
       [:div {:id  "colorpicker-target"
              ; TODO set color when selected changes
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
                                                       (update-ansi-colors @colors))})))))}]])))

(r/render [colortable]
          (.getElementById js/document "render-target1"))
