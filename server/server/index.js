var http = require('http');

var express = require("express");

var consulUtil =  require("./lib/consulUtil.js");

var app = express();

app.get("/service_discovery/register", function(req, res) {

    console.log("you request path is ", req.url);

    console.log("start registering");

    consulUtil.register(req.query.serviceName, req.query.servicePort,
        req.query.serviceIp, req.query.heathPath, req.query.consulIP);

    res.send("ok");

});

app.get("/service_discovery/address", (req, res) => {

    var serviceName = req.query.content;
    var cosnulIp = req.query.consulIP;
		var all = req.query.all;
    console.log(req.url);
    if (!serviceName) {
        res.send('请求参数有问题:' + req.url);
    } else {
        var result = consulUtil.getService(serviceName, cosnulIp, all,(result) => {
            res.send(result);
        });
    }

});

app.on('error', (e) => {
    console.log("error ! ${e}");
});

app.listen(3000, () => {
    console.log("Module Is Started !");
});
