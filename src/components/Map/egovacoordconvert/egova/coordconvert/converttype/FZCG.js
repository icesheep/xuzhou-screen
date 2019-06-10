import Base from './Base';
import CoordConvertFactory from '../CoordConvertFactory';
import CoordConvertType from '../CoordConvertType';

class FZCG extends Base {
    constructor(params) {
        super(params);
    }

    /**
     * 将经纬度转换为福州城管坐标
     * @param lon
     * @param lat
     * @returns {*[]}
     */
    convert(lon, lat){
        return [lon, lat];
    }

}
if(!CoordConvertFactory[CoordConvertType.FZCG]){
    CoordConvertFactory[CoordConvertType.FZCG] = FZCG;
}
export default FZCG;