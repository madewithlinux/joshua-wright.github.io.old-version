(ns resistor-color-codes.core
  (:require [reagent.core :as r]
            [reagent.cookies :as cookies]))


(enable-console-print!)
(defn on-js-reload [])
;; optionally touch your app-state to force rerendering depending on
;; your application
;; (swap! app-state update-in [:__figwheel_counter] inc)


(def ^:const colors ["black"
                     "brown"
                     "red"
                     "orange"
                     "yellow"
                     "green"
                     "blue"
                     "violet"
                     "gray"
                     "white"])
(def ^:const cookie-key "resistor-values")

(defn color-idx-to-value [i1 i2 i3]
  (* (+ i2 (* 10 i1))
     (Math/pow 10 i3)))

(defn resistor-colors [value]
  ; TODO doesn't work for value<10
  (let [vstr (str (.toFixed value))
        a    (js/parseInt (nth vstr 0))
        b    (js/parseInt (nth vstr 1))
        c    (dec (Math/floor (Math/log10 value)))]
    (map #(nth colors %) [a b c])))

(defn resistor-row [value]
  (into [:tr [:td (.toLocaleString value)]]
        (vec (map
               (fn [c] (vector :td {:class (str "color-label " "color-" c)} c))
               (resistor-colors value)))))

(defn remove-btn [values val]
  [:td {:class "remove-btn"}
   [:strong [:a {:href     "#"
                 :on-click (fn [] (swap! values disj val)
                             (println @values))}
             "X"]]])

(defn add-resistor [values value]
  (if (and (>= value 10) (<= value 1e11))
    (do
      (swap! values conj value)
      (cookies/set! cookie-key @values))))

(defn color-selector [at]
  (into [:select
         {
          :on-change (fn [e]
                       (let [color     (-> e .-target .-value)
                             color-idx (.indexOf colors color)]
                         (set! (-> e .-target .-classList)
                               (str "color-" color))
                         (reset! at color-idx)))
          :class     (str "color-" (nth colors @at))}]
        (map (fn [x] [:option x])
             colors)))

(def c1 (r/atom 0))
(def c2 (r/atom 0))
(def c3 (r/atom 0))

(defn resistor-table []
  (let [value  (r/atom "")
        values (r/atom (apply sorted-set
                              (cookies/get
                                cookie-key
                                [100 200 2200 56e3])))]
    (fn []
      [:div
       [:input {:type      :number
                :name      "input"
                :on-key-up (fn [e]
                             (reset! value
                                     (-> e
                                         .-target
                                         .-value
                                         js/parseFloat))
                             (if (= 13 (.-which e))
                               (add-resistor values @value)))}]
       [:input {:type     :button
                :value    "add"
                :on-click (fn [e] (add-resistor values @value))}]
       [:div
        (color-selector c1)
        (color-selector c2)
        (color-selector c3)
        [:input {:type     :button
                 :value    "add"
                 :on-click (fn [e]
                             (let [val (color-idx-to-value @c1 @c2 @c3)]
                               (add-resistor values val)))}]]
       [:table (into [:tbody] (map (fn [x] (conj (resistor-row x) (remove-btn values x)))
                                   @values))]])))

(r/render
  [resistor-table]
  (.getElementById js/document "render-target"))

