/// <reference path="../../typings/tsd.d.ts"/>

import express = require('express');
import http = require('http');
import fs = require('fs');
import path = require('path');

export module Service {
  export interface IServerStaticOption{
      path : string;
      targetDir : string;
      options? : any;
  }

  export interface IServerOption{
      staticDirs? : IServerStaticOption[];
      port? : number;
      apiDir? : string;
      rootHandler? : express.RequestHandler;
      restrictHandler? : express.RequestHandler;
  }

  /**
  * @classdesc Server service class
  */
  export class Server {
    protected server : express.Express;

    private option : IServerOption = {};

    private static _PORT_LABEL : string = 'port';

    private static _DEFAULT_PORT : number = 3333;

    private static _API_DIR : string = path.join(__dirname , '/api');

    private static _ROOT_MESSAGE : string = '<h1>Express server started.</h1>';

    /**
    * @constructor
    */
    constructor(option? : IServerOption){
      if(option)
        this.option = option;
      this.server = express();
    }

    public init(){
      var port = this.option && this.option.port ? this.option.port : Server._DEFAULT_PORT;
      var apiDir = Server._API_DIR;

      /*
      set root handler
       */
      this.server.get('/',<any>this.createHandlers((this.option && this.option.rootHandler) ? this.option.rootHandler : this.root, this.option));

      /*
      set static directories
       */
      if(this.option){
        if(this.option.staticDirs){
          for(var i = 0; i < this.option.staticDirs.length;i++){
              console.log('Publish %s directory as %s',this.option.staticDirs[i].targetDir,this.option.staticDirs[i].path);

              this.server.use(this.option.staticDirs[i].path,<any>this.createHandlers(express.static(this.option.staticDirs[i].targetDir,this.option.staticDirs[i].options),this.option));
          }
        }
      }

      /*
      set api
       */
      this.loadApi(Server._API_DIR,this.option);

      this.server.set(Server._PORT_LABEL,port);
    }

    /**
     * Set Restrict Handler
     * @param  {express.RequestHandler} handler restrict handler
     * @return {void}
     */
    public setRestrictHandler(handler : express.RequestHandler){
      this.option.restrictHandler = handler;
    }

    /**
     * start server
     * @return {void}
     */
    public start(){
      http.createServer(this.server).listen(this.server.get(Server._PORT_LABEL),function(){
        console.log('Server started.');
      });

      console.log('Server listen at port %d', this.server.get(Server._PORT_LABEL));
    }

    /**
     * [loadApi description]
     * @param  {string} targetDir - API modules directory path
     * @return {void}
     */
    private loadApi(targetDir : string, option?:IServerOption){
      var fileList : string[] = fs.readdirSync(targetDir);
      for(var i = 0; i < fileList.length;i++){
        var targetPath = path.join(targetDir,fileList[i]);
        if(fs.statSync(targetPath).isDirectory()){
          this.loadApi(targetPath,option);
        }else{
          if(targetPath.indexOf('.js',targetPath.length - '.js'.length) != -1){
            console.log('API module loading: %s',targetPath);

            var handlers : express.RequestHandler[] = this.createHandlers(require(targetPath).process,option);

            this.server.all('/' + require(targetPath).apiName , <any>handlers);
            this.server.all('/' + require(targetPath).apiName + '/*', <any>handlers);
          }
        }
      }
    }

  /**
   * server root path handler
   * @param  {express.Request}  req request object
   * @param  {express.Response} res response object
   * @return {void}
   */
    private root(req : express.Request, res : express.Response){
      res.send(Server._ROOT_MESSAGE);
    }

    private createHandlers(handler : express.RequestHandler, option? : IServerOption) : express.RequestHandler[] {
      var handlers : express.RequestHandler[] = [];
      if(option && option.restrictHandler){
        handlers.push(option.restrictHandler);
      }
      handlers.push(handler);

      return handlers;
    }
  }
}
