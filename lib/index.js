var fs = require('fs'),
	http = require('http'),
	net = require('net'),
	url = require('url');

	// 127.0.0.1:8080	www.example.com
var PATTERN_HOST = /^([\w\.]+)(?:\:(\d+))?\s+([\w\.]+)$/,

	/**
	 * Parse hosts file.
	 * @param hosts {string}
	 * @param callback {Function}
	 */
	parse = function (hosts, callback) {
		fs.readFile(hosts, 'utf-8', function (err, data) {
			if (err) {
				callback(err);
			} else {
				hosts = {};

				data.split('\n').forEach(function (line) {
					if (line = line.trim().match(PATTERN_HOST)) { // Assign.
						hosts[line[3]] = {
							hostname: line[1],
							port: line[2]
						};
					}
				});

				callback(null, hosts);
			}
		});
	},

	/**
	 * Create a HTTP proxy.
	 * @param config {Object}
	 */
	createProxy = function (config) {
		config = config || {};
		config = {
			hosts: config.hosts || 'hosts',
			port: config.port || 1080
		};

		var hosts = {},

			updateHosts = function (callback) {
				parse(config.hosts, function (err, data) {
					if (!err) {
						hosts = data;
					}
					callback && callback(err);
				});
			},

			server = http.createServer(function (request, response) {
				var meta = url.parse(request.url),

					host = hosts[meta.hostname] || {},

					opts = {
						hostname: host.hostname || meta.hostname,
						port: host.port || meta.port || 80,
						path: meta.path,
						method: request.method,
						headers: request.headers
					};

				if (opts.headers['proxy-connection']) {
					if (!opts.headers['connection']) {
						opts.headers['connection'] = opts.headers['proxy-connection'];
					}
					delete opts.headers['proxy-connection'];
				}

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
			var parts = request.url.split(':'),

				host = hosts[parts[0]] || {},

				opts = {
					host: host.hostname || parts[0],
					port: host.port || parts[1] || 443
				},

				client = net.connect(opts, function () {
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

		updateHosts(function (err) {
			if (!err) {
				fs.watch(config.hosts, function (e) {
					updateHosts();
				});
			}

			server.listen(config.port);
		});
	};

module.exports = createProxy;
