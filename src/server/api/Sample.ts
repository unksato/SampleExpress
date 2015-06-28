/// <reference path="../../../typings/tsd.d.ts"/>
import express = require('express');

module.exports.apiName = 'sample';

module.exports.process = function(req : express.Request, res : express.Response){
    res.send('<h1>Hello Sample API!</h1>');
}
