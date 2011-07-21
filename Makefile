TESTS = $(shell find test/*.test.js)

test:
	@NODE_ENV=test expresso \
		-I lib \
		$(TESTFLAGS) \
		$(TESTS)

test-cov:
	@TESTFLAGS=--cov $(MAKE) test

npm-publish:
	@git tag $(VERSION)
	@git push --tags
	@npm publish

jshint:
	@jshint lib
	@jshint test
	@jshint *.js

.PHONY: test test-cov npm-publish jshint
