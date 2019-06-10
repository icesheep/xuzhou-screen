import Base from './Base';
import CoordConvertFactory from '../CoordConvertFactory';
import CoordConvertType from '../CoordConvertType';
import GD from './GD';

class GCJ02LL2BDLL extends GD{
    constructor(params) {
        super(params);
    }

    /**
     * GCJ02经纬度转百度经纬度
     * @param x
     * @param y
     * @returns {*}
     */
    convert(lon, lat){
        var bdll = super.gcj02ll2bdll(lon, lat);
        return bdll;
    }

}
if(!CoordConvertFactory[CoordConvertType.GCJ02LL_TO_BDLL]){
    CoordConvertFactory[CoordConvertType.GCJ02LL_TO_BDLL] = GCJ02LL2BDLL;
}
export default GCJ02LL2BDLL;
