import Base from './Base';
import CoordConvertFactory from '../CoordConvertFactory';
import CoordConvertType from '../CoordConvertType';
import GD from './GD';

class GCJ02LL2WGS84LL extends GD{
    constructor(params){
        super(params);
    }

    /**
     * 将GCJ02经纬度转换为wgs经纬度
     * @param lon
     * @param lat
     * @returns {*[]}
     */
    convert(lon, lat){
        var wgs84ll = super.gcj02ll2wgs84ll(lon, lat);
        return wgs84ll;
    }

}

if(!CoordConvertFactory[CoordConvertType.GCJ02LL_TO_WGS84LL]){
    CoordConvertFactory[CoordConvertType.GCJ02LL_TO_WGS84LL] = GCJ02LL2WGS84LL;
}
export default GCJ02LL2WGS84LL;