import Base from './Base';
import CoordConvertFactory from '../CoordConvertFactory';
import CoordConvertType from '../CoordConvertType';
import GD from './GD';

class GCJ02MC2GCJ02LL extends GD{
    constructor(params){
        super(params);
    }

    /**
     * 将GCJ02平面坐标转换为GCJ02经纬度
     * @param x
     * @param y
     * @returns {*[]}
     */
    convert(x, y){
        var gcj02ll = super.mercator2LatLon(x, y);
        return gcj02ll;
    }

}

if(!CoordConvertFactory[CoordConvertType.GCJ02MC_TO_GCJ02LL]){
    CoordConvertFactory[CoordConvertType.GCJ02MC_TO_GCJ02LL] = GCJ02MC2GCJ02LL;
}
export default GCJ02MC2GCJ02LL;

