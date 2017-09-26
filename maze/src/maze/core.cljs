(ns maze.core
  (:require [monet.canvas :as canvas]
            [clojure.string :as str]
            [loom.graph :as graph]))

(enable-console-print!)

(println "This text is printed from src/maze/core.cljs. Go ahead and edit it and see reloading in action.")

;; define your app data so that it doesn't get over-written on reload

(defonce app-state (atom {:text "Hello world!"}))


(defn on-js-reload [])
;; optionally touch your app-state to force rerendering depending on
;; your application
;; (swap! app-state update-in [:__figwheel_counter] inc)

(def config
  {:grid-x        20
   :grid-y        20
   :canvas-width  400
   :canvas-height 400})

(def ^:const canvas-dom (.getElementById js/document "maze"))
(set! (.-width canvas-dom) (:canvas-width config))
(set! (.-height canvas-dom) (:canvas-height config))
(def context (canvas/get-context canvas-dom "2d"))


(defn render-squares [{:keys [grid-x grid-y] :as cfg}
                      ctx points]
  (letfn [(render-square [[x y color]]
            (let [pix-x (* x grid-x)
                  pix-y (* y grid-y)]
              (-> ctx
                  (canvas/fill-style color)
                  (canvas/fill-rect {:x pix-x :y pix-y :w grid-x :h grid-y}))))]
    (doseq [sq points]
      (render-square sq))))


(def c [0 1 2 3 4 5 6 7 8 9 \A \B \C \D \E \F])
(defn rand-color []
  (str "#" (str/join (repeatedly 6 #(rand-nth c)))))


; a grid of random colors
(render-squares
  config
  context
  (for [x (range (/ (:canvas-width config) (:grid-x config)))
        y (range (/ (:canvas-height config) (:grid-x config)))
        :let [color (str "#" (str/join (repeatedly 6 #(rand-nth c))))]]
    (do
      ;(println x y)
      [x y color])))

(let [g (graph/weighted-graph 1 2 3 4 {1 {2 0.5}} [3 2 0.21])]
  (println g)
  (println (graph/add-edges g [1 2 0.9]))
  (println (graph/weight g 1 2)))

(defrecord pair [x y color])
(println (map? (pair. 1 1 "")))

(let [g (graph/weighted-graph
          ; must specify as adjacency list
          {(pair. 1 1 (rand-color))
           {(pair. 0 0 (rand-color)) 1
            (pair. 0 1 (rand-color)) 1
            (pair. 1 0 (rand-color)) 1}})]
  (println g))

(println
  (let [x 0
        y 0
        p (pair. x y (rand-color))]
    (for [x2 (range (/ (:canvas-width config) (:grid-x config)))
          y2 (range (/ (:canvas-height config) (:grid-x config)))
          :when (or (not= x x2) (not= y y2))
          :let [p2 (pair. x2 y2 (rand-color))]]
      {p2 1})))
