import Base from './Base';
import CoordConvertFactory from '../CoordConvertFactory';
import CoordConvertType from '../CoordConvertType';
import Param4 from "./Param4";

class WGS84 extends Base{
    constructor(params) {
        super(params);
        this.param4 = new Param4(2,params);
    }

    /**
     * 四参数法将WGS84经纬度坐标转换为北京54平面坐标
     * @param lon 将WGS84经度
     * @param lat 将WGS84纬度
     * @returns {*[]}
     */
    convert(lon, lat){
        return this.param4.convert(lon,lat);
    }

}
if(!CoordConvertFactory[CoordConvertType.FOUR_WGS84]){
    CoordConvertFactory[CoordConvertType.FOUR_WGS84] = WGS84;
}
export default WGS84;