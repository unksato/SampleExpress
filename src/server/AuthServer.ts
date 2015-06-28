/// <reference path="./Server.ts"/>
/// <reference path="../../typings/tsd.d.ts"/>

import express = require('express');
import bodyParser = require('body-parser');
var session = require('express-session');

import service = require('./Server');
import pass = require('./Pass');

export module Service {

  export interface IUser {
    firstName : string;
    lastName : string;
    salt? : string;
    hash? : string;
  }

  /**
   * @classdesc Server service with auth class
   */
  export class AuthServer extends service.Service.Server{

    private static users = {};

    /**
     * server constructor
     * @constructor
     * @param  {IUser}}                        users  user list
     * @param  {service.Service.IServerOption} option server option
     * @return {void}
     */
    constructor(users : {[name:string] : IUser} ,option?:service.Service.IServerOption){

      super(option);
      AuthServer.users = users;

      this.server.set('view engine', 'ejs');
      this.server.set('views',__dirname + '/views');

      super.setRestrictHandler(this.restrict);

      this.server.use(bodyParser.urlencoded({extended:false}));
      this.server.use(session({
        resave : false,
        saveUninitialized: false,
        secret: 'secret'
      }));

      this.server.use(function(req : express.Request, res : express.Response, next : Function){
        var session : any = req.session;

        var error = session.error;
        var message = session.success;

        delete session.error;
        delete session.success;
        res.locals.message = '';
        if (error) res.locals.message = '<p class="msg error">' + error + '</p>';
        if (message) res.locals.message = '<p class="msg success">' + message + '</p>';
        next();
      });

      this.server.post('/login',this.login);
      this.server.get('/login',function(req : express.Request, res : express.Response){
        res.render('login');
      });

      this.server.get('/logout',function(req : express.Request, res : express.Response){
          req.session.destroy(function(){
            res.redirect('/login');
          });
      });
    }

    /**
     * user authenticate
     * @param  {string}   name     username
     * @param  {string}   password password
     * @param  {Function} func     callback function
     * @return {void}
     */
    private static authenticate(name : string, password : string, func : Function){
      console.log('authenticating %s:%s',name,password);

      var user : IUser = AuthServer.users[name];
      if(!user) return func(new Error('cannot find user'));
      pass.Pass.hash(password, user.salt, function(err, hash){
        if(err) return func(err);
        if(hash == user.hash) return func(null, user);
        func(new Error('Invalid Passowrd'));
      });
    }

    /**
     * login handler
     * @param  {express.Request}  req request object
     * @param  {express.Response} res response object
     * @return {void}
     */
    private login(req : express.Request, res : express.Response){
      AuthServer.authenticate(req.body.username,req.body.password, function(err, user : IUser){
        if(user){
          req.session.regenerate(function(){
            var session : any = req.session;
            session.user = user;
            session.success = 'Authenticated as ' + user.firstName
              + ' click to <a href="/logout">logout</a>. '
              + ' You may now access <a href="/static/">/static/</a>.';
          res.redirect('back');
          })
        }else{
          var session : any = req.session;
          session.error = 'Authentication failed, please check your '
            + ' username and password.';
          res.redirect('/login');
        }
      })
    }


    /**
     * login check
     * @param  {express.Request}  req  request object
     * @param  {express.Response} res  response object
     * @param  {Function}         next next function
     * @return {void}
     */
      private restrict(req : express.Request, res : express.Response, next : Function){
        var session : any = req.session;
        if(session.user){
          next();
        }else{
          session.error = 'Access denied!';
          res.redirect('/login');
        }
      }
  }
}
