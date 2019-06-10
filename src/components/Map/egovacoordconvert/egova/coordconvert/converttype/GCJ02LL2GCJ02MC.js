import Base from './Base';
import CoordConvertFactory from '../CoordConvertFactory';
import CoordConvertType from '../CoordConvertType';
import GD from './GD';

class GCJ02LL2GCJ02MC extends GD{
    constructor(params){
        super(params);
    }

    /**
     * 将GCJ02经纬度转换为GCJ02MC
     * @param lon
     * @param lat
     * @returns {*[]}
     */
    convert(lon, lat){
        var gcj02mc = super.latLon2Mercator(lat, lon);
        return gcj02mc;
    }

}

if(!CoordConvertFactory[CoordConvertType.GCJ02LL_TO_GCJ02MC]){
    CoordConvertFactory[CoordConvertType.GCJ02LL_TO_GCJ02MC] = GCJ02LL2GCJ02MC;
}
export default GCJ02LL2GCJ02MC;