import Base from './Base';
import CoordConvertFactory from '../CoordConvertFactory';
import CoordConvertType from '../CoordConvertType';
import {getConvertFactory} from '../CoordConvert';

class WGS84LL2CITY extends Base{
    constructor(params) {
        super(params);
        var parmArr = params.split(",");
        this.type = parmArr[0];
        this.params = parmArr[1];
        this.wgs842xyFactory = getConvertFactory(this.type,this.params);
    }

    /**
     * wgs84经纬度转城市平面
     * @param x
     * @param y
     */
    convert(lon, lat){
        var xy = this.wgs842xyFactory.convert(lon,lat);
        return xy;
    }


}
if(!CoordConvertFactory[CoordConvertType.WGS84LL_TO_CITY]){
    CoordConvertFactory[CoordConvertType.WGS84LL_TO_CITY] = WGS84LL2CITY;
}
export default WGS84LL2CITY;