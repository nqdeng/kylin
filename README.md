麒麟
====

改了系统HOSTS文件后浏览器刷到死都不生效有木有！觉得Flush-DNS之类插件不那么好用了有木有！手持设备无法修改系统DNS访问不了开发环境有木有！您可以试试看麒麟代理，不代理飞机票，只代理HTTP(S)，HOSTS即改即生效！

安装
----

>	npm install kylin -g

使用
----

命令行终端下使用以下命令启动代理服务器，默认使用`1080`端口和当前目录下的`hosts`文件。

>	kylin

或者使用以下命令指定hosts文件路径。

>	kylin /home/admin/hosts

或者使用以下命令指定代理服务器端口。

>	kylin -p 8080

或者使用以下命令查看完整帮助。

>	kylin -h

### DNS解析

麒麟在解析请求域名的DNS时，如果当前目录下存在`hosts`文件，或者指定了`hosts`文件，则优先使用`hosts`文件中的DNS绑定。


	+--------+   example.com   +-------+   127.0.0.1:8080   +--------+
	| client | <-------------> | kylin | <----------------> | server |
	+--------+                 +-------+                    +--------+
	                              | ^
	                  example.com | | 127.0.0.1:8080
	                              v |
	                          +---------+
	                          | ./hosts |
	                          +---------+
	                              | ^
	                              v |
	                          +---------+
	                          | system  |
	                          |     DNS |
	                          +---------+

麒麟的`hosts`文件的写法与系统HOSTS文件类似，但功能略强大：

	# 允许指定源服务的端口。
	127.0.0.1:8080		foo.example.com

	# 允许使用域名（由系统DNS来解析）来指定源服务器。
	test.com			bar.example.com

	# 以上功能也可以同时使用。
	test.com:8080		baz.example.com

另外，麒麟的`hosts`文件被修改后，**不需要重启**代理服务器也能立即生效。

应用场景
--------

以下介绍一些或是典型的，或是神奇的应用场景。以Firefox为例，所有场景下都需要把浏览器的代理服务器设置为以下这种样子。

	Configure Proxies to Access the Internet
	[ ] No proxy
	[ ] Auto-detect proxy settings for this network
	[ ] Use system proxy settings
	[*] Manual proxy configuration:
		HTTP Proxy: 127.0.0.1            Port: 1080
		SSL Proxy:  127.0.0.1            Port: 1080

### 标准代理服务器

如果你有一台可以翻*的服务器，并且希望造福人类时，无需任何配置，简单地把麒麟跑起来，然后把服务器的IP和端口告诉小伙伴们，完了。

### 干掉浏览器DNS缓存

如果你需要在开发阶段频繁地修改DNS绑定，但又饱受浏览器DNS缓存的折磨，就可以把麒麟跑起来，然后把浏览器的代理服务器配置为`127.0.0.1:1080`，之后困扰不再，HOSTS文件即改即生效。

>	原理： 浏览器使用HTTP(S)代理访问页面时，浏览器自身并不解析域名，因此只要代理服务器没有DNS缓存，HOSTS文件就可以即改即生效。

### 干掉非标准端口

如果开发环境的页面跑在非标准端口（比如8080）上，而你又希望使用不带端口的域名来访问页面时，就可以在麒麟的`hosts`文件中指定源服务器的端口。

### 手持设备页面调试

如果你需要在手持设备上使用线上域名调试开发环境的页面，但又苦于不好修改DNS绑定，就可以把麒麟跑起来，然后使用相应的IP和端口配置手持设备的代理服务器，之后困扰不再，代理服务器的HOSTS文件即改，手持设备的浏览器上即生效。

API
----

也可以使用以下命令把麒麟安装为本地模块。

>	npm install kylin

之后就可以用API的方式启动麒麟。

	var kylin = require('kylin');
	
	kylin({
		hosts: './my-hosts'
		port: 8080
	});

一些技巧
--------

### 如何快速切换浏览器代理设置

Firefox可尝试[Proxy Selector](https://addons.mozilla.org/zh-cn/firefox/addon/proxy-selector/)这个插件，Chrome可尝试[Proxy Switchy](https://chrome.google.com/webstore/detail/proxy-switchy/caehdcpeofiiigpdhbabniblemipncjj)或[TunnelSwitch](https://chrome.google.com/webstore/detail/tunnelswitch/nfpphleklkamlblagdkbkomjmaedanoh)这些插件。

### 如何以后台服务方式运行麒麟

Linux与OSX用户可以在命令行终端下通过以下命令以后台进程方式启动麒麟。

>	kylin &

[天马](http://nqdeng.github.io/tianma)用户可以在网站目录下将麒麟安装为本地模块后，按以下方式编辑天马配置文件，将天马和麒麟一起后台运行。

	var kylin = require('kylin'),
		tianma = require('tianma'),
		pipe = tianma.pipe;

	tianma
		.createHost({ port: 80, portssl: 443 })
		<以下代码省略..>

	kylin();