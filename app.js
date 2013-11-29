
/**
 * Module dependencies.
 */

var express = require('express');
var routes = require('./routes');

var http = require('http');
var path = require('path');

var mongoskin = require('mongoskin');
var dbUrl = process.env.MONGOHQ_URL || 'mongodb://@localhost:27017/blog';
var db = mongoskin.db(dbUrl, {safe: true});
var collections = {
  articles: db.collection('articles'),
  users: db.collection('users')
};


var app = express();
app.locals.appTitle = "blog-express";

app.use(function(req, res, next) {
  if (!collections.articles || ! collections.users) return next(new Error("No collections."))
  req.collections = collections;
  return next();
});



// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.json());
app.use(express.cookieParser('3CCC4ACD-6ED1-4844-9217-82131BDCB239'));
app.use(express.cookieSession({secret: '2C44774A-D649-4D44-9535-46E296EF984F'}))
app.use(express.urlencoded());
app.use(express.methodOverride());
app.use(require('stylus').middleware(__dirname + '/public'));
app.use(express.static(path.join(__dirname, 'public')));

app.use(function(req, res, next) {
  if (req.session && req.session.admin)
    res.locals.admin = true;
  next();
})

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}


app.use(app.router);
//PAGES&ROUTES
app.get('/', routes.index);
app.get('/login', routes.user.login);
app.post('/login', routes.user.authenticate);
app.get('/logout', routes.user.logout);
app.get('/admin', routes.user.admin);
app.get('/articles/:slug', routes.article.show);

//REST API ROUTES
app.get('/articles', routes.article.list)
app.post('/articles', routes.article.add);
app.put('/articles/:id', routes.article.edit);
app.del('/articles/:id', routes.article.del);



app.all('*',function(req, res) {
  res.send(404);
})

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
