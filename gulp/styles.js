/* jshint node: true */
'use strict';

// jscs:disable requireMultipleVarDecl
var $ = require('gulp-load-plugins')({
		pattern: ['gulp-*', 'autoprefixer']
	}),
	gulp = require('gulp');

var browserSync = require('browser-sync'),
	wiredep = require('wiredep').stream;

var conf = require('./config'),
	options = conf.options,
	paths = conf.paths;

gulp.task('styles:lint', function() {
	return gulp.src(paths.styles.source.all)
		.pipe($.plumber())
		.pipe($.sassLint(options.sasslint))
		.pipe($.sassLint.format())
		.pipe($.sassLint.failOnError());
});

gulp.task('styles', ['styles:lint'], function() {
	var injectFiles = gulp.src(paths.styles.source.inject, { read: false }),
		postcssPlugins = [
			$.autoprefixer(options.autoprefixer)
		];

	return gulp.src(paths.styles.source.index)
		.pipe($.plumber(options.errorHandler))
		.pipe($.inject(injectFiles, options.inject)).on('error', conf.errorHandler('inject'))
		.pipe(wiredep(options.wiredep))
		.pipe($.sourcemaps.init())
		.pipe($.sass(options.sass)).on('error', conf.errorHandler('sass'))
		.pipe($.postcss(postcssPlugins)).on('error', conf.errorHandler('postcss'))
		.pipe($.sourcemaps.write())
		.pipe($.rename('main.css'))
		.pipe(gulp.dest(paths.styles.serve))
		.pipe(browserSync.reload({ stream: true }))
		.pipe($.size());
});
