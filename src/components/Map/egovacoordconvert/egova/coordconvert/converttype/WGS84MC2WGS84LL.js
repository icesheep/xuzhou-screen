import Base from './Base';
import CoordConvertFactory from '../CoordConvertFactory';
import CoordConvertType from '../CoordConvertType';

class WGS84MC2WGS84LL extends Base{
    constructor(params) {
        super(params);
    }

    /**
     * 墨卡托米制反转WGS84经纬度
     * @param x
     * @param y
     */
    convert(x, y){
        var lon = x / 20037508.3427892 * 180;
        var lat = y / 20037508.3427892 * 180;
        lat = 180 / Math.PI * (2 * Math.atan(Math.exp(lat * Math.PI / 180)) - Math.PI / 2);

        return [lon, lat];
    }

}
if(!CoordConvertFactory[CoordConvertType.WGS84MC_TO_WGS84LL]){
    CoordConvertFactory[CoordConvertType.WGS84MC_TO_WGS84LL] = WGS84MC2WGS84LL;
}
export default WGS84MC2WGS84LL;