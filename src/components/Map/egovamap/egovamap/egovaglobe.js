
var scene = null;

function getCookie(name){ 
	var strCookie = window.document.cookie; 
	var arrCookie = strCookie.split("; "); 
	for(var i=0; i<arrCookie.length; i++){ 
		var arr = arrCookie[i].split("="); 
		if(arr[0]==name) return arr[1]; 
	}
	return null;
};
function setCookie(name,value){
	window.document.cookie = name+"="+value;
}

function checkGlobeServerURL(url,callback){
	var cookieUrl = getCookie("globeGisUrl");
	var gisProxyList = url.split(";");
	cookieUrl&&gisProxyList.push(cookieUrl);
	if(gisProxyList.length<=1){
		setCookie("globeGisUrl",url);
		callback(url);
		return ;
	}
	var params = {isLoad:false};
	for(var i in gisProxyList){
		checkGlobeProxy(gisProxyList[i],params,callback);
	}
}

function checkGlobeProxy(proxyUrl,params,callback) {
	var img = new Image();
	if(proxyUrl.indexOf("http")!=0){
		proxyUrl = window.location.origin+"/"+proxyUrl;
	}
	img.src = proxyUrl + '/symbol/default.png';
	img.onload = function (e1) {
		if(!params.isLoad){
			params.isLoad = true;
			setCookie("globeGisUrl",proxyUrl);
			callback(proxyUrl);
		}
		img = null;
	};
}



//初始化获取三维地图相关的配置参数，从三维服务端获取
function initGlobeParams(context,callback) {
	context.globeParams = context.globeParams || {};
	//是否开启三维源代码调试，发布系统不得开启此开关
	context.globeParams.debug = false;
	//三维地图被禁用了，不再初始化三维地图
	if (context.globeParams.disable) {
		return;
	}
	context.globeParams.humanID = context.humanID;
	context.globeParams.globeEnabled = context.globeEnabled;
	context.globeParams.globeServerURL = context.globeServerURL;
	if (callback) {
		callback();
	}
}

var EGovaGlobeMap = function ($container, pScene, prefix, mapConfig,context,callback) {
	var that = this;
	var parent = {};
	scene = pScene;
	var parentScene = pScene.pageId || "parentScene";
	var msgPrefix = prefix || "globemappage";
	var config = parent.config || '';
	var humanID = parent.humanID || '';
	var prefix = 'msgPrefix=' + msgPrefix + '&parentScene=' + parentScene;
	that.globeVisible = false;
	that.globeLoaded = false;
	that.isLoading = false;

	that.mapConfig = mapConfig;
	that.$globeMapFrame = null;
	that.globeMapContainer = null;
	that.mapContainer = null;

	that.globeMapContainer = $container.getElementsByClassName("globemap-container")[0];
	if (!that.globeMapContainer) {
		var globeMapHTML = '<iframe class="globemap-iframe" webkitAllowFullScreen="true" mozallowfullscreen="true"  allowFullScreen="true"></iframe>';
		var element = document.createElement("div");
		element.classList.add("globemap-container");
		element.innerHTML = globeMapHTML;
		 $container.append(element);
		 that.globeMapContainer = element;
	}
	that.$globeMapFrame = that.globeMapContainer.getElementsByClassName("globemap-iframe")[0];
	that.mapContainer = $container.getElementsByClassName("emap-container")[0];
	that.init = function () {

		var loadingGlobe=function(serverURL,callback){
		//判断是否采用了延迟加载，如果没有采用，就在初始化时加载地图
		if (!context.globeParams.lazyloading) {
			if (!that.globeLoaded && !that.isLoading) {
					var globeParams=context.globeParams;
					var globeConfig = {
					 humanID: globeParams.humanID,
					 globeEnabled: globeParams.globeEnabled,
					 globeServerURL: globeParams.globeServerURL
					 };
					that.globeConfig=globeConfig;
					globeConfig.globeServerURL = serverURL || globeConfig.globeServerURL;
					globeParams.globeServerURL = globeConfig.globeServerURL; //服务地址写回全局配置，其他地方可能会用到
					var proxyURL = serverURL + '/home/gis/proxy.htm';
					that.isLoading = true;
					var globeMapUrl = context.rootPath +context.assetsPath+ "/globe.html?" + prefix + '&serverURL=' + globeConfig.globeServerURL +
						"&proxyURL=" + proxyURL + "&humanID=" + globeConfig.humanID;
					  if (context.globeParams.debug) {
						globeMapUrl += '&debug=true';
					  }
					if (mapConfig != undefined && mapConfig.mapconfig3D != undefined) {
						for (var item in mapConfig.mapconfig3D) {
							globeMapUrl += "&" + item + "=" + mapConfig.mapconfig3D[item];
						}
					}
					that.$globeMapFrame.src = globeMapUrl;
			}
		}
		  callback&&callback();
		}
		context.globeCallBack=callback;
		checkGlobeServerURL(context.gisServerURL, function(serverURL) {
			context.globeServerURL = serverURL;
			initGlobeParams(context,function(){
				loadingGlobe(context.globeServerURL,context.globeCallBack)
			});
		});

		//初始化时不显示地图
		that.closeGlobe();
		//YSP：这句代码需要加上，否则导致第一次二三维切换，位置不同步
		that.globeMapContainer.style.display = 'none';
		// 三维加载完毕后
		that.bindEvent("globeLoadedCallback", that.onGlobeLoaded);

	}


	/* 绑定事件 */
	that.bindEvent = function (msgId, msgHandler, stopOnTop) {
		if (scene == null)
			return;
		scene.on(msgPrefix + ":" + msgId, msgHandler, parentScene, stopOnTop);
	}
	/* 触发事件 */
	that.fireEvent = function (msgId, msgData, stopOnTop) {
		if (scene == null)
			return;
		scene.fire(msgPrefix + ":" + msgId, msgData, parentScene, stopOnTop);
	}
	/* 移除监听 */
	that.removeEventBind = function (msgId, stopOnTop) {
		if (scene == null)
			return;
		scene.remove(msgPrefix + ":" + msgId, parentScene, stopOnTop);
	}

	that.dispatchSceneEvent = function (msgId, msgData) {
		if (scene == null)
			return;
		scene.fire(msgPrefix + ":" + msgId, {args: msgData}, parentScene, false);
	}

	that.onGlobeLoaded = function () {
		that.isLoading = false;
		that.globeLoaded = true;
		//设置工具条的样式和位置
		//that.fireEvent("setToolBarStyle", {args:["left", "H", true, {top:'70px',left:'20px'}]});
	}

	/** *****************************三维地图API************************ */

	/**
	 * 三维窗口关闭
	 */
	that.closeGlobe = function (evt) {
		that.globeMapContainer.style.display = 'block';
		that.globeMapContainer.style.height = '0';
		that.globeVisible = false;
	}

	/**
	 * 三维显示
	 *
	 * @param res
	 */
	that.openGlobe = function (evt) {
		if (!that.globeVisible) { // 初次定位时调整布局
			if (!that.globeLoaded && !that.isLoading) {
				var loadingGlobe = function (serverURL) {
					that.globeConfig=that.globeConfig||{};
					that.globeConfig.globeServerURL = serverURL || that.globeConfig.globeServerURL;
					that.globeParams=that.globeParams||{};
					that.globeParams.globeServerURL = that.globeConfig.globeServerURL; //服务地址写回全局配置，其他地方可能会用到
					var proxyURL = serverURL + '/home/gis/proxy.htm';
					that.isLoading = true;
					var globeMapUrl = context.rootPath +context.assetsPath + "/globe.html?" + prefix + '&serverURL=' + that.globeConfig.globeServerURL +
						"&proxyURL=" + proxyURL + "&humanID=" + that.globeConfig.humanID;
				   if(context.globeParams.debug) {
						globeMapUrl += '&debug=true';
					}
				if (mapConfig != undefined && mapConfig.mapconfig3D != undefined) {
						for (var item in mapConfig.mapconfig3D) {
							globeMapUrl += "&" + item + "=" + mapConfig.mapconfig3D[item];
						}
					}
					that.$globeMapFrame.src=globeMapUrl;
				}
				checkGlobeServerURL(context.gisServerURL, function(serverURL) {
					context.globeServerURL = serverURL;
					if(context.globeParams!=undefined)
					loadingGlobe(context.globeServerURL)
					else
					initGlobeParams(context,function(){
						loadingGlobe(context.globeServerURL)
					});
				});
			}

			that.globeMapContainer.style.height = '100%';
			that.globeMapContainer.style.display = 'none';
		  /*  $(that.globeMapContainer).fadeIn(500, function () {
				that.globeMapContainer.style.display = 'block';
			});*/
			that.globeVisible = true;
		}
	}

	/* 飞到全球位置视图 */
	that.flyToFullGlobe = function (duration) {
		if (scene == null)
			return;

		scene.fire((msgPrefix + ":flyToFullGlobe"), {args: [duration]}, parentScene, false);
	}

	/* 获取地图的当前范围 */
	that.getMapExtent = function (callback) {
		if (scene == null)
			return;

		// 移除监听
		scene.remove(msgPrefix + ":getMapExtentCallback", parentScene, false);

		scene.on(msgPrefix + ":getMapExtentCallback", function (evt) {
			// 移除监听
			scene.remove(msgPrefix + ":getMapExtentCallback", parentScene, false);
			callback(evt.args);
		}, parentScene, false);
		scene.fire((msgPrefix + ":getMapExtent"), {args: []}, parentScene, false);
	}

	/* 缩放到指定范围 */
	that.zoomToExtent = function (minX, minY, maxX, maxY, duration, rotate) {
		if (scene == null)
			return;
		duration = Number(duration);
		rotate = Boolean(rotate);
		that.fireEvent("zoomToExtent", {args: [Number(minX), Number(minY), Number(maxX), Number(maxY), duration, rotate]}, false);
	}
	
	that.addGlobeHeatMap=function(data){
		 if (scene == null)
			return;
		that.fireEvent("addHeatMap", {args: [data]}, false);
	}

	/* 缩放到指定中心点和级别 */
	that.centerAndZoom = function(x, y, height) {
		if (scene == null)
			return;
		that.fireEvent("centerAndZoom", {args: [x, y, height]}, false);
	}

	//三维场景按照中心点旋转，更方便查看
	that.rotateScene = function (heading, pitch, roll, duration, callback) {
		if (scene == null)
			return;
		that.fireEvent("rotateScene", {args: [heading, pitch, roll, duration, callback]}, false);
	}

	/* 清除指定图形 */
	that.clearGraphic = function (id) {
		if (scene == null)
			return;
		if (typeof id != "string") {
			id = id.join(",");
		}
		scene.fire((msgPrefix + ":clearGraphic"), {args: [id]}, parentScene, false);
	}

	/* 清除全部图形 */
	that.clearAllGraphics = function (id) {
		if (scene == null)
			return;
		scene.fire((msgPrefix + ":clearAllGraphics"), {args: []}, parentScene, false);
	}
	/*清除指定图层*/
	that.clearGraphicLayerByID=function(id){
		if(scene==null)
		return;
		if (typeof id != "string") {
			id = id.join(",");
		}
		scene.fire((msgPrefix + ":clearGraphicLayerByID"), {args: [id]}, parentScene, false);
	}
	/**
	 * 显示案件分布
	 */
	that.showRecListDistribution=function(jsonInfo, zoom,clickCallback, labelInfo){
		if (scene == null)
			return;
		that.removeEventBind("showRecListDistributionCallback");
		if (clickCallback != undefined) {
			that.bindEvent("showRecListDistributionCallback", function (evt) {
				clickCallback(evt.args);
			});
		}
		if(that.globeLoaded)
		scene.fire((msgPrefix + ":showRecListDistribution"), {args:[jsonInfo, zoom, labelInfo]}, parentScene, false);
	}
	
	that.showPatrolCurrentPosition=function(jsonInfo, zoom, clear, highLightType){
		   if (scene == null)
			return;
		that.fireEvent("showPatrolCurrentPosition", {args: [jsonInfo, zoom, clear, highLightType]}, false);
	}
	/* 显示多个自定义图标 */
	that.showMultiObjectCurrentPosition = function (jsonInfo, zoom, bClear, hStyleID, clickCallback) {
		if (scene == null)
			return;
		// 移除监听
		that.removeEventBind("showMultiObjectCurrentPositionClick");
		var args = Array.prototype.slice.call(arguments);
		if (arguments[arguments.length - 1] instanceof Function) {
			clickCallback = arguments[arguments.length - 1];
			args = args.slice(0, args.length - 1);
		}
			if (clickCallback != undefined) {
				that.bindEvent("showMultiObjectCurrentPositionClick", function (evt) {
					clickCallback(evt.args);
				});
			}
			scene.fire((msgPrefix + ":showMultiObjectCurrentPosition"), {args: args}, parentScene, false);
		}

	/* 显示车辆人员轨迹 */
	that.showObjectTrace = function (objectID, symbolType, dateTime, queryCondition, hideControlPanel, symbolPic, optimizeParams, infoCallback, updatePositionCallback, closeCallback, traceDigCallback) {
		if (scene == null)
			return;
		// 人员轨迹查询依赖GIS服务端
		if (context.gisServerURL) {
			var options = {};
			var serviceUrl = context.gisServerURL + '/home/gis/patrol/getobjecttrace.htm';
			options.traceService = serviceUrl;
			options.dateTime = dateTime;
			options.queryCondition = queryCondition;
			options.hideControlPanel = hideControlPanel;
			options.symbolPic = symbolPic;
			options.optimizeParams = optimizeParams;
			options.infoCallback = infoCallback;
			options.updatePositionCallback = updatePositionCallback;
			options.closeCallback = closeCallback;
			options.traceDigCallback = traceDigCallback;
			scene.fire(msgPrefix + ":showObjectTrace", {
				args: [objectID, symbolType, options]
			}, parentScene);
		} else {
			console.error("没有配置二维GIS服务端地址");
		}
	}

	that.limitGlobeRange = function (extent) {
		if (scene == null)
			return;
		scene.fire((msgPrefix + ":limitGlobeRange"), {args: [extent]}, parentScene, false);
	}

	/**
	 *添加三维柱状图
	{
		"title": "自来水公司同期产水量对比",
		"type": "bar",
		"radius": 25,
		"key": ["本月","本年累计","去年同期"],
		"color": ["#FF0000","#00FF00","#0000FF",
		"alpha": 0.9,
		"unit": ["万吨","万吨","万吨","万吨"],
		"data": [{
			"name": "第一水源地",
			"value": [33,154,198],
			"coordinates": [116.775799484,40.2070606933]
		}, {
			"name": "第二水源地",
			"value": [190,1091,859],
			"coordinates": [116.679547243,40.1891989471]
		}
	}
	 **/
	that.addChart = function(options) {
		if (scene == null)
			return;
		scene.fire((msgPrefix + ":addChart"), {args: [options]}, parentScene, false);
	}
	/**
	 * 鼠标点击模型查询
	 * @param callback
	 */
   that.queryModelInfo=function(callback){
	   if (scene == null)
		   return;
	   scene.fire((msgPrefix + ":queryModelClick"), {args: [callback]}, parentScene, false);
   }
	/**
	 * 删除三维柱状图
	 */
	that.removeChart = function() {
		if (scene == null)
			return;
		scene.fire((msgPrefix + ":removeChart"), {args: []}, parentScene, false);
	}
	
	that.flyToPoint=function(x,y,height){
		if (scene == null)
		return;
		scene.fire((msgPrefix + ":flyToPoint"), {args: [x,y,height]}, parentScene, false);
	}
	
	that.goUnderGround=function(height){
		if(scene == null)
		return;
		scene.fire((msgPrefix + ":goUnderGround"), {args: [height]}, parentScene, false);
	}

	/* 显示视频闪烁点*/
	that.addVideoAlarm = function (coordX, coorY, successFunc, hitCallback) {
		if (scene == null)
			return;
		scene.fire(msgPrefix + ":addVideoAlarm", {args: [coordX, coorY, successFunc, hitCallback]}, parentScene);
	}

	/* 显示面板信息*/
	that.createPanelInfo = function (entity, successFunc) {
		if (scene == null)
			return;
		scene.fire(msgPrefix + ":createPanelInfo", {args: [entity, successFunc]}, parentScene);
	}

	/* 显示面板信息*/
	that.createAnimateCar = function (objectID, successFunc) {
		if (scene == null)
			return;
		scene.fire(msgPrefix + ":createAnimateCar", {args: [ objectID, successFunc]}, parentScene);
	}

	/*根据id号删除一个视频闪烁点*/
	that.removeVideoAlarm = function (id) {
		if (scene == null)
			return;
		scene.fire(msgPrefix + ":removeVideoAlarm", {args: [id]}, parentScene);
	}
	/*地图上标注返回坐标值*/
	that.pointSelect=function(symbolType, mapZoom2Point,clickCallback){
		if (scene == null)
			return;
		that.removeEventBind("pointSelectCallback");
		if (clickCallback != undefined) {
			that.bindEvent("pointSelectCallback", function (position) {
				var resultPosition=[position.args[0].longitude+','+position.args[0].latitude];
					clickCallback(resultPosition);
			});
		}
			scene.fire((msgPrefix + ":pointSelect"), {args:[symbolType, mapZoom2Point]}, parentScene, false);
	}

	/*根据要素坐标定位显示要素*/
	that.locateFeatureByCoords=function(geometries, type, ID, style, hStyle,zoom,keyFiled,labelField,labelStyle,randomColor,renderCanvas,singleSelected,options){
		if (scene == null)
			return;
		scene.fire((msgPrefix + ":locateFeatureByCoords"), { args : [geometries, type, ID, style, hStyle, zoom,keyFiled,labelField,labelStyle,randomColor,renderCanvas,singleSelected,options] }, parentScene, false);
	}
   /*绘制图形*/
	that.drawGraphic = function(graphic, zoom, clickCallback) {
		if (scene == null)
			return;
		if (graphic.geometry instanceof Array) {
			graphic.type=graphic.type||graphic.geometry[0].type;
			scene.fire(msgPrefix + ":locateFeatureByCoords", { args : [ graphic.geometry, graphic.type, graphic.id, graphic.style,
				graphic.hstyle, zoom,graphic.keyField,graphic.labelField,graphic.labelStyle,graphic.colorNumber] }, parentScene);
		} else {
			graphic.type=graphic.type||graphic.geometry.type;
			scene.fire(msgPrefix + ":locateFeatureByCoords", { args : [ [ graphic.geometry ], graphic.type, graphic.id, graphic.style,
				graphic.hstyle, zoom ] }, parentScene);
		}
		that.removeEventBind("locateFeatureByIDsCallback");
		if (clickCallback != undefined) {
			that.bindEvent("locateFeatureByIDsCallback", function(evt) {
				clickCallback(evt.args);
			});
		}
	}
	/*连续标注三维地图获取xy坐标*/
	that.markMapXY=function(event,Callback){
		if (scene == null)
			return;
		scene.fire((msgPrefix + ":markMapXY"), { args : [event,Callback] }, parentScene, false);
	}
	/*清除标注事件*/
	that.removeMarkMapMouseHandler=function(){
		if (scene == null)
			return;
		scene.fire((msgPrefix + ":removeMarkMapMouseHandler"), { args : [] }, parentScene, false);
	}

	/**
	 * 绘制图形接口
	 * type 类型 point,polyline,polygon,circle
	 * style 样式
	 * clear 是否清除
	 * callback 回调函数返回绘制图形的坐标信息
	 **/
	that.drawGeometry = function (type, style, clear, callback, option) {
		if (scene == null)
			return;
		scene.fire((msgPrefix + ":drawGeometry"), { args : [type, style, clear, callback, option] }, parentScene, false);
	}
	
	that.addGraphic=function(params, addCallback){
		if(scene == null)
			return;
		if(!params||!params[0])
			return;
		var type=params[0];
		var style=params[1]||{"color":[215, 214, 111, 100]};
		var clear=params[2]||true;
		var callback=addCallback;
		scene.fire((msgPrefix + ":drawGeometry"), { args : [type, style, clear, callback] }, parentScene, false);
	}
	 //添加聚类图层
	 that.addClusterLayer=function(data){
		if(scene == null)
			return;
		var dataInfo=data.data
		var option={};
		 scene.fire((msgPrefix + ":addClusterLayer"), {args: [dataInfo, option]}, parentScene, false);
	 }
	//获取所选择的三维模型信息
	that.getSelectedLayerinfo = function (name, callback) {
		if (scene == null)
			return;
		scene.fire((msgPrefix + ":getSelectedLayerinfo"), {args: [name, callback]}, parentScene, false);
	}

	//平面坐标转经纬度
	that.Plat2lonLat = function (positions, callback) {
		if (scene == null)
			return;
		scene.fire((msgPrefix + ":Plat2lonLat"), {args: [positions, callback]}, parentScene, false);
	}
	//地面开挖接口
	that.digsuface=function(positions,depth,callback){
		if (scene == null)
		return;
		var options={
		positions:positions,
		depth:depth,
		callback:callback
		}
		scene.fire((msgPrefix + ":digSurface_dig"), {args: [options]}, parentScene, false);
	}

	//清除地面开挖
	that.removeDigsuface=function(){
		if (scene == null)
			return;
		scene.fire((msgPrefix + ":digSurface_remove"), {args: []}, parentScene, false);
	}
	that.clearDrawGeometry=function(){
		if (scene == null)
			return;
		scene.fire((msgPrefix + ":cleardrawGeometry"), {args: []}, parentScene, false);
	}

	//三维地图点击事件
	that.addPickHandler = function (callback) {
		if (scene == null)
			return;
		scene.fire((msgPrefix + ":addPickHandler"), {args: [callback]}, parentScene, false);
	}
	//右键查询
	that.addRightClickHandler=function(callback){
		 if (scene == null)
			return;
		scene.fire((msgPrefix + ":addRightClickHandler"), {args: [callback]}, parentScene, false);
	}

	that.pickModel = function (position,callback) {
		if (scene == null)
			return;
		scene.fire((msgPrefix + ":pickModel"), {args: [callback]}, parentScene, false);
	}


	that.init();
}

//在外面也可以调用checkGlobeServerURL函数
EGovaGlobeMap.checkGlobeServerURL = checkGlobeServerURL;

export default EGovaGlobeMap;