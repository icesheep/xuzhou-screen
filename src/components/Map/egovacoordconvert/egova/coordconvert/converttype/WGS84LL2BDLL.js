import Base from './Base';
import CoordConvertFactory from '../CoordConvertFactory';
import CoordConvertType from '../CoordConvertType';
import GD from './GD';

class WGS84LL2BDLL extends GD{
    constructor(params) {
        super(params);
    }

    /**
     * 将WGS84经纬度转换为百度经纬度
     * @param lon
     * @param lat
     * @returns {*[]}
     */
    convert(lon, lat){
        var bdll = super.wgs84ll2bdll(lon, lat);
        return bdll;
    }

}
if(!CoordConvertFactory[CoordConvertType.WGS84LL_TO_BDLL]){
    CoordConvertFactory[CoordConvertType.WGS84LL_TO_BDLL] = WGS84LL2BDLL;
}
export default WGS84LL2BDLL;