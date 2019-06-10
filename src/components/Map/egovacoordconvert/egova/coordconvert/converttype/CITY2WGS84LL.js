import Base from './Base';
import CoordConvertFactory from '../CoordConvertFactory';
import CoordConvertType from '../CoordConvertType';
import CITY2WGS84LL4Parms from './CITY2WGS84LL4Parms';
import CITY2WGS84LLApprox from './CITY2WGS84LLApprox';

class CITY2WGS84LL extends Base{
    constructor(params) {
        super(params);
        this.convertImp = null;
        if(params){
            var parmArr = params.split(",");
            if(parmArr.length>=2){
                this.convertImp = new CITY2WGS84LLApprox(params);
            }else{
                this.convertImp = new CITY2WGS84LL4Parms(params);
            }
        }else{
            console.info("传入的坐标转换参数为空，无法完成转换！");
        }

    }

    /**
     * 城市平面反转WGS84经纬度
     * @param x
     * @param y
     * @returns {*}
     */
    convert(x, y){
        if(!this.params){
            return [-1,-1];
        }
        var lonlat = this.convertImp.convert(x,y);
        return lonlat;
    }

}
if(!CoordConvertFactory[CoordConvertType.CITY_TO_WGS84LL]){
    CoordConvertFactory[CoordConvertType.CITY_TO_WGS84LL] = CITY2WGS84LL;
}
export default CITY2WGS84LL;