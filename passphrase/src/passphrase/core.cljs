(ns passphrase.core
  (:require-macros [cljs.core.async.macros :refer [go]])
  (:require [cljs-http.client :as http]
            [reagent.core :as r]
            [cljs.core.async :refer [<!]]
            [clojure.string :as str]
            cljsjs.clipboard))


(enable-console-print!)

(println "This text is printed from src/passphrase/core.cljs. Go ahead and edit it and see reloading in action.")

;; define your app data so that it doesn't get over-written on reload

(defonce app-state (atom {:text "Hello world!"}))

(defn on-js-reload [])
;; optionally touch your app-state to force rerendering depending on
;; your application
;; (swap! app-state update-in [:__figwheel_counter] inc)


; increment dummy counter to force password regeneration
(defrecord passphrase-config [min-words min-size separators dummy-counter])
(def default-config (passphrase-config. 4 20 "." 0))

(defn gen-password
  [words {:keys [min-words min-size separators]}]
  (letfn [(word [] (str/capitalize (rand-nth words)))]
    (loop [current    (word)
           word-count 1]
      (if (or (<= (count current) min-size)
              (<= word-count min-words))
        (recur
          (str current (rand-nth separators) (word))
          (inc word-count))
        current))))



(defn clipboard-button [label target]
  (let [clipboard-atom (atom nil)]
    (r/create-class
      {:display-name "clipboard-button"
       :component-did-mount
                     #(let [clipboard (new js/Clipboard (r/dom-node %))]
                        (reset! clipboard-atom clipboard))
       :component-will-unmount
                     #(when-not (nil? @clipboard-atom)
                        (.destroy @clipboard-atom)
                        (reset! clipboard-atom nil))
       :reagent-render
                     (fn []
                       [:button.clipboard
                        {:data-clipboard-target target}
                        label])})))

(defn app [words]
  (let [state    (r/atom default-config)
        how-many (r/atom 5)
        gen-pass (fn [n]
                   [:div.password-display
                    [:span.password-copy
                     [clipboard-button "copy" (str "#password" n)]]
                    [:span.password
                     {:id (str "password" n)}
                     (gen-password words @state)]])]
    (fn []
      [:div.main
       [:div.setting
        [:span.setting-label "minimum words:"]
        [:input.setting-input
         {:type      :number
          :value     (:min-words @state)
          :on-change (fn [e]
                       (->> e
                            .-target
                            .-value
                            js/parseInt
                            (swap! state assoc :min-words)))}]]
       [:div.setting
        [:span.setting-label "minimum characters:"]
        [:input.setting-input
         {:type      :number
          :value     (:min-size @state)
          :on-change (fn [e]
                       (->> e
                            .-target
                            .-value
                            js/parseInt
                            (swap! state assoc :min-size)))}]]
       [:div.setting
        [:span.setting-label "separators:"]
        [:input.setting-input
         {:type      :text
          :value     (:separators @state)
          :on-change (fn [e]
                       (->> e
                            .-target
                            .-value
                            (swap! state assoc :separators)))}]]
       [:div.setting
        [:span.setting-label "generate how many:"]
        [:input.setting-input
         {:type      :number
          :value     @how-many
          :on-change (fn [e]
                       (->> e
                            .-target
                            .-value
                            js/parseInt
                            (reset! how-many)))}]]
       [:div#regenerate
        [:input#regenerate-btn
         {:type     :button
          :value    "generate"
          :on-click (fn []
                      (let [counter (:dummy-counter @state)]
                        (swap! state assoc :dummy-counter (inc counter))))}]]
       (into [:div.output]
             (map gen-pass (range @how-many)))])))




(def ^:const wordlist-url "google-10000-english-usa-no-swears.txt")
(go (let [response (<! (http/get wordlist-url
                                 {:with-credentials? false
                                  :query-params      {"since" 135}}))]
      (prn (:status response))
      (r/render [app (str/split-lines (:body response))]
                (.getElementById js/document "app"))
      (set! js/a response)))