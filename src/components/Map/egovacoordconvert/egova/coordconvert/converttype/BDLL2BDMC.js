import Base from './Base';
import CoordConvertFactory from '../CoordConvertFactory';
import CoordConvertType from '../CoordConvertType';
import BD from './BD';

class BDLL2BDMC extends BD{
    constructor(params){
        super(params);
    }

    /**
     * 将百度经纬度坐标转换为百度米制
     * @param lon
     * @param lat
     * @returns {*[]}
     */
    convert(lon, lat){
        var bdmc = super.bdll2bdmc(lon,lat);
        return bdmc;
    }

}

if(!CoordConvertFactory[CoordConvertType.BDLL_TO_BDMC]){
    CoordConvertFactory[CoordConvertType.BDLL_TO_BDMC] = BDLL2BDMC;
}
export default BDLL2BDMC;












