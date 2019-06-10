export {default as ConvertType} from './CoordConvertType';
import CoordConvertFactory from './CoordConvertFactory';
import './converttype/7BJ54';
import './converttype/7XA80';
import './converttype/7WGS84';
import './converttype/BJ54';
import './converttype/XA80';
import './converttype/WGS84';
import './converttype/YDCL';
import './converttype/GPS';
import './converttype/MKT';
import './converttype/GD';
import './converttype/BD';
import './converttype/BJCG';
import './converttype/HZCG';
import './converttype/WLMQKFQ';
import './converttype/FZCG';
import './converttype/CSCG';
import './converttype/LZCG';
import './converttype/SYCG';
//
import './converttype/WGS84LL2WGS84MC';
import './converttype/WGS84LL2GCJ02LL';
//import './converttype/WGS84LL2GCJ02MC';
import './converttype/WGS84LL2BDLL';
//import './converttype/WGS84LL2BDMC';
import './converttype/WGS84LL2CITY';

import './converttype/WGS84MC2WGS84LL';
//import './converttype/WGS84MC2GCJ02LL';
//import './converttype/WGS84MC2GCJ02MC';
//import './converttype/WGS84MC2BDLL';
//import './converttype/WGS84MC2BDMC';
//import './converttype/WGS84MC2CITY';

import './converttype/GCJ02LL2WGS84LL';
//import './converttype/GCJ02LL2WGS84MC';
import './converttype/GCJ02LL2GCJ02MC';
import './converttype/GCJ02LL2BDLL';
//import './converttype/GCJ02LL2BDMC';
//import './converttype/GCJ02LL2CITY';

//import './converttype/GCJ02MC2WGS84LL';
//import './converttype/GCJ02MC2WGS84MC';
import './converttype/GCJ02MC2GCJ02LL';
//import './converttype/GCJ02MC2BDLL';
//import './converttype/GCJ02MC2BDMC';
//import './converttype/GCJ02MC2CITY';

import './converttype/BDLL2WGS84LL';
//import './converttype/BDLL2WGS84MC';
import './converttype/BDLL2GCJ02LL';
//import './converttype/BDLL2GCJ02MC';
import './converttype/BDLL2BDMC';
//import './converttype/BDLL2CITY';

//import './converttype/BDMC2WGS84LL';
//import './converttype/BDMC2WGS84MC';
//import './converttype/BDMC2GCJ02LL';
//import './converttype/BDMC2GCJ02MC';
import './converttype/BDMC2BDLL';
//import './converttype/BDMC2CITY';

import './converttype/CITY2WGS84LL';
//import './converttype/CITY2WGS84MC';
//import './converttype/CITY2GCJ02LL';
//import './converttype/CITY2GCJ02MC';
//import './converttype/CITY2BDLL';
//import './converttype/CITY2BDMC';

import './converttype/BJCG2WGS84LL';
import './converttype/6PARAMS';

import MutilStep from './converttype/MutilStep';

/**
 *不转换："-1"或其他值
 *四参数转换：wgsll2beijing54fourparam(wgs84转北京54)||wgsll2xian80fourparam(wgs84转西安80)
 *四参数逆转: xian80towgsllfourparam(西安80转wgs84)||beijing54towgsllfourparam(北京54转wgs84)
 *百度米制与经纬度: bdll2bdmc(百度经纬度转百度米制)||bdmc2bdll(百度米制转百度经纬度)
 *国测局与与百度: bd09togcj02(百度坐标系 (BD-09)转火星坐标系 (GCJ-02))||gcj02tobd09(火星坐标系 (GCJ-02) 转百度坐标系 (BD-09)，包括谷歌、高德转百度)
 *国测局与wgs84: wgs84togcj02(WGS84转GCj02)||gcj02towgs84(GCJ02转换为WGS84)
 *墨卡托投影与wgs84: mkt2wgs84ll(墨卡托投影(谷歌、高德)转WGS84)||wgs84ll2mkt(WGS84转墨卡托投影(谷歌、高德))
 *六参数转换: 
 *七参数转换: 
**/
var list = {
    "84ll2bdmc":[{param:false,type:'84ll2bdll'}, {param:false,type:'bdll2bdmc'}],
    "84ll2gcjmc":[{param:false,type:'84ll2gcjll'}, {param:false,type:'gcjll2gcjmc'}],
	"84mc2gcjll":[{param:false,type:'84mc284ll'}, {param:false,type:'84ll2gcjll'}],
	"84mc2gcjmc":[{param:false,type:'84mc284ll'}, {param:false,type:'84ll2gcjll'}, {param:false,type:'gcjll2gcjmc'}],
	"84mc2bdll":[{param:false,type:'84mc284ll'}, {param:false,type:'84ll2bdll'}],
	"84mc2bdmc":[{param:false,type:'84mc284ll'}, {param:false,type:'84ll2bdll'}, {param:false,type:'bdll2bdmc'}],
    "84mc2xy":[{param:false,type:'84mc284ll'}, {param:true,type:'84ll2xy'}],
	"gcjll284mc":[{param:false,type:'gcjll284ll'}, {param:false,type:'84ll284mc'}],
	"gcjll2bdmc":[{param:false,type:'gcjll2bdll'}, {param:false,type:'bdll2bdmc'}],
	"gcjll2xy":[{param:false,type:'gcjll284ll'}, {param:true,type:'84ll2xy'}],
	"gcjmc284ll":[{param:false,type:'gcjmc2gcjll'}, {param:false,type:'gcjll284ll'}],
    "gcjmc284mc":[{param:false,type:'gcjmc2gcjll'}, {param:false,type:'gcjll284ll'}, {param:false,type:'84ll284mc'}],
    "gcjmc2bdll":[{param:false,type:'gcjmc2gcjll'}, {param:false,type:'gcjll2bdll'}],
    "gcjmc2bdmc":[{param:false,type:'gcjmc2gcjll'}, {param:false,type:'gcjll2bdll'}, {param:false,type:'bdll2bdmc'}],
    "gcjmc2xy":[{param:false,type:'gcjmc2gcjll'}, {param:false,type:'gcjll284ll'}, {param:true,type:'84ll2xy'}],
	"bdll284mc":[{param:false,type:'bdll284ll'}, {param:false,type:'84ll284mc'}],
	"bdll2gcjmc":[{param:false,type:'bdll2gcjll'}, {param:false,type:'gcjll2gcjmc'}],
	"bdll2xy":[{param:false,type:'bdll284ll'}, {param:true,type:'84ll2xy'}],
	"bdmc284ll":[{param:false,type:'bdmc2bdll'}, {param:false,type:'bdll284ll'}],
    "bdmc284mc":[{param:false,type:'bdmc2bdll'}, {param:false,type:'bdll284ll'}, {param:false,type:'84ll284mc'}],
    "bdmc2gcjll":[{param:false,type:'bdmc2bdll'}, {param:false,type:'bdll2gcjll'}],
    "bdmc2gcjmc":[{param:false,type:'bdmc2bdll'}, {param:false,type:'bdll2gcjll'}, {param:false,type:'gcjll2gcjmc'}],
    "bdmc2xy":[{param:false,type:'bdmc2bdll'}, {param:false,type:'bdll284ll'}, {param:true,type:'84ll2xy'}],
	"xy284mc":[{param:true,type:'xy284ll'},{param:false,type:'84ll284mc'}],
	"xy2gcjll":[{param:true,type:'xy284ll'},{param:false,type:'84ll2gcjll'}],
	"xy2gcjmc":[{param:true,type:'xy284ll'},{param:false,type:'84ll2gcjll'},{param:false,type:'gcjll2gcjmc'}],
	"xy2bdll":[{param:true,type:'xy284ll'},{param:false,type:'84ll2bdll'}],
	"xy2bdmc":[{param:true,type:'xy284ll'},{param:false,type:'84ll2bdll'},{param:false,type:'bdll2bdmc'}]
}
export function getConvertFactory(type,params){
    var factory = null;
    if(CoordConvertFactory[type]){
        factory = new CoordConvertFactory[type](params);
    }else if(list[type]){
        arguments[0]=list[type];
        factory={};
        factory.__proto__=MutilStep.prototype;
        factory.constructor.apply(factory,arguments);
    }
    return factory;
}