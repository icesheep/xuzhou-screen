import Base from './Base';
import CoordConvertFactory from '../CoordConvertFactory';
import CoordConvertType from '../CoordConvertType';
import GD from './GD';

class WGS84LL2GCJ02LL extends GD{
    constructor(params) {
        super(params);
    }

    /**
     * 将WGS84经纬度转换为GCJ02经纬度
     * @param lon
     * @param lat
     * @returns {*[]}
     */
    convert(lon, lat){
        var gcj02ll = super.wgs84ll2gcj02ll(lon, lat);
        return gcj02ll;
    }

}
if(!CoordConvertFactory[CoordConvertType.WGS84LL_TO_GCJ02LL]){
    CoordConvertFactory[CoordConvertType.WGS84LL_TO_GCJ02LL] = WGS84LL2GCJ02LL;
}
export default WGS84LL2GCJ02LL;