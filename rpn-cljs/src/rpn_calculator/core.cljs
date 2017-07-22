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

;"rgb(255, 87, 34)"
;"rgb(121, 85, 72)"
;"rgb(158, 158, 158)"
;"rgb(96, 125, 139)"})
(defrecord op-record [display token function arity color])
(def ops
  (map
    #(apply ->op-record %)
    [["+" "+" + 2 "rgb(244,  67,  54)"]
     ["−" "-" - 2 "rgb(233,  30,  99)"]
     ["×" "*" * 2 "rgb(156,  39, 176)"]
     ["÷" "/" / 2 "rgb(103,  58, 183)"]
     ["\\" "\\" (fn [a b] (/ b a)) 2 "rgb(255, 152, 0)"]
     ["^" "^" Math/pow 2 "rgb( 63,  81, 181)"]
     ["\u221A" "sqrt" Math/sqrt 1 "rgb(33, 150, 243)"]
     ["sin" "sin" Math/sin 1 "rgb(3, 169, 244)"]
     ["cos" "cos" Math/cos 1 "rgb(0, 188, 212)"]
     ["tan" "tan" Math/tan 1 "rgb(0, 150, 136)"]
     ["sin\u207b\u00b9" "asin" Math/asin 1 "rgb(76, 175, 80)"]
     ["cos\u207b\u00b9" "acos" Math/acos 1 "rgb(139, 195, 74)"]
     ["tan\u207b\u00b9" "atan" Math/atan 1 "rgb(205, 220, 57)"]
     ["atan2" "atan2" Math/atan2 2 "rgb(255, 235, 59)"]
     ["ln" "ln" Math/log 1 "rgb(255, 193, 7)"]
     ["log" "log" Math/log10 1 "rgb(255, 152, 0)"]
     ["lg" "lg" Math/log2 1 "rgb(255, 87, 34)"]
     ["%" "%" mod 2 "rgb(3, 169, 244)"]
     ["\u212f^" "exp" Math/exp 1 "rgb(0, 188, 212)"]
     ["10^" "10^" #(Math/pow 10 %) 1 "rgb(0, 150, 136)"]
     ["2^" "2^" #(Math/pow 2 %) 1 "rgb(76, 175, 80)"]
     ["abs" "abs" Math/abs 1 "rgb(139, 195, 74)"]
     ["!" "!" js/math.factorial 1 "rgb(205, 220, 57)"]
     ["C" "C" js/math.combinations 2 "rgb(255, 235, 59)"]
     ["P" "P" js/math.permutations 2 "rgb(255, 193, 7)"]]))
(def get-op
  ; allow retrieving operators by symbol or label
  (merge
    (zipmap (map :token ops) ops)
    (zipmap (map :display ops) ops)))


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
               ;(println op)
               ;(println (:function op))
               (apply (:function op)
                      child-values))))

(defn rpn-eval [nodes]
  (vec (map rpn-eval-node nodes)))

(defn rpn-fold [xs in]
  (let [[tok _] in]
    (if (number? tok)
      (conj xs (number-node.
                 (in 0)
                 ((in 1) 0)
                 (count ((in 1) 1))))
      (let [arity    (:arity tok)
            children (subvec xs (- (count xs) arity))
            stack    (subvec xs 0 (- (count xs) arity))]
        (conj
          stack
          (op-node.
            (in 0)
            children
            ((in 1) 0)
            (count ((in 1) 1))))))))


(defn read-token [tok]
  (if-let [op (get-op tok)]
    op
    (js/parseFloat tok)))

(defn parse-rpn [expr-str]
  (let [raw-tokens (re-pos #"[^\s]+" expr-str)]
    (reduce rpn-fold [] (map (fn [tok] [(read-token (tok 1))
                                        tok])
                             raw-tokens))))


(def ^:const leaf-height
  "height of text" 60)
(def ^:const op-border-height
  "total border height (top+bottom)" 20)
(defn on-click-set-selection [rinput offset length]
  (fn [e] (when-let [input @rinput]
            (.focus input)
            (.setSelectionRange
              input offset (+ offset length)))))
(defn render-node
  "renders a single node to reagent vector. Returns [node height-in-px]"
  [node input-atom]
  (tree-fold
    node
    (fn [{:keys [number offset length]}]
      [[:div {:class    'number-container
              :style    {:height (str leaf-height "px")}
              :on-click (on-click-set-selection input-atom offset length)}
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
          [:div {:style {:background-color (:color op)
                         :height           (str (- full-height op-border-height) "px")}
                 :class 'tree-operator}
           [:div {:class    'operator-container
                  :on-click (on-click-set-selection input-atom offset length)}
            (:display op)]]]
         full-height]))))


(defn render-tree-node [node input-atom]
  (let [[rendered height] (render-node node input-atom)
        height (str height "px")]
    [:div {:class 'tree-head
           :style {:height height}}
     rendered]))

(defn rpn []
  (let
    [expr  (r/atom "300 lg 200 log 500 ln + * 2 3 ^ sin acos / 1 3 sqrt atan2 2^ 10^ \\")
     input (r/atom nil)]
    (fn []
      (let [tree (parse-rpn @expr)]
        [:div {:class 'container}
         [:input {:type      :text
                  :value     @expr
                  :ref       (fn [x]
                               (reset! input x)
                               ; focus input when it is created
                               (if x (.focus x)))
                  :on-change (fn [e]
                               (->> e
                                    .-target
                                    .-value
                                    (reset! expr)))}]
         (into [:div] (map #(render-tree-node % input) tree))
         (into [:div {:class 'result-container}]
               (map #(vector :div
                             {:class 'result}
                             %)
                    (rpn-eval tree)))]))))

(r/render [rpn]
          (.getElementById js/document "render-target2"))
