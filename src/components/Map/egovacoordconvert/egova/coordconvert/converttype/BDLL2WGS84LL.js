import Base from './Base';
import CoordConvertFactory from '../CoordConvertFactory';
import CoordConvertType from '../CoordConvertType';
import GD from './GD';

class BDLL2WGS84LL extends GD{
    constructor(params){
        super(params);
    }

    /**
     * 将百度经纬度坐标转换为wgs84经纬度
     * @param lon
     * @param lat
     * @returns {*[]}
     */
    convert(lon, lat){
        var wgs84ll = super.bdll2wgs84ll(lon,lat);
        return wgs84ll;
    }

}

if(!CoordConvertFactory[CoordConvertType.BDLL_TO_WGS84LL]){
    CoordConvertFactory[CoordConvertType.BDLL_TO_WGS84LL] = BDLL2WGS84LL;
}
export default BDLL2WGS84LL;














