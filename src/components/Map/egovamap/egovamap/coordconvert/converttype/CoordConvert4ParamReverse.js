define(['library/urban/egovamap/coordconvert/CoordConvConfig'], function(CoordConvConfig){
var CoordConvert4ParamReverse = {
	centerLon:0, //中央经度
	isXYChange:false, //是否需要X与Y对调
	fourPara:[0,0,0,0],//四参数实体对象 [deltaX,deltaY,ax,scale]
	wgs84Datum:[0,0,0],  //WGS84椭球体实体对象 [rMajor,rMinor,e2]
	
	xian80towgsllfourparam:function(x,y){
		var params = CoordConvConfig.coordConvert4ParamsReverse;
		return this.coordXY2WGS84(params,x,y);
	},
	beijing54towgsllfourparam:function(x,y){
		var params = CoordConvConfig.coordConvert4ParamsReverse;
		return this.coordXY2WGS84(params,x,y);
	},
	
	/**
	 * 构造函数
	 * @param params
	 */
	coordXY2WGS84:function(params,x,y){
		if (params != null) {
			var pams = params.split("#"); //从库中读取的四参数组合字符串
			var deltaX = parseFloat(pams[0].trim());
			var deltaY = parseFloat(pams[1].trim());
			var ax = parseFloat(pams[2].trim());
			var scale = parseFloat(pams[3].trim());
			this.fourPara = [deltaX, deltaY, ax, scale];
			this.wgs84Datum = [6378137, 6356752.3142, 0.00669437999013];

			if (pams.length >= 5) {
				if (pams[4].trim() == "1")
					this.isXYChange = true;
			}
			if (pams.length >= 6) {
				this.centerLon = parseFloat(pams[5].trim());
			}
		} else {
			alert("params is null");
		}
		return this.convert(x,y);
	},
	
	/**
	 * @param x 平面横坐标X
	 * @param y 平面纵坐标Y
	 */
	convert:function(x, y) {
		var wgs84xyz = this.para4Convert([x, y, 0], this.fourPara);
		var wgs84Point = this.gaussProjInvCal(wgs84xyz, this.wgs84Datum, this.centerLon);
		var lon = wgs84Point[0];
		var lat = wgs84Point[1];
		if (this.isXYChange) {
			return [lat, lon];
		} else {
			return [lon, lat];
		}
	},
	
	/**
	 * 高斯投影由大地平面坐标(Unit:Metres)反算经纬度(Unit:DD)
	 * @param XYZ
	 * @param datum
	 * @param lon
	 * @return
	 */
    gaussProjInvCal:function(XYZ, datum, lon)
    {
        var ProjNo, ZoneWide; ////带宽 
        var l, b, longitude0, X0, xval, yval;
        var e1, e2, f, a, ee, NN, T, C, M, D, R, u, fai;
        a = datum[0]; //54年北京坐标系参数 
        ZoneWide = 3; //3度带宽 
        ProjNo = parseInt(XYZ[0] / 1000000); //查找带号
        longitude0 = lon;
        if (Math.abs(lon - 0) < 0.000001)
        {
            longitude0 = ProjNo * ZoneWide; //中央经线
        }
        longitude0 = longitude0 * Math.PI / 180; //中央经线
        X0 = ProjNo * 1000000 + 500000;
        xval = XYZ[0] - X0; //带内大地坐标
        yval = XYZ[1];
        e2 = datum[2];
        e1 = (1.0 - Math.sqrt(1 - e2)) / (1.0 + Math.sqrt(1 - e2));
        ee = e2 / (1 - e2);
        M = yval;
        u = M / (a * (1 - e2 / 4 - 3 * e2 * e2 / 64 - 5 * e2 * e2 * e2 / 256));
        fai = u + (3 * e1 / 2 - 27 * e1 * e1 * e1 / 32) * Math.sin(2 * u) + (21 * e1 * e1 / 16 - 55 * e1 * e1 * e1 * e1 / 32) * Math.sin(4 * u) + (151 * e1 * e1 * e1 / 96) * Math.sin(6 * u) + (1097 * e1 * e1 * e1 * e1 / 512) * Math.sin(8 * u);
        C = ee * Math.cos(fai) * Math.cos(fai);
        T = Math.tan(fai) * Math.tan(fai);
        NN = a / Math.sqrt(1.0 - e2 * Math.sin(fai) * Math.sin(fai));

        R = a * (1 - e2) / Math.sqrt((1 - e2 * Math.sin(fai) * Math.sin(fai)) * (1 - e2 * Math.sin(fai) * Math.sin(fai)) * (1 - e2 * Math.sin(fai) * Math.sin(fai)));
        D = xval / NN;
        //计算经度(Longitude) 纬度(Latitude)
        l = longitude0 + (D - (1 + 2 * T + C) * D * D * D / 6 + (5 - 2 * C + 28 * T - 3 * C * C + 8 * ee + 24 * T * T) * D
        * D * D * D * D / 120) / Math.cos(fai);
        b = fai - (NN * Math.tan(fai) / R) * (D * D / 2 - (5 + 3 * T + 10 * C - 4 * C * C - 9 * ee) * D * D * D * D / 24
        + (61 + 90 * T + 298 * C + 45 * T * T - 256 * ee - 3 * C * C) * D * D * D * D * D * D / 720);
        //转换为度 DD
        l = l * 180 / Math.PI;
        b = b * 180 / Math.PI;
        return [l, b, XYZ[2]];
    },
	

    /**
     * 利用4参数求新坐标系的坐标
     * @param sourcePoint 待转换点的坐标实体对象
     * @param fourPara 坐标转换四参数实体对象
     * @return
     */
    para4Convert:function(sourcePoint, fourPara)
    {
        var k = fourPara[3];
        var a1 = k * Math.cos(fourPara[2]);
        var a2 = k * Math.sin(fourPara[2]);
       
        var toX = fourPara[0] + a1 * sourcePoint[0] + a2 * sourcePoint[1];
        var toY = fourPara[1] + a1 * sourcePoint[1] - a2 * sourcePoint[0];
        var toZ = sourcePoint[2];
        
        var ToCoordinate = [toX,toY,toZ];

        return ToCoordinate;
    }
}
return CoordConvert4ParamReverse;
});