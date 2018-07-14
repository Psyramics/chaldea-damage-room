(function () {
var app = window.ChaldeaDamageRoom || {};

var curves = {
	"1": [
	   0, 0 , //etc.
	]
};
jQuery.get("data/curves.json").done(function (data) {
	curves = data.curves;
});
app.stats = function (curveType, level, hpBase, hpMax, atkBase, atkMax) {
	var curve = curves[curveType][level];
	var hp = Math.floor(hpBase + ((hpMax - hpBase) * curve / 1000));
	var atk = Math.floor(atkBase + ((atkMax - atkBase) * curve / 1000));
	
	return {
		hp: hp,
		atk: atk
	};
}
}();