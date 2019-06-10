import Base from './Base';
import CoordConvertFactory from '../CoordConvertFactory';
import CoordConvertType from '../CoordConvertType';

class BJCG extends Base{
    constructor(params) {
        super(params);
        this.m_bIsUseRadom = true;
        this.m_dRadomValue = 40;
        this.DX = 0;
        this.DY = 0;
        this.T = 0;
        this.K = 1;
        if (this.params) {
            var pams = this.params.split("#");
            this.DX = parseFloat(pams[0].trim());
            this.DY = parseFloat(pams[1].trim());
            this.T = parseFloat(pams[2].trim());
            this.K = parseFloat(pams[3].trim());
        }
    }

    /**
     * 将经纬度转换为北京海淀、东城平面坐标
     * @param lon
     * @param lat
     * @returns {*[]}
     */
    convert(lon, lat){
        var x = this.GetX(lon, lat);
        var y = this.GetY(lon, lat);
        var resultX = this.DX + this.K * (x * Math.cos(this.T) - y * Math.sin(this.T));
        var resultY = this.DY + this.K * (x * Math.sin(this.T) + y * Math.cos(this.T));
        return [resultX, resultY];
    }


    GetX(dx, dy) {
        var Ax = 6103729.01171875;
        var Bx = -158449219.125;
        var Cx = -709804016;
        var Dx = 18920915837.022213;
        var fx = Ax * dx * dy + Bx * dx + Cx * dy + Dx;
        if (this.m_bIsUseRadom)
            return fx / 1000 + this.GetRandom(this.m_dRadomValue);
        else
            return fx / 1000;
    }

    GetY(dx, dy) {
        var Ay = 7662548.3125;
        var By = -305916495;
        var Cy = -780249200;
        var Dy = 31456748837.828285;
        var fy = Ay * dx * dy + By * dx + Cy * dy + Dy;
        if (this.m_bIsUseRadom)
            return fy / 1000 + this.GetRandom(this.m_dRadomValue);
        else
            return fy / 1000;
    }

    GetRandom(dValue) {
        return dValue * (Math.random() - 0.5);
    }
}
if(!CoordConvertFactory[CoordConvertType.BJCG]){
    CoordConvertFactory[CoordConvertType.BJCG] = BJCG;
}
export default BJCG;