import Base from './Base';
import CoordConvertFactory from '../CoordConvertFactory';
import CoordConvertType from '../CoordConvertType';

class SYCG extends Base {
    constructor(params) {
        super(params);
        this.A0=0.0;
        this.A1=1.0;
        this.A2=0.0;
        this.B0=0.0;
        this.B1=0.0;
        this.B2=1.0;
        this.isXYChange=false;
        if (this.params) {
            var pams = this.params.split("#");
            this.A0 = parseFloat(pams[0].trim());
            this.A1 = parseFloat(pams[1].trim());
            this.A2 = parseFloat(pams[2].trim());
            this.B0 = parseFloat(pams[3].trim());
            this.B1 = parseFloat(pams[4].trim());
            this.B2 = parseFloat(pams[5].trim());
            if (pams.length >= 7) {
                if (pams[6].trim() == "1")
                    this.isXYChange = true;
            }
        }
    }

    /**
     * 将经纬度转换为沈阳城管坐标
     * @param lon
     * @param lat
     * @returns {*[]}
     */
    convert(lon, lat){
        //沈阳脱密后经纬度
        var resultX = this.A0 + this.A1 * lon + this.A2 * lat;
        var resultY = this.B0 + this.B1 * lon + this.B2 * lat;
        var result = this.isXYChange ? [resultY,resultX]:[resultX, resultY];
        return result;
    }

}
if(!CoordConvertFactory[CoordConvertType.SYCG]){
    CoordConvertFactory[CoordConvertType.SYCG] = SYCG;
}
export default SYCG;