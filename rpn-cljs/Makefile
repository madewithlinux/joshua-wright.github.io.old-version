%: resources/public/%
	cp $< $@
css/%: resources/public/css/%
	mkdir -p css
	cp $< $@
js/compiled/%.js: resources/public/js/compiled/%.min.js
	mkdir -p js/compiled
	cp $< $@

resources/public/js/compiled/rpn_calculator.min.js: src/rpn_calculator/core.cljs
	mkdir -p resources/public/js
	lein cljsbuild once min

all: index.html js/compiled/rpn_calculator.js css/style.css
clean:
	rm -rf css/ js/
