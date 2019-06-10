import Base from './Base';
import CoordConvertFactory from '../CoordConvertFactory';
import CoordConvertType from '../CoordConvertType';

class WLMQKFQ extends Base{
    constructor(params) {
        super(params);
        this.DX = 0;
        this.DY = 0;
        this.T = 0;
        this.K = 1;
        this.isXYChange = false;//是否需要X与Y对调
        this.L0 = 0;//中央经度，弧度
        if (this.params) {
            var pams = this.params.split("#");
            this.DX = parseFloat(pams[0].trim());
            this.DY = parseFloat(pams[1].trim());
            this.T = parseFloat(pams[2].trim());
            this.K = parseFloat(pams[3].trim());

            if (pams.length >= 5) {
                if(pams[4].trim() == "1"){
                    this.isXYChange = true;
                }
            }
            if(pams.length >= 6){
                this.L0 = parseFloat(pams[5].trim());
            }
        }
    }

    /**
     * 将经纬度转换为乌鲁木齐开发区坐标
     * @param lon
     * @param lat
     * @returns {*[]}
     */
    convert(lon, lat){
        var B = this.getRad(lat);
        var L = this.getRad(lon);
        var cos2b = Math.pow(Math.cos(B), 2);
        var a0 = 32144.5189 - (135.3646 - (0.7034 - 0.0041 * cos2b) * cos2b)
            * cos2b;
        var a4 = (0.25 + 0.00253 * cos2b) * cos2b - 0.04167;
        var a6 = (0.167 * cos2b - 0.083) * cos2b;
        var a3 = (0.3333333 + 0.001123 * cos2b) * cos2b - 0.1666667;
        var a5 = 0.00878 - (0.1702 - 0.20382 * cos2b) * cos2b;

        var N = 6399596.652
            - (21562.267 - (109.003 - (0.612 - 0.004 * cos2b) * cos2b)
                * cos2b) * cos2b;
        if(this.L0==0){
            this.L0 = this.getMeridian(L) / 180 * Math.PI;
        }
        //var p = 0.0;

        var l = (L - this.L0); // p;
        var l2 = l * l;
        var x = 6367558.4969 * B // p
            - (a0 - (0.5 + (a4 + a6 * l2) * l2) * l2 * N) * Math.sin(B)
            * Math.cos(B);
        var y = N * Math.cos(B) * (1 + (a3 + a5 * l2) * l2) * l;

        var resultX,resultY;
        if(this.isXYChange){
            //按现场实际情况，对调xy坐标
            resultY = this.DX + this.K * (x * Math.cos(this.T) - y * Math.sin(this.T));
            resultX = this.DY + this.K * (x * Math.sin(this.T) + y * Math.cos(this.T));
        }else{
            resultX = this.DX + this.K * (x * Math.cos(this.T) - y * Math.sin(this.T));
            resultY = this.DY + this.K * (x * Math.sin(this.T) + y * Math.cos(this.T));
        }
        return [resultX, resultY];
    }

    /**
     * 获取弧度
     * @param d
     * @returns {number}
     */
    getRad(d) {
        return d / 180 * Math.PI;
    }

    /**
     * 获取3度带中央子午线
     * @return {number}
     */
    getMeridian(val2) {
        if (val2 < 0) {
            return -1;
        }
        var L1 = val2 * 180 / Math.PI;
        var L2 = parseInt(L1.toString());
        var left = L1 - L2;
        var num = L2 / 3;
        left += L2 % 3;
        if (left >= 1.5) num++;
        return num * 3;
    }
}
if(!CoordConvertFactory[CoordConvertType.WLMQKFQ]){
    CoordConvertFactory[CoordConvertType.WLMQKFQ] = WLMQKFQ;
}
export default WLMQKFQ;