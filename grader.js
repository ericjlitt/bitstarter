#!/usr/bin/env node
/*
Automatically grade files for the presence of specified HTML tags/attributes.
Uses commander.js and cheerio. Teaches command line application development
and basic DOM parsing.

References:

  + cheerio
  + commander.js
  + restler
  + JSON
*/
var fs = require('fs');
var program = require('commander');
var cheerio = require('cheerio');
var restler = require('restler');
//var HTMLFILE_DEFAULT = "index.html";
var CHECKSFILE_DEFAULT = "checks.json";
//var URL_DEFAULT = "http://shielded-reef-2988.herokuapp.com";

var assertFileExists = function(infile) {
    var instr = infile.toString();
    if(!fs.existsSync(instr)) {
	console.log("%s does not exist. Exiting.", instr);
	process.exit(1); // http://nodejs.org/api/process.html#process_process_exit_code
    }
    return instr;
};

var assertUrlExists = function(inurl) {
    var instr = inurl.toString();
    /*instr = "http://shielded-reef-2988.herokuapp.com";
    restler.get(instr).on('complete', function(result, response) {
	fs.writeFile(__dirname + '/downloadedsite.html', result, function(err) {
	console.log(instr);
	if (err) throw err;
	    console.log('It\'s saved!');
	});
    });*/
    return instr;
};

var cheerioHtmlFile = function(htmlfile) {
    return cheerio.load(fs.readFileSync(htmlfile));
};

var loadChecks = function(checksfile) {
    return JSON.parse(fs.readFileSync(checksfile));
};

var checkHtmlFile = function(htmlfile, checksfile) {
    $ = cheerioHtmlFile(htmlfile);
//    console.log($._root.children);
    var checks = loadChecks(checksfile).sort();
    var out = {};
    for(var ii in checks) {
	var present = $(checks[ii]).length > 0;
	out[checks[ii]] = present;
    }
    return out;
};

var clone = function(fn) {
    // Workaround for commander.js issue;
    // http://stackoverflow.com/a/6772648
    return fn.bind({});
};

if(require.main == module) {
    program
	.option('-c, --checks <check_file>', 'Path to checks.json', clone(assertFileExists), CHECKSFILE_DEFAULT)
	.option('-f, --file <html_file>', 'Path to index.html', clone(assertFileExists))
	.option('-u, --url <url_path>', 'Path to url', clone(assertUrlExists))
	.parse(process.argv);

    if(program.url){
	console.log("Downloading and parsing %s", program.url);
	var filename = "downloadedsite.html";
	restler.get(program.url).on('complete', function(result, response){
//	    console.log(program.url);
//	    console.log(response.rawEncoded + "\n\n\n");
	    fs.writeFile(filename, "hello");
	    fs.writeFile(filename, response.rawEncoded);
	});
    }
    else {
	console.log("Parsing %s", program.file);
	var filename = program.file;
    }
    fs.readFile(filename, "utf-8", function (err, data) {
	if (err) throw err;
//	console.log(data);
    });
    var checkJson = checkHtmlFile(filename, program.checks);
//    console.log(filename);
    var outJson = JSON.stringify(checkJson, null, 4);
    if(program.url){
	/*fs.unlink(filename, function (err) {
	    if (err) throw err;
	    console.log('successfully deleted %s', filename);
	});*/
    }
    console.log(outJson);
} else {
    exports.checkHtmlFile = checkHtmlFile;
}