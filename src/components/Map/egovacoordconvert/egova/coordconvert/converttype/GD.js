import Base from './Base';
import CoordConvertFactory from '../CoordConvertFactory';
import CoordConvertType from '../CoordConvertType';
import MKT from './MKT';

class GD extends Base{
    constructor(params){
        super(params);
        this.x_PI=3.14159265358979324 * 3000.0 / 180.0;
        this.PI=3.1415926535897932384626;
        this.a=6378245.0;
        this.ee=0.00669342162296594323;
        this.DX=0;
        this.DY=0;
        this.isXYChange=false;
        this.isMercator=true;
        this.mktObj=new MKT("");
        if (this.params) {
            var pams = this.params.split("#");
            this.DX = parseFloat(pams[0].trim());
            this.DY = parseFloat(pams[1].trim());
            if (pams.length >= 3) {
                if(pams[2].trim()=="1")
                    this.isXYChange = true;
            }
            if (pams.length >= 4) {
                if(pams[3].trim()=="1"){
                    this.isMercator = true;
                }
                else if(pams[3].trim()=="0"){
                    this.isMercator = false;
                }
            }
        }
    }

    /**
     * 将WGS84经纬度坐标转换为百度经纬度或百度平面
     * @param lon 将WGS84经度
     * @param lat 将WGS84纬度
     * @returns {*[]}
     */
    convert(lon, lat){
        var latLng = this.wgs84ll2gcj02ll(lon, lat);
        var xy = latLng;
        if(this.isMercator){
            xy= this.mktObj.convert(latLng[0], latLng[1]);
        }

        xy[0] = xy[0] + this.DX;
        xy[1] = xy[1] + this.DY;

        if(!this.isXYChange){
            return xy;
        }else{
            return [xy[1],xy[0]];
        }
    }

    /**
     * WGS84转GCj02经纬度
     * @param longitude
     * @param latitude
     * @returns {*[]}
     */
    wgs84ll2gcj02ll(longitude, latitude) {
        var lat = +latitude;
        var lng = +longitude;
        if (this.out_of_china(lng, lat)) {
            return [lng, lat]
        } else {
            var dlat = this.transformlat(lng - 105.0, lat - 35.0);
            var dlng = this.transformlng(lng - 105.0, lat - 35.0);
            var radlat = lat / 180.0 * this.PI;
            var magic = Math.sin(radlat);
            magic = 1 - this.ee * magic * magic;
            var sqrtmagic = Math.sqrt(magic);
            dlat = (dlat * 180.0) / ((this.a * (1 - this.ee)) / (magic * sqrtmagic) * this.PI);
            dlng = (dlng * 180.0) / (this.a / sqrtmagic * Math.cos(radlat) * this.PI);
            var mglat = lat + dlat;
            var mglng = lng + dlng;
            return [mglng, mglat];
        }
    }

    wgs84ll2bdll(longitude, latitude){
        if (this.out_of_china(longitude, latitude)) {
            return [longitude, latitude]
        } else{
            var gcj = this.wgs84ll2gcj02ll(longitude,latitude);
            var bdll = this.gcj02ll2bdll(gcj[0], gcj[1]);
            return bdll;
        }
    }

    /**
     * 火星坐标系 (GCJ-02)经纬度 转百度坐标系 (BD-09) 经纬度
     * 即谷歌、高德 转 百度
     * @param longitude
     * @param latitude
     * @returns {*[]}
     */
    gcj02ll2bdll(longitude,latitude) {
        var lat = +latitude;
        var lng = +longitude;
        var z = Math.sqrt(lng * lng + lat * lat) + 0.00002 * Math.sin(lat * this.x_PI);
        var theta = Math.atan2(lat, lng) + 0.000003 * Math.cos(lng * this.x_PI);
        var bd_lng = z * Math.cos(theta) + 0.0065;
        var bd_lat = z * Math.sin(theta) + 0.006;
        return [bd_lng, bd_lat];
    }

    /**
     * 火星坐标系 (GCJ-02)经纬度 转wgs84经纬度
     * 即谷歌、高德 转 wgs84
     * @param longitude
     * @param latitude
     * @returns {*[]}
     */
    gcj02ll2wgs84ll(longitude, latitude){
        if (this.out_of_china(longitude,latitude)){
            return [longitude, latitude];
        }
        var d = this.delta(latitude, longitude);
        return [longitude-d[1], latitude-d[0]];
    }

    /**
     * 判断是否在国内，不在国内则不做偏移
     * @param longitude
     * @param latitude
     * @returns {boolean}
     */
    out_of_china(longitude, latitude) {
        // 纬度3.86~53.55,经度73.66~135.05
        var result= !(longitude > 73.66 && longitude < 135.05 && latitude > 3.86 && latitude < 53.55);
        return result;
    }

    transformlat(longitude, latitude) {
        var lat = +latitude;
        var lng = +longitude;
        var ret = -100.0 + 2.0 * lng + 3.0 * lat + 0.2 * lat * lat + 0.1 * lng * lat + 0.2 * Math.sqrt(Math.abs(lng));
        ret += (20.0 * Math.sin(6.0 * lng * this.PI) + 20.0 * Math.sin(2.0 * lng * this.PI)) * 2.0 / 3.0;
        ret += (20.0 * Math.sin(lat * this.PI) + 40.0 * Math.sin(lat / 3.0 * this.PI)) * 2.0 / 3.0;
        ret += (160.0 * Math.sin(lat / 12.0 * this.PI) + 320 * Math.sin(lat * this.PI / 30.0)) * 2.0 / 3.0;
        return ret;
    }

    transformlng(longitude, latitude) {
        var lat = +latitude;
        var lng = +longitude;
        var ret = 300.0 + lng + 2.0 * lat + 0.1 * lng * lng + 0.1 * lng * lat + 0.1 * Math.sqrt(Math.abs(lng));
        ret += (20.0 * Math.sin(6.0 * lng * this.PI) + 20.0 * Math.sin(2.0 * lng * this.PI)) * 2.0 / 3.0;
        ret += (20.0 * Math.sin(lng * this.PI) + 40.0 * Math.sin(lng / 3.0 * this.PI)) * 2.0 / 3.0;
        ret += (150.0 * Math.sin(lng / 12.0 * this.PI) + 300.0 * Math.sin(lng / 30.0 * this.PI)) * 2.0 / 3.0;
        return ret;
    }

    delta(lat, lon){
        var a = 6378245.0;
        var ee = 0.00669342162296594323;
        var dLat = this.transformlat(lon - 105.0, lat - 35.0);
        var dLon = this.transformlng(lon - 105.0, lat - 35.0);
        var radLat = lat / 180.0 * this.PI;
        var magic = Math.sin(radLat);
        magic = 1 - ee * magic * magic;
        var sqrtMagic = Math.sqrt(magic);
        dLat = (dLat * 180.0) / ((a * (1 - ee)) / (magic * sqrtMagic) * this.PI);
        dLon = (dLon * 180.0) / (a / sqrtMagic * Math.cos(radLat) * this.PI);
        return [dLat, dLon];
    }

    /**
     * 百度经纬度到gcj02经纬度
     * @param longitude
     * @param latitude
     * @returns {*[]}
     */
    bdll2gcjll(lat, lon) {
    var x = lon - 0.0065, y = lat - 0.006;
    var z = Math.sqrt(x * x + y * y) - 0.00002 * Math.sin(y * this.x_PI);
    var theta = Math.atan2(y, x) - 0.000003 * Math.cos(x * this.x_PI);
    var gg_lon = z * Math.cos(theta);
    var gg_lat = z * Math.sin(theta);
    return [gg_lon, gg_lat];
    }

    /**
     * 百度经纬度到wgs84经纬度
     * @param longitude
     * @param latitude
     * @returns {*[]}
     */
    bdll2wgs84ll(lon, lat) {
        var gcj02ll = this.bdll2gcjll(lat,lon);
        var wgs84ll = this.gcj02ll2wgs84ll(gcj02ll[0], gcj02ll[1]);
        return wgs84ll;
    }

    /**
     * 经纬度到墨卡托平面
     * @param longitude
     * @param latitude
     * @returns {*[]}
     */
    latLon2Mercator(lat, lon) {
    var x = lon * 20037508.34 / 180;
    var y = Math.log(Math.tan((90 + lat) * this.PI / 360))
        / (this.PI / 180);
    y = y * 20037508.34 / 180;

    return [x,y];
    }

    /**
     * 墨卡托平面到经纬度
     * @param x
     * @param y
     * @returns {*[]}
     */
    mercator2LatLon(x,  y) {
    var lon = x / 20037508.34 * 180;
    var lat = y / 20037508.34 * 180;
    lat = 180 / this.PI
        * (2 * Math.atan(Math.exp(lat * Math.PI / 180)) - Math.PI / 2);

    return [lon,lat];
    }
}
if(!CoordConvertFactory[CoordConvertType.GD]){
    CoordConvertFactory[CoordConvertType.GD] = GD;
}
export default GD;