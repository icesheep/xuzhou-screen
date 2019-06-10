import Base from './Base';
import CoordConvertFactory from '../CoordConvertFactory';
import CoordConvertType from '../CoordConvertType';

class LZCG extends Base {
    constructor(params) {
        super(params);
        this.isXYChange=false;
        this.x0=-3943744;
        this.y0=-297082;
        this.A=0.999999;
        this.B=-0.012005;
        this.a=1;
        this.f=0.0;
        this.e2=0.0;
        this.e12=0.0;
        this.A1=0.0;
        this.A2=0.0;
        this.A3=0.0;
        this.A4=0.0;
        this.x=0.0;
        this.y=0.0;
        this.L0=117;
        if (this.params) {
            var pams = this.params.split("#");
            this.x0= parseFloat(pams[0].trim());
            this.y0 = parseFloat(pams[1].trim());
            this.A = parseFloat(pams[2].trim());
            this.B = parseFloat(pams[3].trim());

            if (pams.length >= 5) {
                if(pams[4].trim()=="1")
                    this.isXYChange = true;
            }
        }
    }

    /**
     * 将经纬度转换为兰州城管坐标
     * @param lon
     * @param lat
     * @returns {*[]}
     */
    convert(lon, lat){
        var p = 206264.8;
        var L0 = 105;
        var L = (lon - L0) * 3600 / p;
        var L2 = L * L;
        var radB = lat * Math.PI / 180;
        var radL = lon * Math.PI / 180;
        var Bs = lat * 3600;
        var cosB = Math.cos(radB);
        var sinB = Math.sin(radB);
        var cos2B = cosB * cosB;

        var a0 = 32140.404 - (135.3302 - (0.7092 - 0.004 * cos2B) * cos2B) * cos2B;
        var a3 = (0.3333333 + 0.001123 * cos2B) * cos2B - 0.1666667;
        var a4 = (0.25 + 0.00252 * cos2B) * cos2B - 0.04166;
        var a5 = 0.0083 - (0.1667-(0.1968+0.004*cos2B)*cos2B)*cos2B;
        var a6 = (0.166 * cos2B - 0.084) * cos2B;
        var N = 6399698.902 - (21562.267 - (108.973 - 0.612 * cos2B) * cos2B) * cos2B;

        var x1 = 6367558.4969 * (lat*3600 / p) - (a0 - (0.5 + (a4 + a6 * L2) * L2) * L2 * N) * sinB * cosB;
        var y1 = (1 + (a3 + a5 * L2) * L2) * L * N *cosB;
        if(y1 < 0) {
            y1 += 500000;
        }
        this.trans(x1, y1);
        return [this.x,this.y];
    }

    trans(xOld, yOld){
        var aipha = -0.012005;
        var xNew = this.x0 + (xOld * this.A - yOld * this.B);
        var yNew = this.y0 + (xOld * this.B + yOld * this.A);
        this.x = this.change(yNew);
        this.y = this.change(xNew);
        return true;
    }

    /**
     * 给坐标加一个最高位5.
     */
    change(x) {
        if (x < 0) {
            return x * 50;
        }
        var temp = x / 10;
        var count = 1;
        while (parseInt(temp) != 0) {
            temp = temp / 10;
            count++;
        }
        temp = temp + 5;
        for (var i = 0; i < count; i++) {
            temp = temp * 10;
        }
        return temp;
    }
}
if(!CoordConvertFactory[CoordConvertType.LZCG]){
    CoordConvertFactory[CoordConvertType.LZCG] = LZCG;
}
export default LZCG;