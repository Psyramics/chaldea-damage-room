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
    fs.writeFileSync('raw/skDetail.txt', JSON.stringify(sandbox.skDetail, null, 2));
    
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
    var maps = {
      names: JSON.parse(fs.readFileSync('translations/names.json').toString()),
      traits: JSON.parse(fs.readFileSync('translations/traits.json').toString()),
      skills: JSON.parse(fs.readFileSync('translations/skills.json').toString()),
      np: JSON.parse(fs.readFileSync('translations/np.json').toString()),
      npDesc: JSON.parse(fs.readFileSync('translations/npDesc.json').toString())
    };

    var translationChanged = {
      names: false,
      traits: false,
      skills: false,
      np: false,
      npDesc: false
    };
    
    function getLocalName(type, orig) {
      var source;
      
      if (typeof maps[type] != "undefined") {
        source = maps[type];
      }
      
      if (typeof source[orig] == "undefined") {
        source[orig] = orig;
        translationChanged[type] = true;
      }
      
      return source[orig];
    }
      
    // Collating Servant Data
    var rawSvt = sandbox.master.mstSvt;
    var servants = {};
    var noblephantasms = {};
    var skills = {};
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
          if (ultData.treasureDeviceId == 100) {
            // this seems to be a placeholder np
            continue;
          }
          var detail = servantUltDetail(ultData.treasureDeviceId),
            data = servantUltData(ultData.treasureDeviceId);
          ult.name = data.name;
          ult.card = ultData.cardId;
          ult.hits = ultData.damage.length;
          for (var k in detail) {
            ult[k] = detail[k];
          }
          noblephantasms[ult.name] = ult;
          
          ults.push(ult.name);
        }
      }
      return ults;
    }
    
    function servantUltDetail(ultid) {
      var data = sandbox.tdDetail;
      for (var i = 0, l = data.length; i < l; i++) {
        if (data[i][0] == ultid) {
          var output = {
            desc: getLocalName("npDesc", data[i][1])
          };
          for (var j = 2; j < data[i].length; j++) {
            if (data[i][j] != "") {
              var key = "effect"+((j-1).toString()),
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
    
    function servantUltData(ultId) {
      var ultList = sandbox.master.mstTreasureDevice;
      for (var i = 0, l = ultList.length; i < l; i++) {
        if (ultList[i].id == ultId) {
          return {
            name: getLocalName('np', ultList[i].name)+' '+ultList[i].rank,
          };
        }
      }
    }
    
    function servantSkills(servId) {
      var svtSkills = sandbox.master.mstSvtSkill;
    }
    
    for (i = 0, l = rawSvt.length; i < l; i++) {
      if (rawSvt[i].type == 1) {
        var serv = rawSvt[i],
          servStats = servantStats(serv.id),
          data = {
            uid: serv.id,
            id: serv.collectionNo,
            name: getLocalName('names', serv.name),
            classId: serv.classId,
            gender: serv.gender,
            attribute: serv.attri,
            cost: serv.cost,
            starRate: serv.starrate,
            hpBase: servStats.hpBase,
            hpMax: servStats.hpMax,
            atkBase: servStats.atkBase,
            atkMax: servStats.atkMax,
            np: servantUlts(serv.id),
          },
          skills = servantSkills(serv.id);
      }
    }
    
    for (i in maps) {
      if (translationChanged[i]) {
        fs.writeFileSync('translations/'+i+'.json', JSON.stringify(maps[i], null, 2));
      }
    }
  });
}