define([], function(){
var CoordConvertMkt = {
	mercator2wgsll: function (px,py) {
		var x = px / 20037508.34 * 180;
		var y = py / 20037508.34 * 180;
		y = 180 / Math.PI * (2 * Math.atan(Math.exp(y * Math.PI / 180)) - Math.PI / 2);
		return [x,y];
	},

	wgsll2mercator: function (px,py){
		var x = px * 20037508.34 / 180;
		var y = Math.log(Math.tan((90 + py) * Math.PI / 360)) / (Math.PI / 180);
		y = y * 20037508.34 / 180;
		return [x,y];
	}
}
return CoordConvertMkt;
});