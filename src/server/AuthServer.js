/// <reference path="./Server.ts"/>
/// <reference path="../../typings/tsd.d.ts"/>
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var bodyParser = require('body-parser');
var session = require('express-session');
var service = require('./Server');
var pass = require('./util/Pass');
var Service;
(function (Service) {
    var AuthServer = (function (_super) {
        __extends(AuthServer, _super);
        function AuthServer(users, option) {
            _super.call(this, option);
            AuthServer.users = users;
            this.server.set('view engine', 'ejs');
            this.server.set('views', __dirname + '/views');
            _super.prototype.setRestrictHandler.call(this, this.restrict);
            this.server.use(bodyParser.urlencoded({ extended: false }));
            this.server.use(session({
                resave: false,
                saveUninitialized: false,
                secret: 'secret'
            }));
            this.server.use(function (req, res, next) {
                var session = req.session;
                var error = session.error;
                var message = session.success;
                delete session.error;
                delete session.success;
                res.locals.message = '';
                if (error)
                    res.locals.message = '<p class="msg error">' + error + '</p>';
                if (message)
                    res.locals.message = '<p class="msg success">' + message + '</p>';
                next();
            });
            this.server.post('/login', this.login);
            this.server.get('/login', function (req, res) {
                res.render('login');
            });
            this.server.get('/logout', function (req, res) {
                req.session.destroy(function () {
                    res.redirect('/login');
                });
            });
        }
        AuthServer.authenticate = function (name, password, func) {
            console.log('authenticating %s:%s', name, password);
            var user = AuthServer.users[name];
            if (!user)
                return func(new Error('cannot find user'));
            pass.Pass.hash(password, user.salt, function (err, hash) {
                if (err)
                    return func(err);
                if (hash == user.hash)
                    return func(null, user);
                func(new Error('Invalid Passowrd'));
            });
        };
        AuthServer.prototype.login = function (req, res) {
            AuthServer.authenticate(req.body.username, req.body.password, function (err, user) {
                if (user) {
                    req.session.regenerate(function () {
                        var session = req.session;
                        session.user = user;
                        session.success = 'Authenticated as ' + user.firstName
                            + ' click to <a href="/logout">logout</a>. '
                            + ' You may now access <a href="/static/">/static/</a>.';
                        res.redirect('back');
                    });
                }
                else {
                    var session = req.session;
                    session.error = 'Authentication failed, please check your '
                        + ' username and password.';
                    res.redirect('/login');
                }
            });
        };
        AuthServer.prototype.restrict = function (req, res, next) {
            var session = req.session;
            if (session.user) {
                next();
            }
            else {
                session.error = 'Access denied!';
                res.redirect('/login');
            }
        };
        AuthServer.users = {};
        return AuthServer;
    })(service.Service.Server);
    Service.AuthServer = AuthServer;
})(Service = exports.Service || (exports.Service = {}));
