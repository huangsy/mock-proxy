#!/usr/bin/env node
var http = require('http');
var zlib = require('zlib');
var httpProxy = require('http-proxy');
var fs = require('fs');
var path = require('path');

var proxy = httpProxy.createProxyServer({});

var cachePath = path.resolve(__dirname, '.proxy-cache');

var server = http.createServer(function(req, res) {
	if (!fs.existsSync(cachePath)) {
		fs.mkdirSync(cachePath);
	}
	var filePath = path.resolve(cachePath, req.url.split('/').pop());
	fs.readFile(filePath, 'utf8', function(err, data) {
		if (err) {
			proxy.web(req, res, { target: 'http://mei.youzan.com' });
			return;
		}
		res.end(data);
	});
});

proxy.on('proxyRes', function(proxyRes, req, res) {
	var filePath = path.resolve(cachePath, req.url.split('/').pop());
  	proxyRes.on('data', function(chunk) {
  		if (proxyRes.headers['content-encoding'] === 'gzip') {
  			zlib.unzip(chunk, { finishFlush: zlib.Z_SYNC_FLUSH }, function(err, buffer) {
			  	if (!err) {
			    	fs.writeFile(filePath, buffer, 'utf8', function() {});
			  	}
			});
  		} else {
  			fs.writeFile(filePath, chunk, 'utf8', function() {});
  		}
  	});
});

server.listen(3002);
