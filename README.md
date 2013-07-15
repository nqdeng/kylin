麒麟
====

每次改了系统HOSTS绑定后浏览器刷到死都不生效有木有！觉得Flush-DNS之类插件不那么好用了有木有！您可以试试看麒麟代理，不代理飞机票，只代理HTTP(S)请求，HOSTS即改即生效！

安装
----

>	npm install kylin -g

使用
----

命令行终端下使用以下命令启动服务，使用默认的1080端口创建代理服务器。

>	kylin

或者使用以下命令指定代理服务器端口。

>	kylin -p 8080

或者使用以下命令查看完整帮助。

>	kylin -h

服务启动后，把浏览器的代理服务器设置为以下这种样子（以Firefox为例）。

	Configure Proxies to Access the Internet
	[ ] No proxy
	[ ] Auto-detect proxy settings for this network
	[ ] Use system proxy settings
	[*] Manual proxy configuration:
		HTTP Proxy: 127.0.0.1            Port: 1080
		SSL Proxy:  127.0.0.1            Port: 1080

之后浏览器再无DNS缓存的困扰，系统HOSTS文件即改即生效。

API
----

也可以使用以下命令把麒麟安装为本地模块。

>	npm install kylin

之后就可以用API的方式启动麒麟。

	var kylin = require('kylin');
	
	kylin({ port: 8080 });

原理
----

浏览器使用HTTP(S)代理访问页面时，浏览器自身并不解析域名，因此只要代理服务器没有DNS缓存，系统HOSTS就可以即改即生效。

一些技巧
--------

### 如何快速切换浏览器代理设置

Firefox可尝试[Proxy Selector](https://addons.mozilla.org/zh-cn/firefox/addon/proxy-selector/)这个插件，Chrome可尝试[Proxy Switchy](https://chrome.google.com/webstore/detail/proxy-switchy/caehdcpeofiiigpdhbabniblemipncjj)或[TunnelSwitch](https://chrome.google.com/webstore/detail/tunnelswitch/nfpphleklkamlblagdkbkomjmaedanoh)这些插件。

### 如何以后台服务方式运行麒麟

Linux与OSX用户可以在命令行终端下通过以下命令以后台进程方式启动麒麟。

>	kylin &

天马用户可以在网站目录下将麒麟安装为本地模块后，按以下方式编辑天马配置文件，将天马和麒麟一起后台运行。

	var kylin = require('kylin'),
		tianma = require('tianma'),
		pipe = tianma.pipe;

	tianma
		.createHost({ port: 80, portssl: 443 })
		<以下代码省略..>

	kylin({ port: 1080 });