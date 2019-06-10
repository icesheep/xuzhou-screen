define(['library/urban/egovamap/coordconvert/CoordConvConfig'], function(CoordConvConfig){
var CoordConvert6Param = {
	a0: 0,
    a1: 1,
    a2: 0,
    b0: 0,
    b1: 0,
    b2: 1,
	
	/**
	 * 构造函数
	 * @param params 
	 * @param originX 待转横坐标X
	 * @param originY 待转纵坐标Y
	 */
	coordconvert6param:function(originX,originY){
		var convertedX = -1;
		var convertedY = -1;
		var params = CoordConvConfig.coordConvert4Params;
		if (params != null) {
			var pams = params.split("#"); //从库中读取的六参数组合字符串，形如："a0#a1#a2#b0#b1#b2"
			a0 = parseFloat(pams[0].trim());
			a1 = parseFloat(pams[1].trim());
			a2 = parseFloat(pams[2].trim());
			b0 = parseFloat(pams[3].trim());
			b1 = parseFloat(pams[4].trim());
			b2 = parseFloat(pams[5].trim());
			convertedX = a0 + a1 * originX + a2 * originY;
			convertedY = b0 + b1 * originX + b2 * originY;
			return [convertedX, convertedY];
		} else {
			console.log( "params is null");
			return [convertedX, convertedY];
		}
		
	}
}
return CoordConvert6Param;
});