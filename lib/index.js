var http = require('http'),
	net = require('net'),
	url = require('url');

/**
 * Create a HTTP proxy.
 * @param config {Object}
 */
module.exports = function (config) {
	config = config || {};

	var server = http.createServer(function (request, response) {
			var meta = url.parse(request.url);

			var opts = {
					hostname: meta.hostname,
					port: meta.port || 80,
					path: meta.path,
					method: request.method,
					headers: request.headers
				};

			var req = http.request(opts, function (res) {
					response.writeHead(res.statusCode, res.headers);
					res.pipe(response);
				});

			req.on('error', function (err) {
				response.writeHead(500, { 'content-type': 'text/plain' });
				response.end(err.message);
			});

			request.pipe(req);
		});

	server.on('connect', function (request, socket) {
		var parts = request.url.split(':');

		var opts = {
				port: parts[1] || 443,
				host: parts[0]
			};

		var client = net.connect(opts, function () {
				socket.pipe(client);

				client.pipe(socket);

				socket.write('HTTP/'
					+ request.httpVersion
					+ ' 200 Connection established\r\n\r\n', 'utf8');
			});

		client.on('error', function (err) {
			socket.write('HTTP/'
				+ request.httpVersion
				+ ' 500 Internal Server Error\r\n\r\n', 'utf8');

			socket.end();
		});
	});

	server.listen(config.port || 1080);
};