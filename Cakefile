fs = require 'fs'
exec = (command, callback) ->
	console.log 'Excecuting \'' + command + '\''
	require('child_process').exec command, callback

option '-f', '--file [FILE]', 'Use file in task'

task 'delintAll', 'Runs jshint on all js code', (options) ->

	paths = 'lib test'
	if options.file
		paths = options.file

	exec 'jshint ' + paths + ' --config support/jshint-config.json', execOutput

task 'delint', 'Runs all modified or added files through jshint', (options) ->
	exec 'jshint `git status --porcelain | sed -e "s/^...//g"` --config support/jshint-config.json', execOutput

task 'test', 'Runs all unit tests', (options) ->
	exec 'find test -name "*.test.js"', (error, stout, stderr) ->
		stout.trim().split('\n').map (value) ->
			exec 'expresso ' + value, execOutput

execOutput = (error, stout, sterr) ->
	if sterr
		console.warn sterr
	if stout
		console.log stout

log = console.log
