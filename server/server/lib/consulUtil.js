var http = require('http');
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
                object.weight = 10;
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
            "HTTP": heathPath,
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
exports.getService=getService;
exports.register=register;
