define(['library/urban/egovamap/coordconvert/CoordConvConfig'], function(CoordConvConfig){
var YDCL = {
	/** 日志打印的Tag,便于过滤日志. */
    DX: 0,
    DY: 0,
    T: 0,
    K: 1, 

    isXYChange: false, //是否需要X与Y对调
	L0: 0, //中央经度，弧度
	
	datum: [6378137, 6356752.3142, 0.00669437999013],
	
	/**
	 * 将经纬坐标转换为城市坐标.
	 * 
	 * @param b 地理纬度坐标, 度度
	 * @param l 地理经度坐标, 度度
	 * 
	 * @return 城市坐标[x, y]
	 */
	ydcl:function(b, l) {
		var params = CoordConvConfig.coordConvert4Params;
		if (params != null) {
			var pams = params.split("#");
			this.DX = parseFloat(pams[0].trim());
			this.DY = parseFloat(pams[1].trim());
			this.T = parseFloat(pams[2].trim()); /// 180 * Math.PI;
			this.K = parseFloat(pams[3].trim());

			if (pams.length >= 5) {
				if (pams[4].trim() == "1")
					this.isXYChange = true;
			}	
			if (pams.length >= 6) {
				this.L0 = parseFloat(pams[5].trim()); // / 180 * Math.PI;
			}
			console.log("DX=" + this.DX + ",DY=" + this.DY + ",T=" + this.T + ",K=" + this.K + ",isXYChange=" + this.isXYChange + ",L0=" + this.L0);
			var gaparams = YDCL.GaussProjCal(l, b, 0);
			console.log("gaparams=" + gaparams);
			var result = YDCL.Para4Convert(gaparams);
			console.log("result=" + result[1]+","+ result[0]);
			if (this.isXYChange) {
				console.log("(" + b + "," + l + ")------>" + "(" + result[1] + "," + result[0] + ")");
				return [result[1], result[0]];
			}
			console.log( "("+b+","+l+")------>"+"("+result[0]+","+result[1]+")");
		} else {
			console.log("params is null");
		}
		
		return [result[0], result[1]];
	},

	/**
	 * 高斯投影由经纬度(Unit:DD)计算大地平面坐标(含带号，Unit:Metres) 
	 * @param b
	 * @param l
	 * @param h
	 * @return
	 */
    GaussProjCal:function(b, l, h)
    {
        var ProjNo, ZoneWide; ////带宽 
        var longitude0, X0, xval, yval;
        var a, e2, ee, NN, T, C, A, M;
        ZoneWide = 3; //3度带宽 
        a = parseFloat(this.datum[0]);
        ProjNo = parseInt((l - 1.5) / ZoneWide + 1);
        longitude0 = this.L0;
        if (Math.abs(this.L0 - 0) < 0.000001)
        {
            longitude0 = ProjNo * ZoneWide; //中央经线
        }
        longitude0 = longitude0 * Math.PI / 180;
        l = l * Math.PI / 180; //经度转换为弧度
        b = b * Math.PI / 180; //纬度转换为弧度
        e2 = this.datum[2];
        ee = e2 * (1.0 - e2);
        NN = a / Math.sqrt(1.0 - e2 * Math.sin(b) * Math.sin(b));
        T = Math.tan(b) * Math.tan(b);
        C = ee * Math.cos(b) * Math.cos(b);
        A = (l - longitude0) * Math.cos(b);

        M = a * ((1 - e2 / 4 - 3 * e2 * e2 / 64 - 5 * e2 * e2 * e2 / 256) * b 
        		- (3 * e2 / 8 + 3 * e2 * e2 / 32 + 45 * e2 * e2 * e2 / 1024) * Math.sin(2 * b) 
        		+ (15 * e2 * e2 / 256 + 45 * e2 * e2 * e2 / 1024) * Math.sin(4 * b) - (35 * e2 * e2 * e2 / 3072) * Math.sin(6 * b));
        xval = NN * (A + (1 - T + C) * A * A * A / 6 + (5 - 18 * T + T * T + 72 * C - 58 * ee) * A * A * A * A * A / 120);
        yval = M + NN * Math.tan(b) * (A * A / 2 + (5 - T + 9 * C + 4 * C * C) * A * A * A * A / 24 + (61 - 58 * T + T * T + 600 * C - 330 * ee) * A * A * A * A * A * A / 720);
        //X0 = 1000000L * ProjNo + 500000L;
        X0 =  parseFloat(500000);
        xval = xval + X0;
        return [xval, yval, h];
    },

    /**
     * 利用4参数求新坐标系的坐标
     * @param aPtSource
     * @return
     */
    Para4Convert:function(aPtSource)
    {
        var k = parseFloat(this.K);
        var a1 = parseFloat(k * Math.cos(this.T));
        var a2 = parseFloat(k * Math.sin(this.T));

        var ToCoordinate = new Array(3);
        ToCoordinate[0] = this.DX + a1 * aPtSource[0] + a2 * aPtSource[1];
        ToCoordinate[1] = this.DY + a1 * aPtSource[1] - a2 * aPtSource[0];
        ToCoordinate[2] = aPtSource[2];

        return ToCoordinate;
    }
}
return YDCL;
});