import Base from './Base';
import {getConvertFactory} from '../CoordConvert';

class CITY2WGS84LLApprox  extends Base{
    constructor(params) {
        super(params);
        //(逼近法)经纬度初始值，默认值为CGCS2000大地原点陕西省泾阳县永乐镇北横流村
        //具体位置在：北纬34°32′27.00″东经108°55′25.00″。
        this.centerLon = 108.9236111;
        this.centerLat = 34.54083333;
        this.lonPermeter = 0.00000901;//每米代表的实地近似经度，默认值为1/111000，由纬度决定真实值
        this.latPermeter = 0.00000901;//每米代表的实地近似纬度，常量值1/111000，即每度111公里
        var parmArr = params.split(",");
        this.type = parmArr[0];
        this.params = parmArr[1];
        this.isXYChange = false;
        this.parmsHasCenterLon = false;//转换参数中是否含有中央经线
        this.hasParseCeterLonlat = false;//是否已经解析了中央经纬度
        this.wgs842xyFactory = null;

        if(this.params ){
            var pams = this.params.split("#");
            if (pams.length >= 5) {
                if (pams[4].trim() == "1")
                    this.isXYChange = true;
            }
            if (pams.length >= 6) {
                this.centerLon = parseFloat(pams[5].trim());
                this.lonPermeter = 0.00000901 * Math.abs(Math.cos(this.centerLat));
                this.wgs842xyFactory = getConvertFactory(this.type,this.params);
                this.parmsHasCenterLon=true;
            }else{
                console.info("传入的四参数{"+params+"}中不含中央经线, 无法执行当地平面反转到WGS84经纬度");
                this.centerLon = 108.9236111;
                this.lonPermeter = 0.00000901 * Math.abs(Math.cos(108.9236111));
                this.wgs842xyFactory = null;
                this.parmsHasCenterLon=false;
            }
        }
    }

    /**
     * 将城市平面坐标转换为WGS84经纬度坐标--正转四参数法
     * @param x
     * @param y
     */
    convert(x, y)
    {
        //转换参数中不含中央经线，无法转换
        if(!this.parmsHasCenterLon){
            this.hasParseCeterLonlat = false;
            return [-1,-1];
        }
        if(!this.hasParseCeterLonlat){//未解析出中央经纬度
            this.centerLat = this.GetNearestLat(x, y,this.centerLon);
            this.hasParseCeterLonlat = true;
        }

        //首先获取平面坐标值均小于输入xy坐标的最佳逼近经纬度
        var approxLowLonlat = this.GetApproxLowLonlat(x, y);
        var approxLowLon = approxLowLonlat[0];
        var approxLowLat = approxLowLonlat[1];
        var approxLowX = approxLowLonlat[2];
        var approxLowY = approxLowLonlat[3];

        //获取平面坐标值均大于输入xy坐标的最佳逼近经纬度
        var approxUpperLon = approxLowLon + 0.00001;
        var approxUpperLat = approxLowLat + 0.00001;
        var approxUpperXY = this.wgs842xyFactory.convert(approxUpperLon, approxUpperLat);
        var approxUpperX = approxUpperXY[0];
        var approxUpperY = approxUpperXY[1];
        while (approxUpperX < x)
        {
            approxUpperLon += 0.00001;
            approxUpperXY = this.wgs842xyFactory.convert(approxUpperLon, approxUpperLat);
            approxUpperX = approxUpperXY[0];
        }
        while (approxUpperY < y)
        {
            approxUpperLat += 0.00001;
            approxUpperXY = this.wgs842xyFactory.convert(approxUpperLon, approxUpperLat);
            approxUpperY = approxUpperXY[1];
        }

        //利用左下和右上角点进行插值
        var offX = (x - approxLowX) / (approxUpperX - approxLowX);
        var offY = (y - approxLowY) / (approxUpperY - approxLowY);

        var lon = approxLowLon + offX * (approxUpperLon - approxLowLon);
        var lat = approxLowLat + offY * (approxUpperLat - approxLowLat);

        this.centerLon = lon;
        this.centerLat = lat;
        return [lon, lat];
    }

    /**
     * 在经度已知的前提下，获取最接近平面坐标对应的真实经纬度的整数纬度
     * @param x
     * @param y
     * @param lon
     * @returns {*}
     */
    GetNearestLat(x,y,lon){
        //中国大陆纬度范围：18 - 54
        var dy;
        var convertXY;
        var minKey=0;
        var minDy=0;
        for (var i=18;i<=54;i++)
        {
            convertXY = this.wgs842xyFactory.convert(lon, i);
            dy = Math.abs(convertXY[1] - y);
            if(i==18){
                minDy = dy;
                minKey = 18;
            }
            if(dy<minDy){
                minDy = dy;
                minKey = i;
            }
        }
        return minKey;
    }

    /**
     * 获取最接近输入平面坐标的真实经纬度的近似经纬度和平面坐标，要求近似经纬度值均小于真实经纬度
     * @param x
     * @param y
     * @returns {*[]}
     */
    GetApproxLowLonlat(x, y){
        var orginX = x;
        var orginY = y;

        //计算中心点经纬度的平面坐标
        var centerXY = this.wgs842xyFactory.convert(this.centerLon, this.centerLat);
        var centerX = centerXY[0];
        var centerY = centerXY[1];

        //获取输入平面坐标的初始近似经纬度坐标
        var approxLon = this.centerLon + (orginX - centerX -1) * this.lonPermeter; //-1是为了尽可能从小于真实值方向趋近
        var approxLat = this.centerLat + (orginY - centerY -1) * this.latPermeter;

        //近似平面坐标
        var approxXY = this.wgs842xyFactory.convert(approxLon, approxLat);
        var approxX = approxXY[0];
        var approxY = approxXY[1];

        while (approxX > x)
        {
            approxLon -= 0.00001;
            approxXY = this.wgs842xyFactory.convert(approxLon, approxLat);
            approxX = approxXY[0];
        }
        while ((x - approxX) > 10)
        {
            approxLon += 0.0001;
            approxXY = this.wgs842xyFactory.convert(approxLon, approxLat);
            approxX = approxXY[0];
        }
        while (approxY > y)
        {
            approxLat -= 0.00001;
            approxXY = this.wgs842xyFactory.convert(approxLon, approxLat);
            approxY = approxXY[1];
        }
        while ((y - approxY) > 10)
        {
            approxLat += 0.0001;
            approxXY = this.wgs842xyFactory.convert(approxLon, approxLat);
            approxY = approxXY[1];
        }
        return [approxLon, approxLat, approxX, approxY];
    }
}
export default CITY2WGS84LLApprox;