/* jshint node: true */
'use strict';

/**
 *  This file contains the variables used in other gulp files
 *  which defines tasks.
 */
var moduleImporter = require('sass-module-importer');
var path = require('path');

exports.settings = {
	projectName: 'quotefall'
};

/**
 *  The main paths of your project handle these with care
 */
var paths = {
	src: 'src',
	dist: 'dist',
	public: 'public',
	e2e: 'e2e'
};

paths.app = path.join(paths.src, 'app');
paths.assets = {
	source: path.join(paths.src, 'assets'),
	dist: path.join(paths.dist, 'assets')
};

paths = Object.assign(paths, {
	clean: [
		paths.public
	],
	images: {
		source: [path.join(paths.assets.source, 'images/**/*')]
	},
	fonts: {
		source: path.join(paths.assets.source, 'fonts/**/*')
	},
	scripts: {
		source: {
			all: [
				path.join(paths.app, '**/*.js'),
				'!' + path.join(paths.app, 'index.js')
			],
			index: path.join(paths.app, 'index.module.js'),
			test: path.join(paths.app, '**/*.spec.js')
		},
		out: path.join(paths.app, 'index.js')
	},
	html: {
		index: path.join(paths.src, 'index.html'),
		source: path.join(paths.app, '**/*.html')
	},
	serve: {
		public: path.join(paths.public, 'serve')
	},
	styles: {
		inject: [],
		source: {
			all: [
				path.join(paths.app, '**/*.scss'),
				path.join('!', paths.app, 'config/*.scss')
			],
			index: path.join(paths.app, 'index.scss')
		}
	}
});

paths.fonts.serve = path.join(paths.serve.public, 'fonts');
paths.images.serve = path.join(paths.serve.public, 'images');
paths.scripts.source.inject = paths.scripts.source.all.concat(
	[
		'!' + path.join(paths.app, 'index*')
	]
);
paths.scripts.serve = path.join(paths.serve.public, 'scripts');
paths.styles.serve = path.join(paths.serve.public, 'styles');
paths.styles.source.noindex = paths.styles.source.all.concat(
	['!' + paths.styles.source.index]
);
paths.styles.source.inject = paths.styles.source.noindex.concat(
	['!' + paths.app + '/config/*']
);

exports.paths = paths;

exports.options = {
	autoprefixer: {
		browsers: ['last 2 versions', '> 1%', 'safari >= 8'],
		remove: false
	},
	babelify: {
		plugins: [[ 'angularjs-annotate', { explicitOnly: true } ]],
		// Use all of the ES2015 spec
		presets: ['env'],
		sourceMaps: true
	},
	browserify: {
		debug: true
	},
	browserSync: {
		ghostMode: false,
		logLevel: 'debug',
		logPrefix: 'BrowserSync squarrels',
		minify: false,
		online: true,
		open: false,
		port: 8181,
		reloadOnRestart: true,
		watchEvents: ['add', 'change', 'unlink'],
		// proxy: {
		// 	cookies: { stripDomain: false },
		// 	target: 'uschdancn2n6acs:3000'
		// 	ws: true
		// }
	},
	imagemin: {
		optimizationLevel: 3,
		progressive: true,
		interlaced: true,
		/* Don't remove IDs from SVGs, they are often used
		 as hooks for embedding and styling */
		svgoPlugins: [{ cleanupIDs: false }]
	},
	inject: {
		transform: function(filePath) {
			filePath = filePath.replace(paths.app + '/', '');

			return '@import "' + filePath + '";';
		},
		starttag: '// injector',
		endtag: '// endinjector',
		addRootSlash: false
	},
	htmlmin: {
		collapseBooleanAttributes: true,
		collapseWhitespace: true,
		removeEmptyAttributes: true,
		removeAttributeQuotes: true,
		useShortDoctype: true
	},
	sass: {
		errLogToConsole: true,
		includePaths: [],
		// importer: moduleImporter(),
		outputStyle: 'expanded',
		precision: 10
	},
	sasslint: {
		config: '/.sass-lint.yml'
	},
	/**
	 *  Wiredep is the lib which inject bower dependencies in your project
	 *  Mainly used to inject script tags in the index.html but also used
	 *  to inject css preprocessor deps and js files in karma
	 */
	wiredep: {
		exclude: [/\/bootstrap\.js$/, /\/bootstrap-sass\/.*\.js/, /\/bootstrap\.css/],
		directory: 'bower_components',
		overrides: {
			'jquery-ui': {
				main: ['themes/dark-hive/jquery-ui.css']
			}
		}
	}
};

/**
 *  Common implementation for an error handler of a Gulp plugin
 */
exports.errorHandler = function(title) {
	var gutil = require('gulp-util'),
		notify = require('gulp-notify');

	return function(err) {
		var errMsg = err.toString();

		notify(errMsg).write(errMsg);
		gutil.log(gutil.colors.red('[' + title + ']'), errMsg);
		this.emit('end');
	};
};
