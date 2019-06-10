import Base from './Base';
import CoordConvertFactory from '../CoordConvertFactory';
import CoordConvertType from '../CoordConvertType';
import BD from './BD';

class BDMC2BDLL extends BD{
    constructor(params){
        super(params);
    }

    /**
     * 将百度米制坐标转换为百度经纬度
     * @param x
     * @param y
     * @returns {*[]}
     */
    convert(x, y){
        var bdll = super.bdmc2bdll(x,y);
        return bdll;
    }

}

if(!CoordConvertFactory[CoordConvertType.BDMC_TO_BDLL]){
    CoordConvertFactory[CoordConvertType.BDMC_TO_BDLL] = BDMC2BDLL;
}
export default BDMC2BDLL;














