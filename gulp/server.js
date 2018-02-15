/* jshint node: true */
'use strict';

var $ = require('gulp-load-plugins')(),
	path = require('path'),
	gulp = require('gulp'),
	conf = require('./config'),
	paths = conf.paths;

var browserSync = require('browser-sync'),
	browserSyncSpa = require('browser-sync-spa'),
	util = require('util');

var isOnlyChange = function(event) {
	return event.type === 'changed';
};

function browserSyncInit(baseDir, browser) {
	var options = conf.options.browserSync,
		routes = null,
		server;

	browser = browser === undefined ? 'default' : browser;

	if (baseDir === paths.src || (util.isArray(baseDir) && baseDir.indexOf(paths.src) !== -1)) {
		routes = {
			'/bower_components': 'bower_components'
		};
	}

	server = {
		baseDir: baseDir,
		routes: routes
	};

	options = Object.assign(options, {
		startPath: '/',
		// server: server,
		browser: browser
	});

	/*
	* You can add a proxy to your backend by uncommenting the line below.
	* You just have to configure a context which will we redirected and the target url.
	* Example: $http.get('/users') requests will be automatically proxified.
	*
	* For more details and option, https://github.com/chimurai/http-proxy-middleware/blob/v0.9.0/README.md
	*/
	// server.middleware = proxyMiddleware('/users', {target: 'http://jsonplaceholder.typicode.com', changeOrigin: true});

	browserSync.instance = browserSync.init(options);
}

gulp.task('watch', ['build'], function() {
	// Watch for changes
	gulp.watch([
		path.join(paths.serve.public, '*.html'),
		paths.fonts.source,
		paths.images.source.join(','),
		path.join(paths.scripts.serve, '**/*.js')
	], { cwd: './' }).on('change', function() {
		browserSync.reload();
	}).on('error', conf.errorHandler);

	gulp.watch(paths.scripts.source.all, ['scripts']);

	gulp.watch(paths.styles.source.all, { cwd: './' }, ['styles'], function() {
		browserSync.reload({ stream: true });
	});

	gulp.watch(path.join(paths.html.source), { cwd: './' }, function(event) {
		browserSync.reload(event.path);
	});

	return true;
});

gulp.task('nodemon', function(cb) {
	var started = false;

	return $.nodemon({
		script: 'bin/www',
		ext: 'js jade',
		ignore: ['gulp/*.js', 'src/app/*', 'public/serve/*']
	}).on('start', function() {
		// to avoid nodemon being started multiple times
		// thanks @matthisk
		if (!started) {
			cb();
			started = true;
		}
	}).on('restarted', function() {
		$.util.log('Server Restarted');
		browserSync.reload();
	}).on('crash', function() {
		$.util.log($.util.colors.red('Application crashed!'));
	});
});

/** SERVE **/

browserSync.use(browserSyncSpa({
	selector: '[ng-app]'// Only needed for angular apps
}));

gulp.task('serve', ['nodemon', 'watch'], function() {
	browserSyncInit([conf.paths.serve.public, conf.paths.src]);
});
