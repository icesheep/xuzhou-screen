import EGovaMMSMap from "./egovamms";
import MapUtils from './mapUtils';
var scene = null;
var context = {};

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

function checkGisServerURL(url,callback){
	var cookieUrl = getCookie("gisUrl");
	var gisProxyList = url.split(";");
	cookieUrl&&gisProxyList.push(cookieUrl);
	if(gisProxyList.length<=1){
		if(url.indexOf("http")!=0){
			url = context.originPath + url;
		}
		callback(url);
		return ;
	}
	var params = {isLoad:false};
	for(var i in gisProxyList){
		if(gisProxyList.hasOwnProperty(i)){
			if(gisProxyList[i].indexOf("http")!=0){
				gisProxyList[i] = context.originPath + url;
			}
			checkGISProxy(gisProxyList[i],params,callback);
		}
	}
}

function checkGISProxy(proxyUrl,params,callback) {
	var img = new Image();
	img.src = proxyUrl + '/symbol/default.png';
	img.onload = function (e1) {
		if(!params.isLoad){
			params.isLoad = true;
			context.gisServerURL = proxyUrl;
			setCookie("gisUrl",proxyUrl);
			callback(proxyUrl);
		}
		img = null;
	};
}

var EGovaGISMap = function ($container, pScene, prefix, gisParams, mapConfig,contextp) {
	var that = this;
	scene = pScene;
	context = contextp;
	var parentScene = pScene.pageId || "parentScene";
	var msgPrefix = prefix || "gismappage";
	var mmsMap = null;
	that.gisVisible = false;
	that.gisLoaded = false;
	that.isLoading = false;

	that.$gisMapFrame = null;
	that.gisMapContainer = null;

	that.gisMapContainer = $container.getElementsByClassName("emap-container")[0];
	if (!that.gisMapContainer) {
		
		var mapHTML = '<iframe class="emap-iframe"></iframe>';
		var element = document.createElement("div");
		element.classList.add("emap-container");
		element.innerHTML = mapHTML;
		$container.appendChild(element);
		that.gisMapContainer = element;
	}
	
	that.$gisMapFrame = that.gisMapContainer.getElementsByClassName("emap-iframe")[0];
	that.onMapLoadedHandlers = [];

	that.onMapLoaded = function () {
		that.isLoading = false;
		that.gisLoaded = true;
		if(context.mapCenterFlag){
			if(context.mapCenterFlag == '1'){
				if(context.coordinateX && context.coordinateY){
					that.centerAndZoom(context.coordinateX, context.coordinateY, 4);
				}
			} else if(context.mapCenterFlag == '2'){
				if(context.coordinateX && context.coordinateY){
					that.centerAndZoom(context.coordinateX, context.coordinateY, 1);
				}
				if(context.humanLayerUsageID && context.regionCode){
					var zoom = gisParams && gisParams.maskZoom == true;
					var style={"type":"esriSFS","style":"esriSFSSolid","color": [100,100,255,125],"outline":{"type":"esriSLS","style":"esriSLSSolid","color":[255,0,0,255],"width":1}};
					var pos = {visible:true,top:95,right:127};
					if(mapConfig && mapConfig.maskPos){
						pos = MapUtils.deepClones({}, pos, mapConfig.maskPos);
					}
					that.addMaskLayer(context.humanLayerUsageID, context.humanLayerKeyFieldName, context.regionCode, style, zoom, pos);
				}
			} else if(context.mapCenterFlag == '3'){
				if(context.coordinateX && context.coordinateY){
					that.centerAndZoom(context.coordinateX, context.coordinateY, 1);
				}
				if(context.humanLayerUsageID && context.regionCode){
					var zoom = gisParams && gisParams.maskZoom == false;
					var style={"type":"esriSFS","style":"esriSFSSolid","color": [100,100,255,0],"outline":{"type":"esriSLS","style":"esriSLSSolid","color":[255,0,0,255],"width":3}};
					var pos = {visible:true,top:95,right:127};
					if(mapConfig && mapConfig.maskPos){
						pos = MapUtils.deepClones({}, pos, mapConfig.maskPos);
					}
					that.addMaskLayer(context.humanLayerUsageID, context.humanLayerKeyFieldName, context.regionCode, style, zoom, pos);
				}
			}
		}
		for(var i=0,len=that.onMapLoadedHandlers.length; i<len; i++){
			that.onMapLoadedHandlers[i]();
		}
	}

	that.init = function () {
		if (!that.gisLoaded && !that.isLoading) {
			that.isLoading = true;
			checkGisServerURL(context.gisServerURL, function (gisurl) {
				var bust = (new Date()).getTime();
				var gisServerURL = context.gisServerURL = gisurl;
				var gisProxyURL = context.gisServerURL + '/home/gis/proxy.htm';
				var misServerURL = context.rootPath;
				var url = context.rootPath+context.assetsPath+"/map.html?parentScene=" + parentScene + "&msgPrefix=" + msgPrefix + "&bust="+bust
				   + "&serverURL=" + gisServerURL + "&proxyURL=" + gisProxyURL + "&misURL="+misServerURL+"&humanID=" + context.humanID;
				if (mapConfig != undefined && mapConfig.params != undefined) {
					for (var item in mapConfig.params) {
						url += "&" + item + "=" +encodeURIComponent(mapConfig.params[item]);
					}
				}
				if(context.mapZoomRange){
					var mapZoomRanges = context.mapZoomRange.split(",");
					if(mapZoomRanges.length == 2 ){
						url += "&minlevel=" +mapZoomRanges[0]+"&maxlevel="+mapZoomRanges[1]
					}
				}
				that.$gisMapFrame.src = url;
			});
			try {
				//如果启用了实景功能需要注册实景监听
				if (context.mmsEnabled != undefined && that.gisMapContainer) {
					var mmsEnabled = Number(context.mmsEnabled);
					if(mmsEnabled > 0){
						mmsMap = new EGovaMMSMap($container, scene, msgPrefix, context.mmsParams, mapConfig, mmsEnabled);
					}
				}
			} catch (e) {
				console.error(e.message);
			}
		}

		//初始化时不显示地图
		that.closeMap();
		// 监听地图加载完成的事件
		scene.on(msgPrefix + ":mapLoadedCallback", that.onMapLoaded, parentScene, false);
	}

	/**
	 * 二维地图显示
	 *
	 * @param res
	 */
	that.openMap = function (evt) {
		if (!that.gisVisible) {// 初次定位时调整布局
			if (!that.gisLoaded && !that.isLoading) {
				that.isLoading = true;
				checkGisServerURL(context.gisServerURL, function () {
					var gisServerURL = context.gisServerURL;
					var gisProxyURL = context.gisServerURL + '/home/gis/proxy.htm';
					var misServerURL = context.rootPath;
					var url = context.rootPath +context.assetsPath + "/map.html?parentScene=" + parentScene + "&msgPrefix=" + msgPrefix
						+ "&serverURL=" + gisServerURL + "&proxyURL=" + gisProxyURL +"&misURL="+misServerURL+ "&humanID=" + context.humanID;
					if (mapConfig != undefined && mapConfig.params != undefined) {
						for (var item in mapConfig.params) {
							url += "&" + item + "=" + mapConfig.params[item];
						}
					}
					that.$gisMapFrame.src = url;
				});
				try {
					//如果启用了实景功能需要注册实景监听，msgPrefix+'old'，为了兼容以前的GIS实景结合
					if (context.mmsEnabled != undefined && context.mmsEnabled == "1" && that.gisMapContainer) {
						mmsMap = new EGovaMMSMap($container, scene, msgPrefix + 'old', context.mmsParams, mapConfig);
					}
				} catch (e) {
					alert(e.message);
				}
			}

			that.gisMapContainer.style.height = '100%';
			that.gisMapContainer.style.display = 'block';
		/*	$(that.gisMapContainer).fadeIn(500,function(){
				that.gisMapContainer.style.display = 'block';
			});*/
			that.gisVisible = true;
		}
	}

	/**
	 * 二维地图关闭
	 */
	that.closeMap = function (evt) {
		that.gisMapContainer.style.display = 'block';
		that.gisMapContainer.style.height = '0';
		that.gisVisible = false;
	}


	/* 绑定事件 */
	that.bindEvent = function(msgId, msgHandler, stopOnTop) {
		if (scene == null)
			return;
		scene.on(msgPrefix + ":" + msgId, msgHandler, parentScene, stopOnTop);
	}
	/* 触发事件 */
	that.fireEvent = function(msgId, msgData, stopOnTop) {
		if (scene == null)
			return;
		scene.fire(msgPrefix + ":" + msgId, msgData, parentScene, stopOnTop);
	}
	/* 移除监听 */
	that.removeEventBind = function(msgId, stopOnTop) {
		if (scene == null)
			return;
		scene.remove(msgPrefix + ":" + msgId, parentScene, stopOnTop);
	}

	/* 切换到平移工具 */
	that.panMap = function() {
		if (scene == null)
			return;
		scene.fire(msgPrefix + ":panMap", parentScene);
	}
	/* 缩放到指定范围 */
	that.zoomToExtent = function(minX, minY, maxX, maxY) {
		if (scene == null)
			return;
		scene.fire((msgPrefix + ":zoomToExtent"), { args : [ Number(minX), Number(minY), Number(maxX), Number(maxY) ] }, parentScene,
				false);
	}
	/* 缩放到指定中心点和级别 */
	that.centerAndZoom = function(x, y, level) {
		if (scene == null)
			return;
		scene.fire((msgPrefix + ":centerAndZoom"), { args : [ x, y, level ] }, parentScene, false);
	}
	/* 缩放到全图范围 */
	that.zoomToFullExtent = function() {
		if (scene == null)
			return;
		scene.fire((msgPrefix + ":fullExtent"), { args : [] }, parentScene, false);
	}
	/* 绘制图形 */
	that.drawGraphic = function(graphic, zoom, clickCallback) {
		if (scene == null)
			return;
		if (graphic.geometry instanceof Array) {
			scene.fire(msgPrefix + ":locateFeatureByCoords", { args : [ graphic.geometry, graphic.type, graphic.id, graphic.style,
					graphic.hstyle, zoom,graphic.keyField,graphic.labelField,graphic.labelStyle,graphic.colorNumber] }, parentScene);
		} else {
			// scene.fire(msgPrefix+":locateFeatureByCoord",
			// {args:[{"geometry":graphic.geometry},graphic.type,graphic.id,graphic.style,graphic.hstyle,zoom]},parentScene);
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
	/*根据要素坐标定位显示要素*/
	that.locateFeatureByCoords=function(geometries, type, ID, style, hStyle, zoom){
		if (scene == null)
			return;
		scene.fire((msgPrefix + ":locateFeatureByCoords"), { args : [geometries, type, ID, style, hStyle, zoom] }, parentScene, false);
	}
	/* 清除指定图形 */
	that.clearGraphic = function(id, tag) {
		if (scene == null)
			return;
		if (typeof id != "string") {
			id = id.join(",");
		}
		if (tag) {
			id = null;
		}
		scene.fire((msgPrefix + ":clearGraphic"), { args : [ id, tag ] }, parentScene, false);
	}
	/* 清除全部图形 */
	that.clearAllGraphics = function(id) {
		if (scene == null)
			return;
		scene.fire((msgPrefix + ":clearAllGraphics"), { args : [] }, parentScene, false);
	}
	/* 在地图上标注 */
	that.pointSelect = function(symbolType, zoomFalg, callback) {
		if (scene == null)
			return;

		// 移除监听
		scene.remove(msgPrefix + ":pointSelectCallback", parentScene, false);

		if (zoomFalg == undefined)
			zoomFalg = true;
		if (callback) {
			// 定义回调
			scene.on(msgPrefix + ":pointSelectCallback", function(evt) {
				// 移除监听
				scene.remove(msgPrefix + ":pointSelectCallback", parentScene, false);
				callback(evt.args);
			}, parentScene, false);
		}
		scene.fire(msgPrefix + ":pointSelect", { args : [ symbolType, zoomFalg ] }, parentScene, false);
	}
	/* 获取图形外部矩形 */
	that.getFeaturesExtent = function(features, callback) {
		if (scene == null)
			return;

		// 移除监听
		scene.remove(msgPrefix + ":getFeaturesExtentCallback", parentScene, false);

		scene.on(msgPrefix + ":getFeaturesExtentCallback", function(evt) {
			// 移除监听
			scene.remove(msgPrefix + ":getFeaturesExtentCallback", parentScene, false);
			callback(evt.args);
		}, parentScene, false);
		scene.fire((msgPrefix + ":getFeaturesExtent"), { args : features }, parentScene, false);
	}

	/* 获取可见图层 */		
	that.getVisibleLayerIds = function (callback) {
				// 移除监听
				scene.remove(msgPrefix + ":getVisibleLayerIdsCallback", parentScene, false);

				scene.on(msgPrefix + ":getVisibleLayerIdsCallback", function(evt) {
					// 移除监听
					scene.remove(msgPrefix + ":getVisibleLayerIdsCallback", parentScene, false);
					callback(evt.args);
				}, parentScene, false);
				scene.fire((msgPrefix + ":getVisibleLayerIds"), {args: []}, parentScene, false);
			}

	that.identifyInfoWindow = function (usageID,keyValue,content,size) {
		if (scene == null)
			return;
		scene.fire((msgPrefix + ":identifyInfoWindow"), {args: [usageID,keyValue,content,size]}, parentScene, false);

	}
			/* 更改工具条参数 */
	that.changeControlParam = function (id,param) {
		if (scene == null)
			return;
		scene.fire((msgPrefix + ":changeControlParam"), {args: [id,param]}, parentScene, false);

	}
	/* 图层过滤显示 */
	that.setLayerDef = function (phyLayerID,layerDef) {
		if (scene == null)
			return;
		scene.fire((msgPrefix + ":setLayerDef"), {args: [phyLayerID,layerDef]}, parentScene, false);

	}
	that.setLayerColorDef=function(phyLayerIDs,colorDefs){
		if(scene == null)
			return;
		scene.fire((msgPrefix + ":setLayerColorDef"), {args: [phyLayerIDs,colorDefs]}, parentScene, false);
	}

	/* 显示图层树 */
	that.showLayerTree = function(/* humanID, mapID */openTree) {
		if (scene == null)
			return;
		/*
		 * var data = null; scene.fire(msgPrefix + ":showLayerTree", {args :
		 * [data, humanID, mapID]}, parentScene);
		 */
		if (openTree == undefined || arguments.length > 1)
			openTree = true;
		scene.fire(msgPrefix + ":showLayerTree", { args : [ openTree ] }, parentScene);
	}
	/* I查询 */
	that.identify = function(type, humanID, mapID) {
		if (scene == null)
			return;
		scene.fire(msgPrefix + ":identify", { args : [ type, humanID, mapID ] }, parentScene);
	}
	/* 地理编码查询 */
	that.geoCode = function(searchStr, callback) {
		if (scene == null)
			return;
		if (callback) {
			// 移除监听
			that.removeEventBind("geoCodeCallback");
			if (callback != undefined) {
				that.bindEvent("geoCodeCallback", function(evt) {
					callback(evt.args);
				});
			}
		}
		scene.fire(msgPrefix + ":geoCode", { args : [ searchStr ] }, parentScene);
	}
	/* 逆地理编码查询 */
	that.getAddressByXY = function(x, y, searchStr, radius, callback) {
		if (scene == null)
			return;
		if(callback) {
			that.removeEventBind("getAddressByXYCallback");
			that.bindEvent("getAddressByXYCallback", function (evt) {
				callback(evt.args);
			});
		}
		scene.fire(msgPrefix + ":getAddressByXY", { args : [ x, y, searchStr, radius ] }, parentScene);
	}
	/* 根据坐标获取单元网格 */
	that.getCellNameByPosXY = function(x, y, gridType) {
		if (scene == null)
			return;
		var args = [];
		var callback = null;
		for (var i = 0; i < arguments.length; i++) {
			var arg = arguments[i];
			if (i == arguments.length-1 && typeof(arg) == "function"){
				callback = arg;
				continue;
			}
			args.push(arg);
		}
		if (callback != null) {
			// 移除监听
			that.removeEventBind("getCellNameByPosXYCallback");

			function _getCellNameByPosXYCallback(evt) {
				that.removeEventBind("getCellNameByPosXYCallback");
				callback(evt.args);
			}
			that.bindEvent("getCellNameByPosXYCallback", _getCellNameByPosXYCallback);
		}
		that.fireEvent("getCellNameByPosXY", { args : args });
	}
	/* 根据图层字段定位显示 */
	that.locateFeatureByIDs = function (layerID, keyFiled, keyValue, clearMap, style, hStyle, bZoom, randomColor, labelfield, labelstyle, geometry, where, renderCanvas, singleSelected,options,extendProperty,layerTag,outFieldStr) {
		if (scene == null)
			return;
		if (bZoom == undefined)
			bZoom = false;
		scene.fire(msgPrefix + ":locateFeatureByIDs", { args: [layerID, keyValue, keyFiled, clearMap, style, hStyle, bZoom, randomColor, labelfield, labelstyle, geometry, where, renderCanvas, singleSelected ,options,extendProperty,layerTag,outFieldStr] },
			parentScene);
	}
	/* 显示案件分布 */
	that.showRecListDistribution = function(infoJson, zoom, clickCallback, labelInfo,isShowLegend) {
		if (scene == null || infoJson.length == 0)
			return;
		//如果xy坐标没有值不处理
		for(var i=0,len=infoJson.length; i<len; i++){
			if(!infoJson[i].coordinateX || infoJson[i].coordinateX == "" || !infoJson[i].coordinateY || infoJson[i].coordinateY == ""){
				return;
			}
		}

		// 移除监听
		that.removeEventBind("showRecListDistributionCallback");

		if (clickCallback != undefined) {
			that.bindEvent("showRecListDistributionCallback", function(evt) {
				clickCallback(evt.args);
			});
		}
		scene.fire((msgPrefix + ":showRecListDistribution"), { args : [ infoJson, zoom, labelInfo,isShowLegend ] }, parentScene, false);
		
		//如果启用了实景功能，同时进行实景定位
		if(mmsMap && infoJson.length == 1) {
			var recInfo = infoJson[0];
			if (mmsMap.mmsLoaded){
				if (!mmsMap.mmsVisible) {
//						var pos = {x:recInfo.coordinateX, y:recInfo.coordinateY};
//						var evt = {args:[pos]};
//						mmsMap.setMMSEyePosition(evt);
				} else {
					mmsMap.locateEvent(recInfo.recID, recInfo.coordinateX, recInfo.coordinateY);
				}
			}
		}
	}
	/* 显示多个自定义图标 */		
	that.showMultiObjectCurrentPosition = function (jsonInfo, zoom, bClear, hStyleID, infoStyle, bCanvas, tagName, clickCallback,mouseOverCallBack) {
		if (scene == null)
			return;
		// 移除监听
		that.removeEventBind("showMultiObjectCurrentPositionClick");
		that.removeEventBind("showMultiObjectCurrentPositionMouseover");
		var args =[];
		var FuncList = [];
		for(var i = 0;i<arguments.length;i++){
			 if (arguments[i] instanceof Function) {
				FuncList.push(arguments[i]);
			 }else{
				args.push(arguments[i]);
			 }
		}
		if (FuncList[0] instanceof Function) {
			that.bindEvent("showMultiObjectCurrentPositionClick", function(evt) {
				FuncList[0](evt.args);
			});
		}
		if (FuncList[1] instanceof Function) {
			that.bindEvent("showMultiObjectCurrentPositionMouseover", function(evt) {
				FuncList[1](evt.args);
			});
		}
		scene.fire((msgPrefix + ":showMultiObjectCurrentPosition"), {args: args}, parentScene, false);
	}
	/* 显示监督员 */
	that.showPatrolCurrentPosition = function (jsonInfo, zoom, bClear, hStyleID, clickCallback) {
		if (scene == null)
			return;

		var args = Array.prototype.slice.call(arguments);
		if (arguments[arguments.length - 1] instanceof Function) {
			clickCallback = arguments[arguments.length - 1];
			args = args.slice(0, args.length - 1);
		}

		if (clickCallback) {
			that.removeEventBind("showPatrolCurrentPositionCallback");
			that.bindEvent("showPatrolCurrentPositionCallback", function (evt) {
				clickCallback(evt.args);
			});
		}
		scene.fire((msgPrefix + ":showPatrolCurrentPosition"), { args: args }, parentScene, false);
	}
	/* 获取缓冲区 */
			that.getBuffer = function (layerID, x, y, radius,getBufferCallback) {
				if (scene == null)
					return;
	
				var args = Array.prototype.slice.call(arguments);
				if (arguments[arguments.length - 1] instanceof Function) {
					getBufferCallback = arguments[arguments.length - 1];
					args = args.slice(0, args.length - 1);
				}
	
				if (getBufferCallback) {
					that.removeEventBind("getBufferCallback");
					that.bindEvent("getBufferCallback", function (evt) {
						getBufferCallback(evt.args);
					});
				}
				scene.fire((msgPrefix + ":getBuffer"), {args: args}, parentScene, true);
			}
	/* 显示监督员责任网格 */
	that.showPatrolDutygridCells = function(infoJson, zoom, clickCallback) {
		if (scene == null)
			return;

		var layerID = infoJson.layerID;
		var layerKeyFieldName = infoJson.keyFieldName;
		var cellID = infoJson.grids;
		var bClearMap = false;
		var gridCellStyle = {};
		gridCellStyle.style = { type : "esriSFS", style : "esriSFSSolid", color : [ 0, 0, 100, 76 ],
			outline : { type : "esriSLS", style : "esriSLSSolid", color : [ 255, 130, 47, 255 ], width : 2 } };
		gridCellStyle.hStyle = MapUtils.deepClones(true, {}, gridCellStyle.style);
		that.locateFeatureByIDs(layerID, layerKeyFieldName, cellID, bClearMap, gridCellStyle.style, gridCellStyle.hStyle, zoom);
	}
	/* 标识位置 */
	that.markMap = function(projectTypeID, eventTypeID, actPropertyID, displayStyleID, layerID, clickCallback, cellIndexName,point) {
		if (scene == null)
			return;

		// 移除监听
		that.removeEventBind("markMapCallback");

		//新增了layerID，因此需要兼容原来的4个参数
		if (arguments.length == 5 && typeof layerID == "function"){
			clickCallback = layerID;
			layerID == null;
		}

		if (clickCallback != undefined) {
			that.bindEvent("markMapCallback", function(evt) {
				clickCallback(evt.args);
			});
		}
		scene.fire(msgPrefix + ":markMap", {
			args : [ projectTypeID, eventTypeID, actPropertyID, displayStyleID, layerID, cellIndexName,point]
		}, parentScene, false);
	}
	/* 案件定位 */
	that.eventLocate = that.recLocate = function(eventID, defaultMapRange) {
		if (scene == null)
			return;

		if (defaultMapRange == undefined)
			defaultMapRange = 200;
		scene.fire(msgPrefix + ":eventLocate", { args : [ eventID, defaultMapRange ] }, parentScene, false);
	}
	/* 显示特定图层 */
	that.showMapLayers = function(layerTag, showLevel, mode) {
		if (scene == null)
			return;
		scene.fire(msgPrefix + ":showMapLayers", { args : [ layerTag, showLevel, mode ] }, parentScene, false);
	}
	/* 显示车辆人员轨迹 */
	that.showObjectTrace = function (objectID, symbolType, dateTime, queryCondition, hideControlPanel, symbolPic, optimizeParams, infoCallback, updatePositionCallback, closeCallback, traceDigCallback) {
		if (scene == null)
			return;

		if (closeCallback) {
			that.removeEventBind("TraceManagerCloseCallback");
			that.bindEvent("TraceManagerCloseCallback", function () {
				closeCallback();
			});
		}
		if (infoCallback) {
			that.removeEventBind("showObjectTraceCallback");
			that.bindEvent("showObjectTraceCallback", function (evt) {
				infoCallback(evt && evt.args);
			});
		}
		if (updatePositionCallback) {
			that.removeEventBind("updatePositionCallback");
			that.bindEvent("updatePositionCallback", function (evt) {
				updatePositionCallback(evt && evt.args);
			});
		}
		if (traceDigCallback) {
			that.removeEventBind("getPatrolTraceDigCallback");
			that.bindEvent("getPatrolTraceDigCallback", function (evt) {
				traceDigCallback(evt && evt.args);
			});
		}
		/*if (context.sysConfig['PATROL_POS_WRITE_TO_FILE']) {
			if (queryCondition) {
				queryCondition = $.extend({}, queryCondition, { 'resourcetype': 2 });
			} else {
				queryCondition = { 'resourcetype': 2 };
			}
		}*/
		scene.fire(msgPrefix + ":showObjectTrace", { args: [objectID, symbolType, dateTime, queryCondition, hideControlPanel, symbolPic, optimizeParams] }, parentScene);
	}
	
	
	/* 显示车辆人员轨迹热力的接口*/
	that.showTraceHeatMap = function(objectID, symbolType,starttime,endtime,queryCondition,hidePanel) {
		if (scene == null)
			return;
		scene.fire(msgPrefix + ":showTraceHeatMap", { args: [objectID, symbolType,starttime,endtime,queryCondition,hidePanel] }, parentScene);
	};
	
	/*添加车辆或人员轨迹*/
	that.addObjectTrace = function(jsonInfo,symbolType,clear,showControlPanel){
		if (scene == null)
			return;
		scene.fire(msgPrefix + ":addObjectTrace", {args: [jsonInfo, symbolType, clear, showControlPanel]},parentScene);
	}
	/* 显示第三方上报人员轨迹 */
	that.showZzTaskTrace = function(objectID, symbolType, dataTime, queryCondition){
		if (scene == null)
			return;
		scene.fire(msgPrefix + ":showObjectTrace", { args : [ objectID, symbolType, dataTime, queryCondition ]}, parentScene);
	}
	/* 绘制巡更路线 */
	that.showPatrolRoute = function(routeList, type, bClear, editable) {
		if (scene == null)
			return;
		if (!(routeList instanceof Array))
			routeList = [ routeList ];
		if (bClear == undefined)
			bClear = false;
		if (editable == undefined)
			editable = false;

		var graphics = [];
		for ( var i = 0; i < routeList.length; i++) {
			var route = routeList[i];
			var line = [];
			var attributes = [];
			var graphic = { id : route.routeID + "", geometry : { paths : [ line ] }, attributes : attributes };
			for ( var j = 0; j < route.pointList.length; j++) {
				var point = route.pointList[j];
				line.push([ point.coordinateX, point.coordinateY ]);
				attributes.push(point.pointID);
			}
			graphics.push(graphic);
		}
		var style = { color : [ 255, 0, 0, 150 ], width : 2 };
		if (type == "dutyGridRoute") {
			style.color = [ 0, 0, 255, 150 ]
		}
		if (type == "patrolRoute") {
			style.color = [ 0, 255, 0, 150 ]
		}
		scene.fire(msgPrefix + ":showPatrolRoute", { args : [ graphics, bClear, style, editable ] }, parentScene);
	}
	/* 添加巡更路线 */
	that.addPatrolRoute = function(addCallback, editCallback) {
		if (scene == null)
			return;

		// 移除监听
		that.removeEventBind("drawPatrolRouteNewCallback");
		that.removeEventBind("drawPatrolRouteEditCallback");

		if (addCallback != undefined) {
			that.bindEvent("drawPatrolRouteNewCallback", function(evt) {
				addCallback(evt.args);
			});
		}
		if (editCallback != undefined) {
			that.bindEvent("drawPatrolRouteEditCallback", function(evt) {
				editCallback(evt.args);
			});
		}
		var style = { color : [ 255, 0, 0, 150 ], width : 2 };
		scene.fire(msgPrefix + ":drawPatrolRoute", { args : [ style ] }, parentScene);
	}
	/* 删除巡更路线 */
	that.deletePatrolRoute = function(callback, withConfirm) {
		if (scene == null)
			return;

		// 移除监听
		that.removeEventBind("deletePatrolRouteCallback");

		if (callback != undefined) {
			that.bindEvent("deletePatrolRouteCallback", function(evt) {
				callback(evt.args);
			});
		}
		if(withConfirm){
			scene.fire(msgPrefix + ":deletePatrolRoute", { args : [false] }, parentScene);
		} else {
			scene.fire(msgPrefix + ":deletePatrolRoute", { args : [] }, parentScene);
		}

	}
	/* 获取正在编辑的路线 */
	that.getPatrolRouteEdit = function(callback) {
		if (scene == null)
			return;

		// 移除监听
		that.removeEventBind("getPatrolRouteEditCallback");

		if (callback != undefined) {
			that.bindEvent("getPatrolRouteEditCallback", function(evt) {
				callback(evt.args);
			});
		}
		scene.fire(msgPrefix + ":getPatrolRouteEdit", { args : [] }, parentScene);
	}
	
	/* 添加图形 */
	var pointStyle = {};		
	pointStyle.style = {"type":"esriSMS","style":"esriSMSCircle","color":[255, 0, 0, 150],"size":8,"angle":0,"xoffset":0,"yoffset":0,"outline":{"color":[255, 0, 0, 150],"width":1}}
	pointStyle.hStyle = MapUtils.deepClones(true, {}, pointStyle.style);
	var polylineStyle = {};
	polylineStyle.style ={"type":"esriSFS","style":"esriSFSSolid","color":[255, 0, 0, 150],"outline":{"type":"esriSLS","style":"esriSLSSolid","color":[0, 0, 255, 150],"width":1}};
	polylineStyle.hStyle = MapUtils.deepClones(true, {}, polylineStyle.style);
	var polygonStyle = {};
	polygonStyle.style ={"type":"esriSFS","style":"esriSFSSolid","color":[255, 0, 0, 150],"outline":{"type":"esriSLS","style":"esriSLSSolid","color":[0, 0, 255, 150],"width":1}};
	polygonStyle.hStyle = MapUtils.deepClones(true, {}, polygonStyle.style);
	var styles = {"point":pointStyle, "polyline":polylineStyle, "polygon":polygonStyle};
	
	that.getStyles = function(type, styleType) {
		var result = MapUtils.deepClones(true, {}, styles[type]);
		if (styleType == "esriSFSDiagonalCross") {
			result.style.type = "esriPFS";
			result.style.width = 10;
			result.style.height = 10;
			result.style.url = "images/diagonalcross_red.png";
		}else if(styleType == "esriPolygonHalfYellowTransparent"){
			result.style = {"type":"esriSFS","style":"esriSFSSolid","color":[215, 214, 111, 100],"outline":{"type":"esriSLS","style":"esriSLSSolid","color":[0, 0, 255, 150],"width":1}};;
		}else if(styleType == "esriPointHalfYellowTransparent"){
			result.style = {"type":"esriSMS","style":"esriSMSCircle","color":[215, 214, 111, 100],"size":8,"angle":0,"xoffset":0,"yoffset":0,"outline":{"color":[255, 0, 0, 150],"width":1}};
			result.hStyle =MapUtils.deepClones(true, {}, pointStyle.style);
		}else if(styleType == "esriLineHalfYellowTransparent"){
			result.style = {"type":"esriSFS","style":"esriSFSSolid","color":[215, 214, 111, 100],"outline":{"type":"esriSLS","style":"esriSLSSolid","color":[0, 0, 255, 150],"width":1}};
			result.hStyle = MapUtils.deepClones(true, {}, pointStyle.style);
		}
		return result;
	}		
	that.addGraphic = function(params, addCallback, editCallback) {
		if (scene == null)
			return;

		// 移除监听
		that.removeEventBind("drawGeometryCallback");
		that.removeEventBind("drawGeometryEditCallback");

		if (addCallback != undefined) {
			that.bindEvent("drawGeometryCallback", function(evt) {
				addCallback(evt.args);
			});
		}
		if (editCallback != undefined) {
			that.bindEvent("drawGeometryEditCallback", function(evt) {
				editCallback(evt.args);
			});
		}
		if (params[1] == null && styles[params[0]]) {
			params[1] = styles[params[0]].style;
		}
		scene.fire(msgPrefix + ":drawGeometry", { args : params }, parentScene);
	}
	
	/* 编辑图形 */
	that.editGraphic = function(params, editCallback, deleteCallback) {
		if (scene == null)
			return;

		// 移除监听
		that.removeEventBind("editGeometryCallback");
		that.removeEventBind("deleteGeometryCallback");

		if (editCallback != undefined) {
			that.bindEvent("editGeometryCallback", function(evt) {
				editCallback(evt.args);
			});
		}
		if (deleteCallback != undefined) {
			that.bindEvent("deleteGeometryCallback", function(evt) {
				deleteCallback(evt.args);
			});
		}
		if (params[3] == null) {
			params[3] = styles.polygon.style;
		}
		scene.fire(msgPrefix + ":editGeometry", { args : params }, parentScene);
	}
	
	/* 圆饼图  */
	that.addCircleChart = function(name, data, color, param) {
		color = color || "#1B5771";
		param = param || {minRadius: 20, rangeRadius: 20};
		scene.fire(msgPrefix + ":addCircleChart", {args: [name, data, color, param]}, parentScene);
	}

	/* 饼图  */
	that.addChart = function(option, zoom) {
		scene.fire(msgPrefix + ":addChart", {args: [option, zoom]}, parentScene);
	}
	
	that.drawGeometry = function(type, style, clear, callback) {
		type = type || "point";
		style = style || {"type":"esriSLS","style":"esriSLSSolid","color":[255,0,0,255],"width":2};
		//移除监听
		that.removeEventBind("drawGeometryCallback");
		if (callback != undefined) {
			that.bindEvent("drawGeometryCallback", function(evt) {
				callback(evt.args);
			});
		}
		
		scene.fire(msgPrefix + ":drawGeometry", {args: [type, style, clear]}, parentScene);
	}
	
	/* 热力图*/
	that.addHeatMap = function(data, option){
		scene.fire(msgPrefix + ":addHeatMap", {args: [data, option]}, parentScene);
	}
	/* 聚类 */
	that.addClusterLayer = function(data){
		scene.fire(msgPrefix + ":addClusterLayer", {args: [data]}, parentScene);
	}
	/* 添加热区图层 */
	that.addHotLayer = function (layerUsageID, outFields, visiblelevel, clickCallback, style, hstyle) {
		var usageID = layerUsageID || 3007;
		var style = style || { "type": "esriSFS", "style": "esriSFSSolid", "color": [100, 100, 100, 125], "outline": { "type": "esriSLS", "style": "esriSLSSolid", "color": [255, 0, 0, 255], "width": 1 } };
		var hstyle = hstyle || { "type": "esriSFS", "style": "esriSFSSolid", "color": [100, 100, 255, 125], "outline": { "type": "esriSLS", "style": "esriSLSSolid", "color": [255, 0, 0, 255], "width": 1 } };
		var where = null;
		scene.fire(msgPrefix + ":addCustomWMSLayer", { args: [usageID, style, hstyle, where, outFields, visiblelevel] }, parentScene);

		if (clickCallback) {
			that.removeEventBind("CustomWMSLayerMouseClick");
			that.bindEvent("CustomWMSLayerMouseClick", function (evt) {
				clickCallback(evt.args);
			});
		}
	}
	
	 /* 添加等值线图 */
	that.addKrigingMap = function (datalist, options) {
		 scene.fire(msgPrefix + ":addKrigingMap", { args: [datalist, options] }, parentScene);
	}
	
	/* 删除热区图层 */
	that.removeHotLayer = function(){
		scene.fire(msgPrefix + ":removeLayer", { args: ['CustomWMSLayer'] }, parentScene);
	}


	/* 图层查询 */
	that.queryPhylayerFeatures = function(params, callback) {
		// 移除监听
		that.removeEventBind("queryPhylayerFeaturesCallback");

		if (callback != undefined) {
			that.bindEvent("queryPhylayerFeaturesCallback", function(evt) {
				callback(evt.args);
			});
		}
		scene.fire(msgPrefix + ":queryPhylayerFeatures", {args: [params.queryType, params.queryValue, params.phyLayerIDs, params.where]}, parentScene);
	}
//		/* 执行查询任务 */
//		that.executeQueryTask = function(params, callback) {
//			var queryTaskContext = {};
//			queryTaskContext.callback = callback;
//			queryTaskContext.gisSuccessFn = queryTaskContext.gisErrorFn = function(data, result) {
//				this.callback(result);
//			}
//			var queryTaskService = http.getInstance("", {type : "post", async: false, "callback": callback }, queryTaskContext.gisSuccessFn, queryTaskContext.gisErrorFn, queryTaskContext);
//			queryTaskService.settings.url = context.gisServerURL + "/home/gis/event/execquerytask.htm";
//			queryTaskService.ajax(params);
//		}
	/* 显示消息框 */
	that.showInfoWindow = function (params) {
		var visible = params.visible;
		var position = {};
		position.x = params.x;
		position.y = params.y;
		var title = params.title;
		var content = params.content;
		scene.fire(msgPrefix + ":infoWindow", { args: [visible, position, title, content] }, parentScene);
	}
	/* 隐藏消息框 */
	that.hideInfoWindow = function (params) {
		scene.fire(msgPrefix + ":infoWindow", { args: [false] }, parentScene);
	}



	/* 显示扩展消息框 */
	that.showInfoWindowEx = function (params) {
		scene.fire(msgPrefix + ":showInfoWindow", {
			args: [params.id || 0, params.title, params.content, params.x, params.y, params.style, params.options]
		}, parentScene);
	}
	/* 显示扩展消息框 */
	that.hideInfoWindowEx = function (id) {
		scene.fire(msgPrefix + ":hideInfoWindow", {
			args: [id]
		}, parentScene);
	}
	/** 设置扩展消息框样式
	* option  基础样式选项，格式如：{noTitle:true,close:true,title:{},background:'#FFF'}
	*		noTitle: 是否显示标题栏;
	*		close: 是否显示关闭按钮；
	*		title: 标题栏的css样式对象
	*		background : 除标题栏外的其他部分的颜色
	*  style   位置和大小的配置，格式如：{width:300,height:300,achor:'auto',offsetY:0}
	*		width: 宽度
	*		height：高度
	*		achor：箭头方向，其中值包含 'top','left','right','bottom','auto'
	*		offsetY：Y方向上的偏移
	**/
	that.setInfoWindowStyle = function (option,style,id) {
		scene.fire(msgPrefix + ":setInfoWindowStyle", {
			args: [option,style,id]
		}, parentScene);
	}

	/* 要素查询 */
	that.queryFeature = function(params, callback) {
		// 移除监听
		that.removeEventBind("queryFeatureCallback");

		if (callback != undefined) {
			that.bindEvent("queryFeatureCallback", function(evt) {
				callback(evt.args);
			});
		}
		scene.fire(msgPrefix + ":queryFeature", {args: [params.layerID, params.where || null, params.geometry || null, params.outFields, params.outGeometry, params.pointTolorence||0]}, parentScene);
	}

	/* 显示图层
	 * layerID:图层ID ， 
	 * serviceID:服务ID(可选)，
	 * showAtBottom:是否显示在最底层（true:显示到最底层，false:显示在最顶层），
	 * zoomLevel:缩放级别(传入数字为缩放到对应的级别，传入true缩放到最大可视级别)
	 */
	that.showVectorLayer = function(layerID,serviceID,showAtBottom,zoomLevel) {
		if (scene == null)
			return;
		scene.fire(msgPrefix + ":showVectorLayer", {args: [layerID,serviceID,showAtBottom,zoomLevel]}, parentScene);
	}

	/* 隐藏图层 */
	that.hideVectorLayer = function(layerID,serviceID) {
		if (scene == null)
			return;
		scene.fire(msgPrefix + ":hideVectorLayer", {args: [layerID,serviceID]}, parentScene);
	}

	/* 获取当前地图范围 */
	that.getMapExtent = function(callback) {
		// 移除监听
		that.removeEventBind("getMapExtentCallback");

		if (callback != undefined) {
			that.bindEvent("getMapExtentCallback", function(evt) {
				callback(evt.args);
			});
		}
		scene.fire(msgPrefix + ":getMapExtent", {args: []}, parentScene);
	}

	/**查询表信息*/
	that.queryObjectInfo = function (geoShapes, tableName, xFieldName, yFieldName, callback, usePage, currentPage, numPerPage) {
		var queryParam = {
			'tableName': tableName,
			'xFieldName': xFieldName,
			'yFieldName': yFieldName
		};
		that.removeEventBind("queryObjectInfoCallback");
		that.bindEvent("queryObjectInfoCallback", callback);
		scene.fire(msgPrefix + ':queryObjectInfo', {args: [JSON.stringify(geoShapes), JSON.stringify(queryParam), usePage, currentPage, numPerPage]}, parentScene, false);
	}

	that.enableMapSnap = function (layerID, callback) {
		if (scene == null) return;
		if(!layerID) return;
		that.removeEventBind("enableMapSnapCallback");
		that.bindEvent("enableMapSnapCallback", callback);
		scene.fire(msgPrefix + ":enableMapSnap", {
			args: [layerID]
		},parentScene);
	}
	
	that.disableMapSnap = function (layerID) {
		if (scene == null) return;
		if(!layerID) return;
		scene.fire(msgPrefix + ":disableMapSnap", {
			args: [layerID]
		},parentScene);
	}

	that.addMaskLayer = function(layerID,keyField,values,style,zoom,position) {
		scene.fire(msgPrefix + ":addMaskLayer", {args: [layerID,keyField,values,style,zoom,position]},parentScene);
	}

	/* 根据PointID定位空中全景 */
	that.mmsAirPanoLocateByID = function(pointID) {
		if(mmsMap && mmsMap.mmsLoaded) {
			scene.fire(msgPrefix + ":mmsAirPanoLocateCallback", {args: [pointID]}, parentScene);
		}
	}

	/* 空中全景历史对比回调 */
	that.mmsAirPanoCompare = function(callback) {
		if(mmsMap && mmsMap.mmsLoaded) {
			scene.fire(msgPrefix + ":mmsAirPanoCompareCallback", {args: [callback]}, parentScene);
		}
	}

	that.setMMSEyePositionTest = function(x,y) {
		var pos = {x:x, y:y};
		var evt = {args:[pos]};
		mmsMap.setMMSEyePosition(evt);
	}

	/* 切换地图类型 */
	that.changeControlParam = function (type, param) {
		scene.fire(msgPrefix + ":changeControlParam", { args: [type, param] }, parentScene);
	}

	/* 获取图层信息 */
	that.getPhyLayerInfo=function (phyLayerID,getPhyLayerInfoCallBack) {
		that.removeEventBind("getPhyLayerInfoCallBack");
		if (getPhyLayerInfoCallBack != undefined) {
			that.bindEvent("getPhyLayerInfoCallback", function(evt) {
				getPhyLayerInfoCallBack(evt.args);
			});
		}
		scene.fire((msgPrefix + ":getPhyLayerInfo"), {args: [phyLayerID]}, parentScene,true);
	}
	
	 /* 获取图层字段信息 */
	that.getPhyLayerField=function (phyLayerIDs,getPhyLayerFieldCallback) {
		that.removeEventBind("getPhyLayerFieldCallback");
		if (getPhyLayerFieldCallback != undefined) {
			that.bindEvent("getPhyLayerFieldCallback", function(evt) {
				getPhyLayerFieldCallback(evt.args);
			});
		}
		scene.fire((msgPrefix + ":getPhyLayerField"), {args: [phyLayerIDs]}, parentScene,true);
	}

	 /* 获取图层字段信息 */
	that.getPhyLayerField=function (phyLayerIDs,getPhyLayerFieldCallback) {
		that.removeEventBind("getPhyLayerFieldCallback");
		if (getPhyLayerFieldCallback != undefined) {
			that.bindEvent("getPhyLayerFieldCallback", function(evt) {
				getPhyLayerFieldCallback(evt.args);
			});
		}
		scene.fire((msgPrefix + ":getPhyLayerField"), {args: [phyLayerIDs]}, parentScene,true);
	}
	
	/*对几何图形进行缓冲*/
	that.getGeometryBuffer=function(geometry,radius,callback){
		that.removeEventBind("getGeometryBufferCallback");
		if (callback != undefined) {
			that.bindEvent("getGeometryBufferCallback", function(evt) {
				callback(evt.args);
			});
		}
		scene.fire((msgPrefix + ":getGeometryBuffer"), {args: [geometry,radius]}, parentScene,true);
	}
	
	/* 移除图层*/
	that.removeLayer = function(layerName){
		scene.fire((msgPrefix + ":removeLayer"), {args: [layerName]}, parentScene,true);
	} 
	
	that.init();
}
export default EGovaGISMap;