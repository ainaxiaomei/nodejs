var http = require('http');

var express = require("express");

var app = express();

app.get("/service_discovery/register", function(req, res) {

    console.log("you request path is ", req.url);

    console.log("start registering");

    register(req.query.serviceName, req.query.servicePort,
        req.query.serviceIp, req.query.heathPath, req.query.consulIP);

    res.send("ok");

});

app.get("/service_discovery/address", (req, res) => {

    var serviceName = req.query.content;
    var cosnulIp = req.query.consulIP;
		var all = req.query.all;
    console.log(req.url);
    if (!serviceName || !cosnulIp) {
        res.send('请求参数有问题:' + req.url);
    } else {
        var result = getService(serviceName, cosnulIp, all,(result) => {
            res.send(result);
        });
    }

});

function getService(serviceName, consulIP, all,callBack) {
    var result = "";
		if(all){
			var url = "http://" + consulIP + ":8500/v1/health/service/" + serviceName;
		}else{
			var url = "http://" + consulIP + ":8500/v1/health/service/" + serviceName+"?passing";
		}

    console.log("send request to consul %s", url);
    http.get(url, (res) => {
        res.setEncoding('utf8');
        res.on('data', (chunk) => {
            result = result + chunk;

        }).on('end', () => {

            var json = JSON.parse(result);
						var list = new Array();
            for (var val of json) {
                var object = new Object();
                object.addr = val["Service"].Address;
                object.weight = 0;
                list.push(object);
            }
						console.log(JSON.stringify(list));
            callBack(JSON.stringify(list));
        });


    }).on('error', (e) => console.log(e));

}

function register(serviceName, servicePort, serviceIp, heathPath, consulIP) {

    var content = {

        "ID": serviceName + serviceIp,
        "Name": serviceName,
        "Tags": [
            "master",
            "v1"
        ],
        "Address": serviceIp,
        "Port": Number(servicePort),
        "EnableTagOverride": false,
        "Check": {
            "HTTP": "http://" + serviceIp + ":" + servicePort + heathPath,
            "Interval": "10s",
        }
    }

    if (!consulIP) {
        consulIP = '127.0.0.1';
    }
    var options = {
        hostname: consulIP,
        port: 8500,
        path: '/v1/agent/service/register',
        method: 'POST',
        headers: {
            ContentType: 'application/json'
        }

    }

    var req = http.request(options, (res) => {
        res.setEncoding('utf8')
        res.on('data', (chunk) => {
            console.log(chunk);
        });
    });

    req.write(JSON.stringify(content));

    req.end();
}

app.on('error', (e) => {
    console.log("error ! ${e}");
});

app.listen(3000, () => {
    console.log("Module Is Started !");
});
