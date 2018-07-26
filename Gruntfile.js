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

    // parse trait list
    var traits = {};
    for (i = 0, l = sandbox.individualityList.length; i < l; i++) {
      var t = sandbox.individualityList[i];
      traits[t[0]] = t[1];
    }

    // These are maps of Japanese to English
    var maps = {
      names: JSON.parse(fs.readFileSync('translations/names.json').toString()),
      traits: JSON.parse(fs.readFileSync('translations/traits.json').toString()),
      skills: JSON.parse(fs.readFileSync('translations/skills.json').toString()),
      skillDetails: JSON.parse(fs.readFileSync('translations/skillDetails.json').toString()),
      np: JSON.parse(fs.readFileSync('translations/np.json').toString()),
      npDesc: JSON.parse(fs.readFileSync('translations/npDesc.json').toString())
    };

    var translationChanged = {
      names: false,
      traits: false,
      skills: false,
      skillDetails: false,
      np: false,
      npDesc: false
    };
    
    function getLocalName(type, orig) {
      var source;
      
      if (typeof maps[type] != "undefined") {
        source = maps[type];
      }
      else {
        source = maps[type] = {};
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
    
    // store npGains here cause they're a pain in the ass to get later
    var npGains = {};
    function servantUlts(uid) {
      var ultList = sandbox.master.mstSvtTreasureDevice,
          tdlvl = sandbox.master.mstTreasureDeviceLv,
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

          // npGains for servants are stored by treasure device for some reason???
          if (npGains[uid] == undefined) {
            for (var x = 0, y = tdlvl.length; x < y; x++) {
              if (tdlvl[x].treaureDeviceId == ultData.treasureDeviceId) {
                npGains[uid] = {
                  atkGain: tdlvl[x].tdPoint,
                  defGain: tdlvl[x].tdPointDef
                }
                break;
              }
            }
          }
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
              var key = "mag"+((j-1).toString()),
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
      var svtSkills = sandbox.master.mstSvtSkill,
          skillNames = sandbox.master.mstSkill;
      var servSkills = {
        "1": [],
        "2": [],
        "3": []
      };
      for (var i = 0, l = svtSkills.length; i < l; i++) {
        if (svtSkills[i].svtId == servId) {
          var skill = {},
              name = skillNames.find(function (el) {
                return svtSkills[i].skillId == el.id;
              }),
              skDeets = sandbox.skDetail.find(function (el) {
                return el[0] == svtSkills[i].skillId;
              });
            
          skill.name = getLocalName("skills", name.name);
          skill.icon = name.icon;
          
          skill.details = getLocalName("skillDetails", skDeets[1]);
          for (var j = 2, l2 = skDeets.length; j < l2; j++) {
            var key = "mag"+((j-1).toString()),
                frag = skDeets[j].split("/");
                
            if (frag.length == 1) {
              skill[key] = skDeets[j];
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
              skill[key] = vals;
            }
          }

          servSkills[svtSkills[i].num].push(skill.name);
          skills[skill.name] = skill;
        }
      }
      
      return servSkills;
    }
    
    var cardMap = [
      "empty",
      "Arts",
      "Buster",
      "Quick",
      "Extra"
    ];
    for (i = 0, l = rawSvt.length; i < l; i++) {
      if (rawSvt[i].type == 1) {
        var serv = rawSvt[i],
          servStats = servantStats(serv.id),
          data = {
            uid: serv.id,
            id: serv.collectionNo,
            name: getLocalName('names', serv.name),
            classId: serv.classId,
            gender: getLocalName('traits', sandbox.genderTypeList[serv.genderType]),
            attribute: getLocalName('traits', sandbox.attriList[serv.attri]),
            personality: getLocalName('traits', sandbox.personalityList[servStats.personality]),
            policy: getLocalName('traits', sandbox.policyList[servStats.policy]),
            cost: serv.cost,
            starRate: serv.starrate,
            hpBase: servStats.hpBase,
            hpMax: servStats.hpMax,
            atkBase: servStats.atkBase,
            atkMax: servStats.atkMax,
            np: servantUlts(serv.id),
            traits: [],
            hits: {
              "Arts": 0,
              "Buster": 0,
              "Quick": 0,
              "Extra": 0
            },
            deck: [
            ],
            passives: [],
            npGainAtk: npGains[serv.id].atkGain / 10000,
            npGainDef: npGains[serv.id].defGain / 10000
          },
          servSkills = servantSkills(serv.id);

        for (var j = 7, m = serv.individuality.length; j < m; j++) {
          if (traits[serv.individuality[j]] == undefined) {
            console.log("No trait with id "+serv.individuality[j]+" on servant "+serv.id+" found.");
          }
          data.traits.push(getLocalName("traits", traits[serv.individuality[j]]));
        }

        for (j = 0, m = serv.cardIds.length; j < m; j++) {
          data.deck.push(cardMap[serv.cardIds[j]]);
        }

        for (j = 0, m = sandbox.master.mstSvtCard.length; j < m; j++) {
          var card = sandbox.master.mstSvtCard[j];
          if (card.svtId == serv.id) {
            var cardType = cardMap[card.cardId];
            data.hits[cardType] = card.normalDamage.length;
          }
        }

        for (j = 0, m = serv.classPassive.length; j < m; j++) {
          for (var k = 0, n = sandbox.master.mstSkill.length; k < n; k++) {
            if (serv.classPassive[j] == sandbox.master.mstSkill[k].id) {
              var name = getLocalName('skills', sandbox.master.mstSkill[k].name);
              data.passives.push(name);
              if (skills[name] == undefined) {
                var skill = {
                  name: name,
                  icon: sandbox.master.mstSkill[k].iconId
                };
                for (var x = 0, y = sandbox.skDetail.length; x < y; x++) {
                  if (sandbox.skDetail[x][0] == serv.classPassive[j]) {
                    skill.details = getLocalName("skillDetails", sandbox.skDetail[x][1]);
                    for (var o = 2, p = sandbox.skDetail[x].length; o < p; o++) {
                      var key = 'mag'+((o-1).toString());
                      skill[key] = sandbox.skDetail[x][o].replace('%', '') / 100;
                    }
                  }
                }
                skills[name] = skill;
              }
              break;
            }
          }
        }

        for (var k in servSkills) {
          if (parseInt(k) != NaN) {
            data["skill"+k] = servSkills[k];
          }
          else {
            data.passives.push(servSkills[k]);
          }
        }

        servants[data.id] = data;
      }
    }
    
    for (i in maps) {
      if (translationChanged[i]) {
        fs.writeFileSync('translations/'+i+'.json', JSON.stringify(maps[i], null, 2));
      }
    }

    fs.writeFileSync('data/servants.json', JSON.stringify(servants, null, 2));
    fs.writeFileSync('data/skills.json', JSON.stringify(skills, null, 2));
    fs.writeFileSync('data/nps.json', JSON.stringify(noblephantasms, null, 2));
  });
}