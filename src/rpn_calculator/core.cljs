(ns rpn-calculator.core
  (:require [reagent.core :as r]
            [clojure.string :as str]))


(enable-console-print!)

(defn regex-modifiers
  "Returns the modifiers of a regex, concatenated as a string."
  [re]
  (str (if (.-multiline re) "m")
       (if (.-ignoreCase re) "i")))

(defn re-pos
  "Returns a vector of vectors, each subvector containing in order:
   the position of the match, the matched string, and any groups
   extracted from the match."
  [re s]
  (let [re (js/RegExp. (.-source re) (str "g" (regex-modifiers re)))]
    (loop [res []]
      (if-let [m (.exec re s)]
        (recur (conj res (vec (cons (.-index m) m))))
        res))))

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
(def ^:const op-colors {'+           "rgb(244, 67, 54)"
                        '-           "rgb(233, 30, 99)"
                        '*           "rgb(156, 39, 176)"
                        '/           "rgb(103, 58, 183)"
                        'sqrt        "rgb(63, 81, 181)"
                        (symbol "^") "rgb(33, 150, 243)"})
;"rgb(3, 169, 244)"
;"rgb(0, 188, 212)"
;"rgb(0, 150, 136)"
;"rgb(76, 175, 80)"
;"rgb(139, 195, 74)"
;"rgb(205, 220, 57)"
;"rgb(255, 235, 59)"
;"rgb(255, 193, 7)"
;"rgb(255, 152, 0)"
;"rgb(255, 87, 34)"
;"rgb(121, 85, 72)"
;"rgb(158, 158, 158)"
;"rgb(96, 125, 139)"})
(def ^:const op-funcs {'+           +
                       '-           -
                       '*           *
                       '/           /
                       'sqrt        Math/sqrt
                       (symbol "^") Math/pow})
(def ^:const op-arity {'+           2
                       '-           2
                       '*           2
                       '/           2
                       'sqrt        1
                       (symbol "^") 2})

(defrecord number-node [number offset length])
(defrecord op-node [op children offset length])
; multi-dispatch for tree fold
; (probably overkill)
(defprotocol tree-foldable
  (tree-fold [node num-fn op-fn]))
(extend-protocol tree-foldable
  number-node
  (tree-fold [node num-fn op-fn]
    (num-fn node))
  op-node
  (tree-fold [node num-fn op-fn]
    (let [child-vals (map #(tree-fold % num-fn op-fn) (:children node))]
      (apply op-fn [node child-vals]))))


(defn rpn-eval-node [node]
  (tree-fold node
             (fn [{:keys [number]}] number)
             (fn [{:keys [op]} child-values]
               (apply (op-funcs op)
                      child-values))))

(defn rpn-eval [nodes]
  (vec (map rpn-eval-node nodes)))

(defn rpn-fold [xs in]
  (let [[tok _] in]
    (if (number? tok)
      (conj xs (->number-node
                 (in 0)
                 ((in 1) 0)
                 (count ((in 1) 1))))
      (let [arity    (op-arity tok)
            children (subvec xs (- (count xs) arity))
            stack    (subvec xs 0 (- (count xs) arity))]
        (conj
          stack
          (->op-node
            (in 0)
            children
            ((in 1) 0)
            (count ((in 1) 1))))))))


(defn read-token [tok]
  (let [num (js/parseFloat tok)]
    (if-not (js/isNaN num)
      num
      (symbol tok))))

(defn parse-rpn [expr-str]
  (let [raw-tokens (re-pos #"[^\s]+" expr-str)]
    (reduce rpn-fold [] (map (fn [tok] [(read-token (tok 1))
                                        tok])
                             raw-tokens))))


(def ^:const leaf-height
  "height of text" 60)
(def ^:const op-border-height
  "total border height (top+bottom)" 20)
(def ^:const main-input-id "main-input-id")
(defn on-click-set-selection [offset length]
  (fn [e] (let [input (.getElementById js/document main-input-id)]
            (.focus input)
            (.setSelectionRange
              input offset (+ offset length)))))
(defn render-node
  "renders a single node to reagent vector. Returns [node height-in-px]"
  [node]
  (tree-fold
    node
    (fn [{:keys [number offset length]}]
      [[:div {:class    'number-container
              :style    {:height (str leaf-height "px")}
              :on-click (on-click-set-selection offset length)}
        number]
       leaf-height])
    (fn [{:keys [op children offset length]} child-node-results]
      (let [full-height (apply + (map #(% 1) child-node-results))]
        [[:div {:class 'tree-internal-node}
          (into [:div {:class 'tree-left-container1
                       :style {:height (str full-height "px")}}]
                (map (fn [[node height]]
                       [:div {:class 'tree-left-container2
                              :style {:height (str height "px")}}
                        node])
                     child-node-results))
          [:div {:style {:background-color (op-colors op)
                         :height           (str (- full-height op-border-height) "px")}
                 :class 'tree-operator}
           [:div {:class    'operator-container
                  :on-click (on-click-set-selection offset length)}
            op]]]
         full-height]))))


(defn render-tree-node [node]
  (let [[rendered height] (render-node node)
        height (str height "px")]
    [:div {:class 'tree-head
           :style {:height height}}
     rendered]))

(defn rpn []
  (let
    [expr (r/atom "21 43 / 12 999 + 0.0003 - + 4 65 * sqrt /")]
    (fn []
      (let [tree (parse-rpn @expr)]
        [:div {:class 'container}
         [:input {:type      :text
                  :value     @expr
                  :id        main-input-id
                  :on-change (fn [e]
                               (->> e
                                    .-target
                                    .-value
                                    (reset! expr)))}]
         (into [:div] (map render-tree-node tree))
         (into [:div {:class 'result-container}]
               (map #(vector :div
                             {:class 'result}
                             %)
                    (rpn-eval tree)))]))))

(r/render [rpn]
          (.getElementById js/document "render-target2"))
