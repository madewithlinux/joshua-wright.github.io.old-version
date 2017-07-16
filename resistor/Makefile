%: resources/public/%
	cp $< $@
css/%: resources/public/css/%
	mkdir -p css
	cp $< $@
js/compiled/%: resources/public/js/%
	mkdir -p js/compiled
	cp $< $@

resources/public/js/resistor-color-codes.js: src/resistor_color_codes/core.cljs
	mkdir -p resources/public/js
	lein cljsbuild once min

all: index.html js/compiled/resistor-color-codes.js css/style.css
clean:
	rm -rf $^
	rm -rf css/ js/
