import Base from './Base';
import CoordConvertFactory from '../CoordConvertFactory';
import CoordConvertType from '../CoordConvertType';

class SIX_PARAMS extends Base{
    constructor(params) {
        super(params);
        this.a0=0;
        this.a1=1;
        this.a2=0;
        this.b0=0;
        this.b1=0;
        this.b2=1;
        if (params) {
            var pams = params.split("#"); //六参数形如："a0#a1#a2#b0#b1#b2"
            this.a0 = parseFloat(pams[0].trim());
            this.a1 = parseFloat(pams[1].trim());
            this.a2 = parseFloat(pams[2].trim());
            this.b0 = parseFloat(pams[3].trim());
            this.b1 = parseFloat(pams[4].trim());
            this.b2 = parseFloat(pams[5].trim());
        }
    }

    /**
     * 六参数法坐标转换
     * @param originX
     * @param originY
     * @returns {*[]}
     */
    convert(originX, originY){
        var x = this.a0 + this.a1 * originX + this.a2 * originY;
        var y = this.b0 + this.b1 * originX + this.b2 * originY;
        return [x,y];
    }

}
if(!CoordConvertFactory[CoordConvertType.SIX_PARAMS]){
    CoordConvertFactory[CoordConvertType.SIX_PARAMS] = SIX_PARAMS;
}
export default SIX_PARAMS;