/**
 * 涉及七类坐标系之间的坐标互相转换
 * 1）WGS84经纬度，即手机GPS的坐标，等效于CGCJ2000经纬度，天地图采用
 * 2）WGS84墨卡托投影平面，即WGS84经纬度或CGCJ2000经纬度做Web墨卡托投影得到的平面坐标，天地图采用
 * 3）GCJ02经纬度，即国测局火星坐标系，高德地图、腾讯地图、谷歌地图采用
 * 4）GCJ02平面，即GCJ02经纬度做Web墨卡托投影得到的平面坐标，高德地图、腾讯地图、谷歌地图采用
 * 5）百度经纬度，即百度的BD09坐标系，是在GCJ02坐标系上坐标了二次脱密得到，百度地图采用
 * 6）百度平面，即百度经纬度做特殊的投影得到的平面坐标，百度地图采用
 * 7）城市平面，即各个城市或地区所采用的地方独立坐标系
 */
var CoordConvertType = {
	//**********WGS84经纬度转其他**********
	//****WGS84经纬度转城市平面的细分类型****
    /**
     * BJ54城市坐标（7参数）
     */
    SERVEN_BJ54:"7BJ54",
    /**
     *  西安80城市坐标（7参数）
     */
    SERVEN_XA80:"7XA80",
    /**
     * WGS84（7参数）
     */
    SERVEN_WGS84:"7WGS84",
    /**
     * 北京54(4参数)
     */
    FOUR_BJ54:"BJ54",
    /**
     * 西安80(4参数)
     */
    FOUR_XA80:"XA80",
    /**
     * WGS84（4参数）
     */
    FOUR_WGS84:"WGS84",
    /**
     * 移动测量
     */
    YDCL:"YDCL",
    /**
     * GPS
     */
    GPS:"GPS",
    /**
     * 默认的也即GPS方式
     */
    NULL:"NULL",
    /**
     * 经纬度转WEB墨卡托
     */
    MKT:"MKT",
    //**********2018年10月兼容手机端而扩展**********
    BJCG : "BJCG",//北京城管
    HZCG : "HZCG",//杭州城管
    WLMQKFQ : "WLMQKFQ",//乌鲁木齐开发区城管
    FZCG : "FZCG",//福州城管
    CSCG : "CSCG",//长沙城管
    LZCG : "LZCG",//兰州城管
    SYCG : "SYCG",//沈阳城管
    BD : "BD",//百度地图
    GD : "GD",//高德地图

    //****WGS84经纬度转其他类型****
    WGS84LL_TO_WGS84MC:"84ll284mc",//WGS84经纬度转WGS84墨卡托投影平面
    WGS84LL_TO_GCJ02LL:"84ll2gcjll",//WGS84经纬度转GCJ02经纬度
    //WGS84LL_TO_GCJ02MC:"84ll2gcjmc",//WGS84经纬度转GCJ02平面
    WGS84LL_TO_BDLL:"84ll2bdll",//WGS84经纬度转百度经纬度
    //WGS84LL_TO_BDMC:"84ll2bdmc",//WGS84经纬度转百度平面
    WGS84LL_TO_CITY:"84ll2xy",//WGS84经纬度转城市平面

    //**********WGS84-web墨卡托投影平面（天地图平面）到其他**********
	WGS84MC_TO_WGS84LL:"84mc284ll",//WGS84墨卡托投影平面转WGS84经纬度
	//WGS84MC_TO_GCJ02LL:"84mc2gcjll",//WGS84墨卡托投影平面转GCJ02经纬度
	//WGS84MC_TO_GCJ02MC:"84mc2gcjmc",//WGS84墨卡托投影平面转GCJ02平面
	//WGS84MC_TO_BDLL:"84mc2bdll",//WGS84墨卡托投影平面转百度经纬度
	//WGS84MC_TO_BDMC:"84mc2bdmc",//WGS84墨卡托投影平面转百度平面
	//WGS84MC_TO_CITY:"84mc2xy",//WGS84墨卡托投影平面转城市平面

    //**********GCJ02（高德|腾讯|谷歌）经纬度到其他**********
	GCJ02LL_TO_WGS84LL:"gcjll284ll",//GCJ02经纬度转WGS84经纬度
	//GCJ02LL_TO_WGS84MC:"gcjll284mc",//GCJ02经纬度转WGS84墨卡托投影平面
	GCJ02LL_TO_GCJ02MC:"gcjll2gcjmc",//GCJ02经纬度转GCJ02平面
	GCJ02LL_TO_BDLL:"gcjll2bdll",//GCJ02经纬度转百度经纬度
	//GCJ02LL_TO_BDMC:"gcjll2bdmc",//GCJ02经纬度转百度平面
	//GCJ02LL_TO_CITY:"gcjll2xy",//GCJ02经纬度转城市平面

    //**********GCJ02（高德|腾讯|谷歌）平面到其他**********
	//GCJ02MC_TO_WGS84LL:"gcjmc284ll",//GCJ02平面转WGS84经纬度
	//GCJ02MC_TO_WGS84MC:"gcjmc284mc",//GCJ02平面转WGS84墨卡托投影平面
	GCJ02MC_TO_GCJ02LL:"gcjmc2gcjll",//GCJ02平面转GCJ02经纬度
	//GCJ02MC_TO_BDLL:"gcjmc2bdll",//GCJ02平面转百度经纬度
	//GCJ02MC_TO_BDMC:"gcjmc2bdmc",//GCJ02平面转百度平面
	//GCJ02MC_TO_CITY:"gcjmc2xy",//GCJ02平面转城市平面

    //**********百度经纬度到其他**********
    BDLL_TO_WGS84LL:"bdll284ll",//百度经纬度转WGS84经纬度
	//BDLL_TO_WGS84MC:"bdll284mc",//百度经纬度转WGS84墨卡托投影平面
	BDLL_TO_GCJ02LL:"bdll2gcjll",//百度经纬度转GCJ02经纬度
	//BDLL_TO_GCJ02MC:"bdll2gcjmc",//百度经纬度转GCJ02平面
    BDLL_TO_BDMC:"bdll2bdmc",//百度经纬度转百度平面
	//BDLL_TO_CITY:"bdll2xy",//百度经纬度转城市平面

    //**********百度平面到其他**********
	//BDMC_TO_WGS84LL:"bdmc284ll",//百度平面转WGS84经纬度
	//BDMC_TO_WGS84MC:"bdmc284mc",//百度平面转WGS84墨卡托投影平面
	//BDMC_TO_GCJ02LL:"bdmc2gcjll",//百度平面转GCJ02经纬度
	//BDMC_TO_GCJ02MC:"bdmc2gcjmc",//百度平面转GCJ02平面
    BDMC_TO_BDLL:"bdmc2bdll",//百度平面转百度经纬度
	//BDMC_TO_CITY:"bdmc2xy",//百度平面转城市平面

    //**********城市（当地）平面到其他**********
    CITY_TO_WGS84LL:"xy284ll",//城市平面转WGS84经纬度
	//CITY_TO_WGS84MC:"xy284mc",//城市平面转WGS84墨卡托投影平面
	//CITY_TO_GCJ02LL:"xy2gcjll",//城市平面转GCJ02经纬度
	//CITY_TO_GCJ02MC:"xy2gcjmc",//城市平面转GCJ02平面
    //CITY_TO_BDLL:"xy2bdll",//城市平面转百度经纬度
    //CITY_TO_BDMC:"xy2bdmc",//城市平面转百度平面
    /**
	 * 北京城管转84经纬度
     */
    BJCG_TO_WGS84LL : "BJCG2WGS84",

	//**********其他**********
	/**
	 * 6参数转换
	 */
	SIX_PARAMS:"6parms"
}
export default CoordConvertType;