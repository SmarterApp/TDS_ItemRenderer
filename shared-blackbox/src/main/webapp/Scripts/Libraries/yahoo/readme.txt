This repo contains trimmed down versions of yui2 (https://github.com/yui/yui2) and builder (https://github.com/yui/builder) for TDS. 
It might also contain fixes for more modern browsers and devices.

Here is how you build:

1) Install ANT 1.7 or above, and add ant to your path  (http://ant.apache.org/bindownload.cgi)
2) At the command line, cd to the source directory of the component you wish to build, and execute "ant all" to build
3) The built files will be updated in yahoo\yui2\build folder

Here is example:
- cd yahoo\yui2\src\autocomplete
- ant all
	