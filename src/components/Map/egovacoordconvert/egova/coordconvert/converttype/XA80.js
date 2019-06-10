import Base from './Base';
import CoordConvertFactory from '../CoordConvertFactory';
import CoordConvertType from '../CoordConvertType';
import Param4 from "./Param4";

class XA80 extends Base{
    constructor(params) {
        super(params);
        this.param4 = new Param4(1,params);
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
if(!CoordConvertFactory[CoordConvertType.FOUR_XA80]){
    CoordConvertFactory[CoordConvertType.FOUR_XA80] = XA80;
}
export default XA80;