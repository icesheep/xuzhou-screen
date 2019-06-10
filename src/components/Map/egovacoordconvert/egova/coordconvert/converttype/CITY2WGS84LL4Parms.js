import Base from './Base';

class CITY2WGS84LL4Parms extends Base{
    constructor(params) {
        super(params);
        this.deltaX = 0;
        this.deltaY = 0;
        this.ax = 0;
        this.scale = 0;
        this.isXYChange =false; //是否需要X与Y对调
        this.centerLon = 0; //中央经度
        if (params) {
            var pams = this.params.split("#");
            this.deltaX = parseFloat(pams[0].trim());
            this.deltaY = parseFloat(pams[1].trim());
            this.ax = parseFloat(pams[2].trim());
            this.scale = parseFloat(pams[3].trim());

            if (pams.length >= 5) {
                if (pams[4].trim() == "1")
                    this.isXYChange = true;
            }
            if (pams.length >= 6) {
                this.centerLon = parseFloat(pams[5].trim());
            }
        }
    }

    /**
     * YDCL四参数法将城市平面反转为WGS84经纬度
     * @param x
     * @param y
     */
    convert(x, y) {
        var originX = x;
        var originY = y;
        if(this.isXYChange){
            originX = y;
            originY = x;
        }
        //利用4参数求新坐标系的坐标
        var k = this.scale;
        var a1 = k * Math.cos(this.ax);
        var a2 = k * Math.sin(this.ax);
        var toX = this.deltaX + a1 * originX + a2 * originY;
        var toY = this.deltaY + a1 * originY - a2 * originX;

        var ProjNo, ZoneWide; ////带宽
        var l, b, longitude0, X0, xval, yval,lon;
        var e1, e2, f, a, ee, NN, T, C, M, D, R, u, fai;
        a = 6378137; //54年北京坐标系参数
        ZoneWide = 3; //3度带宽
        ProjNo = parseInt(toX/ 1000000); //查找带号
        lon = this.centerLon;
        longitude0 = lon;
        if (Math.abs(lon - 0) < 0.000001)
        {
            longitude0 = ProjNo * ZoneWide; //中央经线
        }
        longitude0 = longitude0 * Math.PI / 180; //中央经线
        X0 = ProjNo * 1000000 + 500000;
        xval = toX - X0; //带内大地坐标
        yval = toY;
        e2 = 0.00669437999013;
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

        return [l,b];
    }
}
export default CITY2WGS84LL4Parms;