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
        vm.runInNewContext(fs.readFileSync('../fgo-vz/common/js/transData.js'), sandbox);
		var contents = fs.readFileSync(src_path);
		
		vm.runInNewContext(contents, sandbox);
        if (!fs.existsSync('raw')) {
            fs.mkdirSync('raw');
        }
		for (var k in sandbox.master) {
			fs.writeFileSync('raw/'+k+'.txt', JSON.stringify(sandbox.master[k], null, 2));
		}
        fs.writeFileSync('raw/tdDetail.txt', JSON.stringify(sandbox.tdDetail, null, 2));
		
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
		    traits = fs.readFileSync('translations/traits.json').toJSON(),
			skills = fs.readFileSync('translations/skills.json').toJSON(),
			np = fs.readFileSync('translations/np.json').toJSON(),
            npDesc = fs.readFileSync('translations/npDesc.json').toJSON();
			
		// Collating Servant Data
		var rawSvt = sandbox.master.mstSvt;
		var servants = {};
		function servantStats(uid) {
			var limits = sandbox.master.mstSvtLimit;
			for (var i = 0, l = limits.length; i < l; i++) {
				if (limits[i].svtId == uid) {
					return limits[i];
				}
			}
		}
		
		function servantUlts(uid) {
			var ultList = sandbox.master.mstSvtTreasureDevice,
				ults = [];
			for (var i = 0, l = ultList.length; i < l; i++) {
				if (ultList[i].svtId == uid) {
					var ultData = ultList[i], 
					  ult = {};
					
					
					ults.push(ult);
				}
			}
			return ults;
		}
        
        function servantUltDetail(ultid) {
            var data = sandbox.tdDetail;
            for (var i = 0, l = data.length; i < l; i++) {
                if (data[i][0] == ultid) {
                    var output = {
                        desc: data[i][1]
                    };
                    for (var j = 2; j < 6; j++) {
                        if (data[i][j] != "") {
                            var key = "effect"+((j-2).toString()),
                                frag = data[i][j].split("/");
                            if (frag.length == 1) {
                                output[key] = data[i][j];
                            }
                            else {
                                var vals = [];
                                for (var k = 0; k < frag.length; k++) {
                                    if (frag[k].endsWith('%')) {
                                        vals.push(frag[k].replace('%', '') / 100);
                                    }
                                    else {
                                        vals.push(frag[k]);
                                    }
                                }
                                output[key] = vals;
                            }
                        }
                    }
                    
                    return output;
                }
            }
        }
		
		function getUltData(ultId) {
			var ultList = sandbox.master.mstTreasureDevice;
			for (var i = 0, l = ultList.length; i < l; i++) {
				if (ultList[i].id == ultId) {
					
				}
			}
		}
		
		for (i = 0, l = rawSvt.length; i < l; i++) {
			if (rawSvt[i].type == 1) {
				var serv = rawSvt[i],
					servStats = servantStats(serv.id),
					data = {
						uid: serv.id,
						id: serv.collectionNo,
						name: serv.name,
						classId: serv.classId,
						gender: serv.gender,
						attribute: serv.attri,
						cost: serv.cost,
						starRate: serv.starrate,
						hpBase: servStats.hpBase,
						hpMax: servStats.hpMax,
						atkBase: servStats.atkBase,
						atkMax: servStats.atkMax,
						
					};
			}
		}
	});
}