(ns terminal-colors.core
  (:require [reagent.core :as r]
            [clojure.string :as str]
            [terminal-colors.htop :refer [htop more-prompt]]))

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

(def prompt
  (apply
    str
    (map
      char
      [0x1b 0x5b 0x31 0x3b 0x33 0x32 0x3b 0x34 0x38 0x3b 0x35 0x3b
       0x32 0x33 0x37 0x6d 0x30 0x32 0x3a 0x32 0x30 0x50 0x4d 0x1b
       0x5b 0x33 0x34 0x6d 0x6a 0x30 0x73 0x68 0x1b 0x5b 0x33 0x33
       0x6d 0x40 0x1b 0x5b 0x33 0x34 0x6d 0x6a 0x30 0x73 0x68 0x2d
       0x64 0x65 0x73 0x6b 0x74 0x6f 0x70 0x1b 0x5b 0x33 0x35 0x6d
       0x7e 0x1b 0x5b 0x30 0x3b 0x33 0x39 0x3b 0x34 0x39 0x6d 0x0a
       0x0a])))

(def ansi-up (new js/AnsiUp))
(set! ansi-up.use_classes true)
(update-ansi-colors ansi-colors)

(set! (.-innerHTML (.getElementById js/document "terminal-display"))
      ;(.ansi_to_html ansi-up prompt)
      ;(.ansi_to_html ansi-up htop)
      ;(.ansi_to_html ansi-up more-prompt)
      (str
        "<pre>"
        (str/replace
          (.ansi_to_html ansi-up more-prompt)
          ;(.ansi_to_html ansi-up htop)
          "\n" "<br>")
        "</pre>"))
      ;(str/replace (.ansi_to_html ansi-up htop) "\n" "<br>"))
      ;(.ansi_to_html ansi-up "\n\n\033[1;33;40m 33;40  \033[1;33;41m 33;41  \033[1;33;42m 33;42  \033[1;33;43m 33;43  \033[1;33;44m 33;44  \033[1;33;45m 33;45  \033[1;33;46m 33;46  \033[1m\033[0\n\n\033[1;33;42m >> Tests OK\n\n"))



(defn colorpicker [acolors ansi-label index aselected apicker]
  [:div {:class    "color-container"
         :style    {:background-color (str "#" (@acolors ansi-label))}
         :on-click (fn []
                     (reset! aselected ansi-label)
                     (when-let [picker @apicker]
                       (println picker (@acolors @aselected) "RGB" 1 true)
                       (.setColor picker (@acolors @aselected) "RGB" 1 true)))}
   [:div {:class (str
                   "color"
                   (if (= ansi-label @aselected)
                     " color-selected"))}
    [:div {:class "color-index"} index]
    [:div {:class "color-label"} (no-ansi-color-labels index)]
    [:div {:class "color-value"} (str "#" (@acolors ansi-label))]]])


(defn colortable []
  (let [colors   (r/atom ansi-colors)
        selected (r/atom "ansi-black")
        picker   (r/atom nil)]
    (fn []
      ;(when-let [picker @picker]
      ;  (println picker (@colors @selected) "RGB" 1 true)
      ;  (.setColor picker (@colors @selected) "RGB" 1 true))
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
                                                     ;(new js/ColorPicker.Colors {"color" (@colors @selected)})
                                                     "renderCallback"
                                                     (fn [a]
                                                       (swap! colors assoc @selected (.-HEX a))
                                                       (update-ansi-colors @colors))})))
                       ;(.setColor @picker (@colors @selected))
                       (set! js/a @picker)))}]])))

(r/render [colortable]
          (.getElementById js/document "render-target1"))
