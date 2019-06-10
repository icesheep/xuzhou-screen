import Base from './Base';
import CoordConvertFactory from '../CoordConvertFactory';
import CoordConvertType from '../CoordConvertType';
import Param7 from "./Param7";

class SERVEN_BJ54 extends Base{
    constructor(params) {
        super(params);
        this.param7 = new Param7(2,params);
    }

    /**
     * 四参数法将WGS84经纬度坐标转换为北京54平面坐标
     * @param lon 将WGS84经度
     * @param lat 将WGS84纬度
     * @returns {*[]}
     */
    convert(lon, lat){
        return this.param7.convert(lon,lat);
    }


}
if(!CoordConvertFactory[CoordConvertType.SERVEN_BJ54]){
    CoordConvertFactory[CoordConvertType.SERVEN_BJ54] = SERVEN_BJ54;
}
export default SERVEN_BJ54;