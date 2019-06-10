import Base from './Base';
import CoordConvertFactory from '../CoordConvertFactory';
import CoordConvertType from '../CoordConvertType';

class GPS extends Base{
    constructor(params) {
        super(params);
        this.DX = 0;
        this.DY = 0;
        this.isXYChange = false;
        if (this.params) {
            var pams = this.params.split("#");
            this.DX = parseFloat(pams[0].trim());
            this.DY = parseFloat(pams[1].trim());
            if (pams.length >= 3) {
                if (pams[2].trim() == "1")
                    this.isXYChange = true;
            }
        }
    }

    /**
     * 将经纬度转换为GPS坐标
     * @param lon
     * @param lat
     * @returns {*[]}
     */
    convert(lon, lat){
        var lon_lat = [];
        lon_lat[0] = lon + this.DX;
        lon_lat[1] = lat + this.DY;
        if(this.isXYChange)
            return [lon_lat[1],lon_lat[0]];
        else
            return lon_lat;
    }

}
if(!CoordConvertFactory[CoordConvertType.GPS]){
    CoordConvertFactory[CoordConvertType.GPS] = GPS;
}
if(!CoordConvertFactory[CoordConvertType.NULL]){
    CoordConvertFactory[CoordConvertType.NULL] = GPS;
}
export default GPS;