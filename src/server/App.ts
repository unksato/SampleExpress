/// <reference path="./AuthServer.ts"/>
/// <reference path="../../typings/tsd.d.ts"/>

import auth = require('./AuthServer');
import service = require('./Server');
import pass = require('./util/Pass');

/**
 * Server options
 * @type {IServerOption}
 */

var options : service.Service.IServerOption = {
  port : +process.argv[2],
  staticDirs : [{
    path: '/static/*',
    targetDir: __dirname + '/static',
    option:{
      index : 'index.html',
      hidden: false
    }
  }]
};

var users : { [name : string] : auth.Service.IUser} = {
  'satoshi' : { firstName : 'satoshi',lastName : 'watanabe', salt : 'salt'},
}

pass.Pass.hash('password',users['satoshi'].salt,function(err,hash){
    if(err){
      console.log('user password hash create error.');
    }else{
      users['satoshi'].hash = hash;

      var server: auth.Service.AuthServer = new auth.Service.AuthServer(users,options);
      server.init();
      server.start();
    }
});
