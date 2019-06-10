import Base from './Base';
import CoordConvertFactory from '../CoordConvertFactory';
import CoordConvertType from '../CoordConvertType';

class BJCG2WGS84LL extends Base{
    constructor(params) {
        super(params);
        this.A1 = 6103729.01171875;
        this.B1 = -158449219.125;
        this.C1 = -709804016;
        this.D1 = 18920915837.022213;
        this.A2 = 7662548.3125;
        this.B2 = -305916495;
        this.C2 = -780249200;
        this.D2 = 31456748837.828285;
    }

    /**
     * 将北京城管坐标转换为WGS84经纬度
     * @param originX
     * @param originY
     * @returns {*[]}
     */
    convert(originX, originY){
        var y =originY*1000;
        var x= originX*1000;
        var b = (x-this.D1)*this.A2-this.B2*this.C1-(y-this.D2)*this.A1 + this.B1*this.C2;
        var a = this.A1*this.C2-this.A2*this.C1;
        var c = (x-this.D1)*this.B2 - (y-this.D2)*this.B1;
        var b2ac = Math.pow(b,2) - 4*a*c;
        var ry = (-b+Math.sqrt(b2ac))/(2*a);
        var rx = (x-this.D1-this.C1*ry)/(this.A1*ry+this.B1);
        return [rx,ry];
    }
}
if(!CoordConvertFactory[CoordConvertType.BJCG_TO_WGS84LL]){
    CoordConvertFactory[CoordConvertType.BJCG_TO_WGS84LL] = BJCG2WGS84LL;
}
export default BJCG2WGS84LL;