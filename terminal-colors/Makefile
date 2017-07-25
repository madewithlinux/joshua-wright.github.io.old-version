all:
	mkdir -p css/ js/compiled/
	cp -t css/ resources/public/css/*
	cp -t ./ resources/public/index.html
	cp -t js/ resources/public/js/*.js
	lein cljsbuild once min
	cp resources/public/js/compiled/terminal_colors.min.js js/compiled/terminal_colors.js
	git add index.html css/* js/*