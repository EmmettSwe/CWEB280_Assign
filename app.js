var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const session = require('express-session');
const SQLiteStore = require('better-sqlite3-session-store')(session);
const Sqlite = require('better-sqlite3');
const passport = require('passport');

const SearchRouter = require('./routes/Search')
const BookshelfRouter = require('./routes/Bookshelf')
const AboutRouter = require('./routes/About')
const IndexRouter = require('./routes/index')
const AuthRouter = require('./routes/auth')

require('dotenv').config();

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, '/public')));

const sessOptions = {
  secret: "test_secret",
  name: 'session-id',
  resave: false,
  saveUninitialized: false,
  cookie: {httpOnly: false, maxAge: 1000*60*60},
  unset: 'destroy',
  store: new SQLiteStore({ // a location to store session besides the memory
    client: new Sqlite('sessions.db', {verbose: console.log}),
    expired: {clear: true, intervalMs: 1000*60*15},
  }),
};

app.use(session(sessOptions));

app.use(passport.initialize());
app.use(passport.session());

app.use('/', SearchRouter);
app.use('/', AuthRouter);
app.use('/Search', SearchRouter)
app.use('/Bookshelf', BookshelfRouter)
app.use('/About', AboutRouter)


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
