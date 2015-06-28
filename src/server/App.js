/// <reference path="./AuthServer.ts"/>
/// <reference path="../../typings/tsd.d.ts"/>
var auth = require('./AuthServer');
var pass = require('./util/Pass');
var options = {
    port: +process.argv[2],
    staticDirs: [{
            path: '/static/*',
            targetDir: __dirname + '/static',
            option: {
                index: 'index.html',
                hidden: false
            }
        }]
};
var users = {
    'satoshi': { firstName: 'satoshi', lastName: 'watanabe', salt: 'salt' },
};
pass.Pass.hash('password', users['satoshi'].salt, function (err, hash) {
    if (err) {
        console.log('user password hash create error.');
    }
    else {
        users['satoshi'].hash = hash;
        var server = new auth.Service.AuthServer(users, options);
        server.init();
        server.start();
    }
});
