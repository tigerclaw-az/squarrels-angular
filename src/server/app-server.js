var config = require('./config/config'),
	express = require('express'),
	bodyParser = require('body-parser'),
	cookieParser = require('cookie-parser'),
	sessionParser = require('express-session'),
	mongodbSession = require('connect-mongodb-session')(sessionParser),
	path = require('path'),
	favicon = require('serve-favicon'),
	logger = require('loggy'),
	players = require('./routes/players');

let app = express(),
	secret = '$eCuRiTy',
	sessionStore = new mongodbSession({
		uri: `mongodb://${config.server}/squarrels_sessions`,
		collection: 'sessions'
	});

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));
// app.use(cookieParser(secret));

//----------
// SESSION
//----------
app.use(sessionParser({
	secret,
	store: sessionStore,
	resave: false,
	saveUninitialized: true
}));

require('./config/mongoose');

app.use(favicon(path.join(__dirname, '../../public/serve', 'favicon.ico')));
app.use(express.static(path.join(__dirname, '../../public/serve')));
app.use(express.static(path.join(__dirname, '../app')));

app.use('/bower_components', express.static(path.join(__dirname, '../../bower_components')));

//----------
// ROUTING
//----------
app.use(function (req, res, next) {
	res.header('Access-Control-Allow-Credentials', true);
	res.header('Access-Control-Allow-Origin', '*');
	res.header('Access-Control-Allow-Headers', 'Cache-Control, Pragma, Origin, Authorization, Content-Type, X-Requested-With');
	res.header('Access-Control-Allow-Methods', 'GET, PUT, POST, DELETE');
	return next();
});
// app.use('/api/', routes);
app.use('/api/players', players);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
	var err = new Error('Not Found');
	err.status = 404;
	next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
	app.use(function(err, req, res, next) {
		logger.log('Server is listening on port ' + app.get('port'));

		res.status(err.status || 500);
		res.render('error', {
			message: err.message,
			error: err
		});
	});
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
	res.status(err.status || 500);
	res.render('error', {
		message: err.message,
		error: {}
	});
});

module.exports = {
	app,
	sessionParser,
	sessionStore
};
