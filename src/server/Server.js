/// <reference path="../../typings/tsd.d.ts"/>
var express = require('express');
var http = require('http');
var fs = require('fs');
var path = require('path');
var Service;
(function (Service) {
    /**
    * @classdesc Server service class
    */
    var Server = (function () {
        /**
        * @constructor
        */
        function Server(option) {
            this.option = {};
            if (option)
                this.option = option;
            this.server = express();
        }
        Server.prototype.init = function () {
            var port = this.option && this.option.port ? this.option.port : Server._DEFAULT_PORT;
            var apiDir = Server._API_DIR;
            /*
            set root handler
             */
            this.server.get('/', this.createHandlers((this.option && this.option.rootHandler) ? this.option.rootHandler : this.root, this.option));
            /*
            set static directories
             */
            if (this.option) {
                if (this.option.staticDirs) {
                    for (var i = 0; i < this.option.staticDirs.length; i++) {
                        console.log('Publish %s directory as %s', this.option.staticDirs[i].targetDir, this.option.staticDirs[i].path);
                        this.server.use(this.option.staticDirs[i].path, this.createHandlers(express.static(this.option.staticDirs[i].targetDir, this.option.staticDirs[i].options), this.option));
                    }
                }
            }
            /*
            set api
             */
            this.loadApi(Server._API_DIR, this.option);
            this.server.set(Server._PORT_LABEL, port);
        };
        /**
         * Set Restrict Handler
         * @param  {express.RequestHandler} handler restrict handler
         * @return {void}
         */
        Server.prototype.setRestrictHandler = function (handler) {
            this.option.restrictHandler = handler;
        };
        /**
         * start server
         * @return {void}
         */
        Server.prototype.start = function () {
            http.createServer(this.server).listen(this.server.get(Server._PORT_LABEL), function () {
                console.log('Server started.');
            });
            console.log('Server listen at port %d', this.server.get(Server._PORT_LABEL));
        };
        /**
         * [loadApi description]
         * @param  {string} targetDir - API modules directory path
         * @return {void}
         */
        Server.prototype.loadApi = function (targetDir, option) {
            var fileList = fs.readdirSync(targetDir);
            for (var i = 0; i < fileList.length; i++) {
                var targetPath = path.join(targetDir, fileList[i]);
                if (fs.statSync(targetPath).isDirectory()) {
                    this.loadApi(targetPath, option);
                }
                else {
                    if (targetPath.indexOf('.js', targetPath.length - '.js'.length) != -1) {
                        console.log('API module loading: %s', targetPath);
                        var handlers = this.createHandlers(require(targetPath).process, option);
                        this.server.all('/' + require(targetPath).apiName, handlers);
                        this.server.all('/' + require(targetPath).apiName + '/*', handlers);
                    }
                }
            }
        };
        /**
         * server root path handler
         * @param  {express.Request}  req request object
         * @param  {express.Response} res response object
         * @return {void}
         */
        Server.prototype.root = function (req, res) {
            res.send(Server._ROOT_MESSAGE);
        };
        Server.prototype.createHandlers = function (handler, option) {
            var handlers = [];
            if (option && option.restrictHandler) {
                handlers.push(option.restrictHandler);
            }
            handlers.push(handler);
            return handlers;
        };
        Server._PORT_LABEL = 'port';
        Server._DEFAULT_PORT = 3333;
        Server._API_DIR = path.join(__dirname, '/api');
        Server._ROOT_MESSAGE = '<h1>Express server started.</h1>';
        return Server;
    })();
    Service.Server = Server;
})(Service = exports.Service || (exports.Service = {}));
