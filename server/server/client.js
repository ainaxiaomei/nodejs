var http = require("http");

http.get("http://127.0.0.1:3000/register?serviceName=sunqi2&servicePort=80&serviceIp=127.0.0.1&heathPath=/&consulIP=127.0.0.1", (res) => {
	res.setEncoding('utf8');
	res.on('data', (chuck) => {
		console.log(chuck);
	});
});