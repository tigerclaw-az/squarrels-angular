/* jshint node: true */
'use strict';

// jscs:disable requireMultipleVarDecl
var $ = require('gulp-load-plugins')({
		pattern: ['gulp-*', 'autoprefixer', 'main-bower-files', 'uglify-save-license', 'del']
	}),
	gulp = require('gulp');

var path = require('path');

var conf = require('./config'),
	options = conf.options,
	paths = conf.paths;

gulp.task('partials', function() {
	var files = [
			path.join(paths.app, '/**/*.html'),
			path.join(paths.public, '/**/*.html')
		],
		tplOptions = {
			module: conf.settings.projectName,
			root: 'app'
		};

	return gulp.src(files)
		.pipe($.htmlmin(conf.options.htmlmin))
		.pipe($.angularTemplatecache('templateCacheHtml.js', tplOptions))
		.pipe(gulp.dest(path.join(paths.serve.public, '/partials/')));
});

gulp.task('html', ['wiredep', 'partials', 'scripts', 'styles'], function() {
	return gulp.src([path.join(paths.public, '/*.html')])
		.pipe($.useref({ searchPath: [paths.public] }))
		// .pipe($.if('*.js', $.uglify()))
		.pipe($.replace('../../bower_components/bootstrap-sass/assets/fonts/bootstrap/', '../fonts/'))
		.pipe($.if('*.css', $.csso()))
		.pipe($.if('*.html', $.htmlmin(options.htmlmin)))
		.pipe($.size());
});

gulp.task('fonts', function() {
	return gulp.src(paths.fonts.source)
		.pipe($.filter('**/*.{eot,otf,svg,ttf,woff,woff2}'))
		.pipe($.if('*.{eot,svg,ttf,woff}', $.flatten()))
		.pipe(gulp.dest(paths.fonts.serve));
});

gulp.task('extras', function() {
	var fileFilter = $.filter(function(file) {
			return file.stat.isFile();
		}),
		files = [
			path.join(conf.paths.src, '/**/*'),
			path.join('!' + conf.paths.src, '/**/*.{html,css,js,scss}')
		];

	return gulp.src(files)
		.pipe(fileFilter)
		.pipe($.if('*.{png,jpg,gif}', $.cache($.imagemin(options.imagemin))))
		.pipe(gulp.dest(paths.serve.public));
});

gulp.task('clean', function() {
	return $.del.sync(paths.clean, { force: true });
});

// Inject bower components
gulp.task('wiredep', function() {
	return gulp.src([path.join(paths.src, '/*.html')])
		// .pipe(wiredep(options.wiredep))
		.pipe(gulp.dest(paths.serve.public));
});

gulp.task('preflight', ['scripts:lint']);

gulp.task('produce', ['preflight', 'wiredep', 'scripts', 'styles', 'fonts']);

gulp.task('package', ['produce', 'html', 'extras']);

gulp.task('build', ['clean', 'package'], function() {
	// return gulp.src([path.join(paths.dist, '/**/*')])
	// 	.pipe($.plumber())
	// 	.pipe($.size({ title: 'build', gzip: true }));
	return true;
});
