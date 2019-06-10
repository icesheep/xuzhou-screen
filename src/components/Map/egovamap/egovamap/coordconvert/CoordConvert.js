define(['./converttype/CoordConvert4Param','./converttype/CoordConvert7Param','./converttype/CoordConvert4ParamReverse','./converttype/CoordConvertBdML','./converttype/CoordConvertGcj','./converttype/CoordConvertMkt','./converttype/YDCL'], 
function(CoordConvert4Param,CoordConvert7Param,CoordConvert4ParamReverse,CoordConvertBdML,CoordConvertGcj,CoordConvertMkt,YDCL){

/**
 *不转换："-1"或其他值
 *四参数转换：wgsll2beijing54fourparam(wgs84转北京54)||wgsll2xian80fourparam(wgs84转西安80)
 *四参数逆转: xian80towgsllfourparam(西安80转wgs84)||beijing54towgsllfourparam(北京54转wgs84)
 *百度米制与经纬度: bdll2bdmc(百度经纬度转百度米制)||bdmc2bdll(百度米制转百度经纬度)
 *国测局与与百度: bd09togcj02(百度坐标系 (BD-09)转火星坐标系 (GCJ-02))||gcj02tobd09(火星坐标系 (GCJ-02) 转百度坐标系 (BD-09)，包括谷歌、高德转百度)
 *国测局与wgs84: wgs84togcj02(WGS84转GCj02)||gcj02towgs84(GCJ02转换为WGS84)
 *墨卡托投影与wgs84: mercator2wgsll(墨卡托投影(谷歌、高德)转WGS84)||wgsll2mercator(WGS84转墨卡托投影(谷歌、高德))
 *六参数转换: coordconvert6param
 *七参数转换: wgsll2beijing54sevenparam(wgs84转北京54)||wgsll2xian80sevenparam(wgs84转西安80)
**/
var CoordConvert = {
	convert: function(convertType,coords,callback) {
		var self = this;
		var data = [];
			/*var CoordConvert4Param = require('./converttype/CoordConvert4Param');
			var CoordConvert7Param = require('./converttype/CoordConvert7Param');
			var CoordConvert4ParamReverse = require('./converttype/CoordConvert4ParamReverse');
			var CoordConvertBdML = require('./converttype/CoordConvertBdML');
			var CoordConvertGcj = require('./converttype/CoordConvertGcj');
			var CoordConvertMkt = require('./converttype/CoordConvertMkt');*/
			var func = null;
			
			if (convertType == "wgsll2beijing54fourparam" || convertType == "wgsll2xian80fourparam") {
				func = CoordConvert4Param;
			} else if (convertType == "xian80towgsllfourparam" || convertType == "beijing54towgsllfourparam") {	
				func = CoordConvert4ParamReverse;
			} else if (convertType == "bdll2bdmc" || convertType == "bdmc2bdll") {
				func = CoordConvertBdML;
			} else if (convertType == "bdll2wgsll"  || convertType == "wgsll2bdll"   || convertType == "bd09togcj02" ||
			           convertType == "gcj02tobd09" || convertType == "wgs84togcj02" || convertType == "gcj02towgs84") { 
				func = CoordConvertGcj;
			} else if (convertType == "mercator2wgsll" || convertType == "wgsll2mercator") {
				func = CoordConvertMkt;
			} else if(convertType == "coordconvert6param"){
				func = CoordConvert6Param;
			} else if(convertType == "wgsll2beijing54sevenparam"||convertType == "wgsll2xian80sevenparam"){
				func = CoordConvert7Param;
			}else if(convertType=='ydcl')
				func=YDCL;
			
			var tempArr = coords.split(";");
			for (var i = 0; i < tempArr.length; i++) {
				var ptStr = tempArr[i];
				var pt = ptStr.split(",");
				pt = [parseFloat(pt[0]), parseFloat(pt[1])];
				var item = [];
				if(func&&func[convertType]){
					item = func[convertType].apply(func,pt);
				}else{
					item = pt;
				}
				data.push(item);
			}

			callback && callback(data);
	}
}
	return CoordConvert;
});
