import Base from './Base';
import CoordConvertFactory from '../CoordConvertFactory';
import CoordConvertType from '../CoordConvertType';

class CSCG extends Base {
    constructor(params) {
        super(params);
        this.a=0;
        this.f=0;
        this.e2=0;
        this.e12=0;
        this.A1=0;
        this.A2=0;
        this.A3=0;
        this.A4=0;
        this.L0=112.5;
    }

    /**
     * 将经纬度转换为长沙城管坐标
     * @param lon
     * @param lat
     * @returns {*[]}
     */
    convert(lon, lat){
        this.PrjPoint_Krasovsky();
        var p = 206264.8;
        var L0 = 108;
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

        var part1 = 6367558.4969 * lat * 3600 / p;
        var part2 = (a4 + a6 * L2)*L2;
        var part3 = (0.5 + part2)*L2*N;
        var part4 = (a0 - part3) * sinB * cosB;
        var part5 = (a0 - (0.5 + (a4 + a6 * L2) * L2) * L2 * N) * sinB * cosB;
        var x1 = 6367558.4969 * lat*3600 / p - (a0 - (0.5 + (a4 + a6 * L2) * L2) * L2 * N) * sinB * cosB;
        var y1 = (1 + (a3 + a5 * L2) * L2) * L * N *cosB;
        if(y1 < 0) {
            y1 += 500000;
        }
        return this.trans(x1, y1);
    }


    PrjPoint_IUGG1975() {
        this.a = 6378140;
        this.f = 298.257;
        this.e2 = 1 - ((this.f - 1) / this.f) * ((this.f - 1) / this.f);
        this.e12 = (this.f / (this.f - 1)) * (this.f / (this.f - 1)) - 1;
        this.A1 = 111133.0047;
        this.A2 = -16038.5282;
        this.A3 = 16.8326;
        this.A4 = -0.0220;
    }

    PrjPoint_Krasovsky() {
        this.a = 6378245;
        this.f = 298.3;
        this.e2 = 1 - ((this.f - 1) / this.f) * ((this.f - 1) / this.f);
        this.e12 = (this.f / (this.f - 1)) * (this.f / (this.f - 1)) - 1;
        this.A1 = 111134.8611;
        this.A2 = -16036.4803;
        this.A3 = 16.8281;
        this.A4 = -0.0220;
    }

    trans(xOld, yOld) {
        var x0 = -3020366.0078;
        var y0 = -36557.8676;
        var k = -38.2363475189;

        var aipha = -0.706823488055555 * Math.PI / 180;

        //根据现场要求对调X,Y坐标.
        var xNew = x0 + (1 + k / 1000000) * (xOld * Math.cos(aipha) + yOld * Math.sin(aipha));
        var yNew = y0 + (1 + k / 1000000) * (-xOld * Math.sin(aipha) + yOld * Math.cos(aipha));

        return [yNew, xNew];
    }
}
if(!CoordConvertFactory[CoordConvertType.CSCG]){
    CoordConvertFactory[CoordConvertType.CSCG] = CSCG;
}
export default CSCG;