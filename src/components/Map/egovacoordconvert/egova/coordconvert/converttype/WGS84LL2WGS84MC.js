import Base from './Base';
import CoordConvertFactory from '../CoordConvertFactory';
import CoordConvertType from '../CoordConvertType';

class WGS84LL2WGS84MC extends Base{
    constructor(params) {
        super(params);
    }

    /**
     * 将WGS84经纬度转换为WGS84墨卡托投影平面坐标
     * @param lon
     * @param lat
     * @returns {*[]}
     */
    convert(lon, lat){
        var x = lon * 20037508.34 / 180;
        var y = Math.log(Math.tan((90 + lat) * Math.PI / 360)) / (Math.PI / 180);
        y = y * 20037508.34 / 180;
        return [x,y];
    }

}
if(!CoordConvertFactory[CoordConvertType.WGS84LL_TO_WGS84MC]){
    CoordConvertFactory[CoordConvertType.WGS84LL_TO_WGS84MC] = WGS84LL2WGS84MC;
}
export default WGS84LL2WGS84MC;