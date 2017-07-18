(ns rpn-calculator.core
  (:require [reagent.core :as r]
            [clojure.string :as str]))


(enable-console-print!)

(println "This text is printed from src/rpn-calculator/core.cljs. Go ahead and edit it and see reloading in action.")

;; define your app data so that it doesn't get over-written on reload

(defonce app-state (atom {:text "Hello world!"}))

(defn on-js-reload [])
;; optionally touch your app-state to force rerendering depending on
;; your application
;; (swap! app-state update-in [:__figwheel_counter] inc)

(def ^:const colors
  ["rgb(244, 67, 54)"
   "rgb(233, 30, 99)"
   "rgb(156, 39, 176)"
   "rgb(103, 58, 183)"
   "rgb(63, 81, 181)"
   "rgb(33, 150, 243)"
   "rgb(3, 169, 244)"
   "rgb(0, 188, 212)"
   "rgb(0, 150, 136)"
   "rgb(76, 175, 80)"
   "rgb(139, 195, 74)"
   "rgb(205, 220, 57)"
   "rgb(255, 235, 59)"
   "rgb(255, 193, 7)"
   "rgb(255, 152, 0)"
   "rgb(255, 87, 34)"
   "rgb(121, 85, 72)"
   "rgb(158, 158, 158)"
   "rgb(96, 125, 139)"])
(def ^:const op-colors {'+ "rgb(244, 67, 54)"
                        '- "rgb(233, 30, 99)"
                        '* "rgb(156, 39, 176)"
                        '/ "rgb(103, 58, 183)"})
(def ^:const op-funcs {'+ +
                       '- -
                       '* *
                       '/ /
                       'sqrt Math/sqrt})
(def ^:const op-arity {'+ 2
                       '- 2
                       '* 2
                       '/ 2
                       'sqrt 1})

(defn rpn-eval-node [node]
  (if (number? node)
    node
    (let [[op & children] node]
      (apply (op-funcs op)
             (map rpn-eval-node children)))))

(defn rpn-eval [nodes]
  (vec (map rpn-eval-node nodes)))

(defn rpn-fold [xs x]
  (if (number? x)
    (conj xs x)
    (let [arity (op-arity x)
          args (subvec xs (- (count xs) arity))
          stack (subvec xs 0 (- (count xs) arity))]
      (conj
        stack
        (into [x] args)))))

(defn read-token [tok]
  (let [num (js/parseFloat tok)]
    (if-not (js/isNaN num)
      num
      (symbol tok))))

(defn parse-rpn [expr-str]
  (reduce rpn-fold [] (map read-token (str/split expr-str " "))))


(defn num-leaves [node]
  (cond
    (vector? node) (apply + (map num-leaves (rest node)))
    true 1))

(def ^:const leaf-height
  "height of text" 60)
(def ^:const op-border-height
  "total border height (top+bottom)" 20)
(defn render-node
  "renders a single node to reagent vector. Returns [node height-in-px]"
  [node]
  (cond
    (vector? node) (let [[head right left] node
                         [r-node r-height] (render-node right)
                         [l-node l-height] (render-node left)
                         full-height (+ r-height l-height)]
                     [[:div {:class 'tree-internal-node}
                       [:div {:class 'tree-left-container1
                              :style {:height (str full-height "px")}}
                        [:div {:class 'tree-left-container2
                               :style {:height (str r-height "px")}}
                         r-node]
                        [:div {:class 'tree-left-container2
                               :style {:height (str l-height "px")}}
                         l-node]]
                       [:div {:style {:background-color (op-colors head)
                                      :height           (str (- full-height op-border-height) "px")}
                              :class 'tree-operator}
                        [:div {:class 'operator-container}
                         head]]]
                      full-height])
    (number? node) [[:div {:class 'number-container
                           :style {:height (str leaf-height "px")}}
                     node]
                    leaf-height]))

(defn render-tree-node [node]
  (let [[rendered height] (render-node node)
        height (str height "px")]
    [:div {:class 'tree-head
           :style {:height height}}
     rendered]))


(defn render-tree [nodes]
  (into [:div] (map render-tree-node nodes)))

(defn rpn []
  (let
    [expr (r/atom "1 4 / sqrt 1 2 + 3 + + 4 5 * /")]
    (fn []
      (let [tree (parse-rpn @expr)]
        [:div
         {:class 'container}
         [:input {:type      :text
                  :value     @expr
                  :on-change (fn [e]
                               (->> e
                                    .-target
                                    .-value
                                    (reset! expr)))}]
         [render-tree tree]
         (into [:div {:class 'result-container}]
               (map #(vector :div
                             {:class 'result}
                             %)
                    (rpn-eval tree)))]))))


(r/render [rpn]
          (.getElementById js/document "render-target2"))
