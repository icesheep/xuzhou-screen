import Base from './Base';
import CoordConvertFactory from '../CoordConvertFactory';
import CoordConvertType from '../CoordConvertType';
import GD from './GD';

class BDLL2GCJ02LL extends GD{
    constructor(params){
        super(params);
    }

    /**
     * 将百度经纬度坐标转换为GCJ02经纬度
     * @param lon
     * @param lat
     * @returns {*[]}
     */
    convert(lon, lat){
        var gcjo2ll = super.bdll2gcjll(lat,lon);
        return gcjo2ll;
    }

}

if(!CoordConvertFactory[CoordConvertType.BDLL_TO_GCJ02LL]){
    CoordConvertFactory[CoordConvertType.BDLL_TO_GCJ02LL] = BDLL2GCJ02LL;
}
export default BDLL2GCJ02LL;
















