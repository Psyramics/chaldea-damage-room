/**
 Discoveries:
 stat = statBase + ((statMax - statBase) * curves[level] / 1000)
 mstSvtCard contains hit counts
**/

module.exports = function (grunt) {
	grunt.initConfig({
		"package": "package.json",
	});
	
	grunt.registerTask("default", ["cdr-parse"]);
	
	grunt.registerTask("cdr-parse", function () {
		const vm = require('vm'),
		    fs = require('fs'),
			readline = require('readline'),
			src_path = '../fgo-vz/common/js/master.js';
		
		// Parse the raw data into something readable
		var sandbox = {
			master: {}
		}
		// these are necessary functions for the data file to load
		vm.runInNewContext(fs.readFileSync('../fgo-vz/common/js/lz-string.min.js'), sandbox);
		vm.runInNewContext(fs.readFileSync('../fgo-vz/common/js/sidebar.js'), sandbox);
		var contents = fs.readFileSync(src_path);
		
		vm.runInNewContext(contents, sandbox);
		for (var k in sandbox.master) {
			fs.writeFileSync('raw/'+k+'.txt', JSON.stringify(sandbox.master[k]));
		}
		
		var extras = fs.readFileSync('../fgo-vz/common/js/svtData.js');
		sandbox.sortByElmentNo = function () {
			
		}
		vm.runInNewContext(extras, sandbox);
		
		// Collating Stat Curves
		var rawExp = sandbox.master.mstSvtExp;
		var compExp = {};
		for (var i = 0, l = rawExp.length; i < l; i++) {
			var row = rawExp[i];
			var type = compExp[row.type];
			if (type == undefined) {
				type = compExp[row.type] = [];
			}
			type[row.lv] = row.curve;
		}
		
		fs.writeFileSync('data/curves.json', JSON.stringify(compExp), function (){});

		// These are maps of Japanese to English
		var names = fs.readFileSync('translations/names.json').toJSON(),
		    traits = fs.readFileSync('translations/traits.json').toJSON();
			
		// Collating Servant Data
		var rawSvt = sandbox.master.mstSvt;
		var servants = {};
		for (i = 0, l = rawSvt.length; i < l; i++) {
			var serv = rawSvt[i];
		}
	});
}