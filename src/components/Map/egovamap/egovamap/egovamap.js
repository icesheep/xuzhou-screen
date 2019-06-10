import EGovaGlobeMap from './egovaglobe';
import EGovaGISMap from './egovagis';
import MapSwich from './mapswich';
import EGovaScene from './EGovaScene';
import MapUtils from './mapUtils';
import './egovamap.css';
   
var defaultMapID = null;
var mapList = {};
var mapArray = [];
var mapCount = 0;
var scene = null;

function getUniqueID(container) {
	var uniqueID = null;
	if (container == undefined || container == null || container == "")
		return undefined;
	uniqueID = container.uniqueID;
	if(!uniqueID){
		uniqueID = "egovamappage" + mapCount;
		container.uniqueID = uniqueID;
		mapCount++;
	}
	return uniqueID;
}

function getMapContainer(container) {
	var result = null;
	if (typeof container == "string"){
		result = document.getElementById(container);
	}else if (window.jQuery&&container instanceof window.jQuery){
		result = container[0];
	}else{
		result = container;
	}
	if (result != null) {
		if (result.nodeName == "IFRAME") {
			result.classList.add("emap-iframe");
			result = result.parent();
		}
	}
	return result;
}
var EGovaMap = function(containerID, callback, mapConfig, mapType, mapParam,context) {
	context&&!context.assetsPath&&(context.assetsPath = "/library/urban/egovamap");
	var that = this;
	var globeMap = null;
	var gisMap = null;
	var mapSwich = null;
	var $mapsContainer = null;
	var parentScene = "parentScene";
	var msgPrefix = "egovamappage";
	
	that.enable = false;
	that.mapType = mapType;
	context.currentMapType = mapType||'map';
	function mapLoadedHandler(callback) {
		that.enable = true;
		//地图加载后再初始化地图切换控件
		if ((context.globeEnabled==true||context.globeEnabled=='1') && (context.gisEnabled==true||context.gisEnabled=='1')) {
			mapSwich = new MapSwich($mapsContainer, {
				right: 0,
				bottom: 0,
				left: null,
				top: null
			}, scene, msgPrefix,context);
		}
		if (callback != undefined)
			callback();
	}

	that.initMap = function(container, callback, mapType, _mapConfig, mapParam) {
		$mapsContainer = getMapContainer(container);
		that.uniqueID = getUniqueID($mapsContainer);
		msgPrefix =  that.uniqueID;

		//默认的地图控制参数，gis二维地图会用到
		var mapConfig = _mapConfig;

        try {
			if (scene == null) {
				scene = EGovaScene.create("iframe", parentScene);
			}
			//如果启用了三维地图功能需要注册监听
			if (context.globeEnabled == true || context.globeEnabled == "1") {
				var newGlobeMapCallback = function() {
						//绑定二维地图缩放事件，放大到最大级别，继续放大自动切换到三维地图
					  if (context.globeParams.auto2dto3d && gisMap != null) {
							gisMap.bindEvent("mapMaxZoomCallback", that.onGisMapMaxZoomCallback);
						}
						//绑定三维地图缩放事件，三维地图放大到一定高度，自动切换到二维地图
						if (context.globeParams.auto3dto2d && globeMap != null) {
							globeMap.bindEvent("maxGlobeRangeCallback", that.openGisMap);
						}
						//如果设置了地图范围，那么就同时限制三维地图的浏览范围
						if (context.globeParams.auto3dto2d && context.globeParams.mapExtent && globeMap != null) {
							that.callAfterGlobeLoaded(function() {
								if (!context.globeParams.globeExtent) {
									context.globeParams.globeExtent = MapUtils.toLonLatExtent(context.globeParams.mapExtent);
								}
								globeMap.limitGlobeRange(context.globeParams.globeExtent);
							});
						}
					}
					//如果启用三维地图，就初始化三维地图相关的配置参数，从三维服务端获取
					globeMap = new EGovaGlobeMap($mapsContainer, scene, msgPrefix + "_globe", mapConfig,context,newGlobeMapCallback);
			 }
	
			//如果启用了GIS地图功能需要注册监听
			if (context.gisEnabled == true || context.gisEnabled == "1") {
				gisMap = new EGovaGISMap($mapsContainer, scene, msgPrefix + "_gis", mapParam, mapConfig,context);
			}

			mapType = mapType || 'map';
			if (mapType == 'globe') {
				// 监听地图加载完成的事件
				globeMap.bindEvent("globeLoadedCallback", function() {
					mapLoadedHandler(callback);
				}, parentScene, false);
				if (globeMap != null) {
					globeMap.openGlobe({
						args: []
					});
				}
			} else if (mapType == 'map') {
				// 监听地图加载完成的事件
				gisMap.bindEvent("mapLoadedCallback", function() {
					mapLoadedHandler(callback);
				}, parentScene, false);
				if (gisMap != null) {
					gisMap.openMap({
						args: []
					});
				}
			}
        } catch (e) {
					console.info('error!!!!!',e)
        }

		//绑定地图切换事件
		that.bindEvent("openGisMap", that.openGisMap); //打开gis地图
		that.bindEvent("openGlobeMap", that.openGlobeMap); //打开globe地图
		//打开实景弹框时关闭二三维地图切换按钮 openMMSEyeCallback触发时弹框不一定打开故用openedMMSPanel
		that.bindEvent("openedMMSPanel", function(){
			if(mapSwich)
				mapSwich.hide();
		});

		that.bindEvent("closeMMSPanel", function(){
			if(mapSwich)
				mapSwich.show();
		});

		mapList[that.uniqueID] = that;
		mapArray.push(that);
	}
	/* 绑定事件 */
	that.bindEvent = function(msgId, msgHandler, stopOnTop) {
			if (scene == null)
				return;
			scene.on(msgPrefix + ":" + msgId, msgHandler, parentScene, stopOnTop);
			//同时把事件绑定到二三维地图
			if (globeMap != null) {
				globeMap.bindEvent(msgId, msgHandler, stopOnTop);
			}
			if (gisMap != null) {
				gisMap.bindEvent(msgId, msgHandler, stopOnTop);
			}
		}
		/* 触发事件 */
	that.fireEvent = function(msgId, msgData, stopOnTop) {
			if (scene == null)
				return;
			scene.fire(msgPrefix + ":" + msgId, msgData, parentScene, stopOnTop);
			//同时把事件绑定到二三维地图
			if (globeMap != null) {
				globeMap.fireEvent(msgId, msgData, stopOnTop);
			}
			if (gisMap != null) {
				gisMap.fireEvent(msgId, msgData, stopOnTop);
			}
		}
		/* 移除监听 */
	that.removeEventBind = function(msgId, stopOnTop) {
			if (scene == null)
				return;
			scene.remove(msgPrefix + ":" + msgId, parentScene, stopOnTop);
			//同时把事件绑定到二三维地铁图
			if (globeMap != null) {
				globeMap.removeEventBind(msgId, stopOnTop);
			}
			if (gisMap != null) {
				gisMap.removeEventBind(msgId, stopOnTop);
			}
		}
		/*需要在三维地图加载完成后再调用的方法*/
	that.callAfterGlobeLoaded = function(callback) {
		if(globeMap==null)
			return;
		if (globeMap.globeLoaded) {
			callback();
		} else {
			globeMap.bindEvent("globeLoadedCallback", callback, parentScene, false);
		}
	}

	// 更新二三维切换工具位置
	that.updateSwitchPosition = function(params) {
		if (mapSwich != null)
			mapSwich.updatePosition(params);
	}

	/*打开gis地图*/
	that.openGisMap = function(evt) {
		if (gisMap.gisLoaded && gisMap.gisVisible) {
			return;
		}
		//rotate: 是否先旋转三维地图，再切换到二维地图
		var rotate = true;

		var globeMapZoomToGisMap = function() {
			globeMap.getMapExtent(function(extent) {
				//获取到三维地图范围后再关闭三维地图
				if (globeMap != null) {
					globeMap.closeGlobe({
						args: []
					});
				}
				if (gisMap != null) {
					gisMap.openMap({
						args: []
					});
				}
				context.currentMapType = 'map';

				var newExtent = MapUtils.toLocalExtent(extent[0]);
				if (newExtent) {
					newExtent = that.reduceExtent_(newExtent);
					gisMap.zoomToExtent(newExtent.xmin, newExtent.ymin, newExtent.xmax, newExtent.ymax);
				}
			});
		}

		//如果gis地图加载好了，就直接同步地图范围；否则就在地图加载完成后同步地图范围
		if (gisMap.gisLoaded) {
			if (globeMap && globeMap.globeLoaded) {
				globeMap.getMapExtent(function(extent) {
					if (rotate) {
						globeMap.rotateScene(0.0, -90.0, 0.0, 0.5, globeMapZoomToGisMap);
					} else {
						globeMapZoomToGisMap();
					}

				});
			}
		} else {
			if (globeMap && globeMap.globeLoaded) {
				globeMap.bindEvent("globeLoadedCallback", function() {
					globeMap.getMapExtent(function(extent) {
						if (rotate) {
							globeMap.rotateScene(0.0, -90.0, 0.0, 0.5, globeMapZoomToGisMap);
						} else {
							globeMapZoomToGisMap();
						}
					});
				}, parentScene, false);
			}
		}
	}

	/*打开globe地图 */
	that.openGlobeMap = function(evt) {
		if (globeMap.globeLoaded && globeMap.globeVisible) {
			return;
		}
		if (gisMap != null) {
			gisMap.closeMap();
		}
		if (globeMap != null) {
			globeMap.openGlobe({
				args: []
			});
		}
		if (evt.args[0]) {
			if (gisMap && gisMap.gisLoaded) {
				that.callAfterGlobeLoaded(function() {
					globeMap.flyToFullGlobe(0.0);
				});
			}
			return;
		}

		var gisMapZoomToGlobeMap = function() {
			gisMap.getMapExtent(function(extent) {
				var newExtent = MapUtils.toLonLatExtent(extent[0]);
				if (newExtent) {
					globeMap.zoomToExtent(newExtent.xmin, newExtent.ymin, newExtent.xmax, newExtent.ymax, 0.0, true);
				}
			});
		}

		//如果globe地图加载好了，就直接同步地图范围；否则就在地图加载完成后同步地图范围
		if (gisMap && gisMap.gisLoaded) {
			that.callAfterGlobeLoaded(function() {
				gisMapZoomToGlobeMap();
			});
		}

		context.currentMapType = 'globe';
	}

	that.onGisMapMaxZoomCallback = function(params) {
		that.openGlobeMap();
	}

	
	that.callFunction = function(){
		if (scene == null)
			return;
		if (gisMap&&gisMap.zoomToExtent) {
			gisMap.zoomToExtent.apply(this, arguments);
		}

	}
	
	
	/* 切换到平移工具 */
	that.panMap = function() {
		if (scene == null)
			return;
		if (gisMap != null) {
			gisMap.panMap();
		}
	}

	/* 缩放到指定范围 */
	that.zoomToExtent = function(minX, minY, maxX, maxY) {
			if (scene == null)
				return;
			if (gisMap != null) {
				gisMap.zoomToExtent.apply(this, arguments);
			}

		}
		/* 缩放到指定中心点和级别 */
	that.centerAndZoom = function(x, y, level) {
		if (scene == null)
			return;
		if (gisMap != null) {
			gisMap.centerAndZoom.apply(this, arguments);
		}
		if (globeMap != null && level && level >0) {
			var lonlat = MapUtils.toLonLat(x, y);
			var height = 800 / (level + 1);
			globeMap.centerAndZoom(lonlat.x, lonlat.y, height);
		}
	}

	/* 缩放到全图范围 */
	that.zoomToFullExtent = function() {
			if (scene == null)
				return;
			if (gisMap != null) {
				gisMap.zoomToFullExtent();
			}
		}
		
	that.flyToPoint=function(x,y,height){
			if (scene == null)
				return;
			if (globeMap != null) {
				globeMap.flyToPoint(x,y,height);
			}
	}
	
	that.goUnderGround=function(height){
		if(scene == null)
			return;
			if (globeMap != null) {
			globeMap.goUnderGround(height);
			}
	}
		/* 绘制图形 */
	that.drawGraphic = function(graphic, zoom, clickCallback) {
		if (scene == null)
			return;
		if (gisMap != null) {
			gisMap.drawGraphic.apply(this, arguments);
		}
		if(globeMap != null&&graphic.globe!==false){
			var geometryValue=transGeometries(graphic.geometry);
			var graphictemp = MapUtils.deepClones(true,[], graphic);
			graphictemp.geometry=geometryValue;
			globeMap.drawGraphic(graphictemp, zoom, clickCallback);
		}
		}
		/* 清除指定图形 */
	that.clearGraphic = function(id, tag) {
		if (scene == null)
			return;
		if (gisMap != null) {
			gisMap.clearGraphic.apply(this, arguments);
		}
		if (globeMap != null) {
			globeMap.clearGraphic(id, tag);
		}
	}
		/* 清除全部图形 */
	that.clearAllGraphics = function(id) {
		if (scene == null)
			return;
		if (gisMap != null) {
			gisMap.clearAllGraphics.apply(this, arguments);
		}
		if (globeMap != null) {
			globeMap.clearAllGraphics(id);
		}
	}
		/* 在地图上标注 */
	that.pointSelect = function(symbolType, zoomFalg, callback) {
		if (scene == null)
			return;
		if (gisMap != null) {
			gisMap.pointSelect.apply(this, arguments);
		}
		if (globeMap != null) {
	
			globeMap.pointSelect(symbolType, zoomFalg, callback);
		}
	}


	/* 获取图形外部矩形 */
	that.getFeaturesExtent = function(features, callback) {
		if (scene == null)
			return;
		if (gisMap != null) {
			gisMap.getFeaturesExtent.apply(this, arguments);
		}
	}

	/* 显示图层树 */
	that.showLayerTree = function(openTree) {
		if (scene == null)
			return;
		if (gisMap != null) {
			gisMap.showLayerTree.apply(this,arguments);
		}
	}

	/* I查询 */
	that.identify = function(type, humanID, mapID) {
		if (scene == null)
			return;
		if (gisMap != null) {
			gisMap.identify.apply(this, arguments);
		}
	}

	/* 地理编码查询 */
	that.geoCode = function(searchStr, callback) {
		if (scene == null)
			return;
		if (gisMap != null) {
			gisMap.geoCode.apply(this, arguments);
		}
	}

	/* 逆地理编码查询 */
	that.getAddressByXY = function(x, y, searchStr, radius, callback) {
		if (scene == null)
			return;
		if (gisMap != null) {
			gisMap.getAddressByXY.apply(this, arguments);
		}
	}

	/* 根据坐标获取单元网格 */
	that.getCellNameByPosXY = function(x, y, gridType) {
		if (scene == null)
			return;
		if (gisMap != null) {
			gisMap.getCellNameByPosXY.apply(this, arguments);
		}
	}

	/* 根据图层字段定位显示 */
	that.locateFeatureByIDs = function(layerID, keyField, keyValue, clearMap, style, hStyle, bZoom, randomColor, labelfield, labelstyle, geometry, where, renderCanvas, singleSelected,options,extendProperty,layerTag) {
		if (scene == null)
			return;
		if (gisMap != null) {
			gisMap.locateFeatureByIDs.apply(this, arguments);
		}
		if(globeMap != null && gisMap!=null){
			//三维先调用queryFeature查询要素再用locateFeatureByCoords显示
			var keyvalueWhere='';
			if((!keyValue||keyValue.trim()=='')||(!keyField||keyField.trim()==''))
				keyvalueWhere='1=1';
			else{
				var keyValues = keyValue.split(",");
				for(var i=0;i<keyValues.length;i++)
				{
					keyvalueWhere = keyvalueWhere + " "+keyField +"='"+ keyValues[i]+"'"+" OR";
				}
				keyvalueWhere=keyvalueWhere.substring(0,keyvalueWhere.length-2);
			}
			var queryParam={
			 layerID:layerID,
			 where:where+" AND "+keyvalueWhere,
			 geometry:geometry,
			 outFields:labelfield,
			 outGeometry:true
			};
			var queryCallback=function(featureInfos){
			   // featureInfo的geometry作为绘制几何条件 attribute作为标注信息
				var featureInfo=featureInfos[0];
				if(!featureInfo)
				return;
				var geometriestemp=[];
				geometriestemp =MapUtils.deepClones(true,[], featureInfo);
				var geometries=[];
				for(var i=0;i<geometriestemp.length;i++)
				{
					if(geometriestemp[i].geometry) {
						geometriestemp[i].geometry.attributes=geometriestemp[i].attributes;
						geometries.push(geometriestemp[i].geometry);}
				}
				var geometryValue=transGeometries(geometries);
				var type=geometries[0].type;
				if(clearMap)
					globeMap.clearGraphicLayerByID('custom');
				globeMap.locateFeatureByCoords(geometryValue, type, keyValue, style, hStyle,bZoom,keyField,labelfield,labelstyle,randomColor);
			};
			gisMap.queryFeature(queryParam,queryCallback);
		}
	}

	/* 显示案件分布 */
	that.showRecListDistribution = function(infoJson, zoom, clickCallback, labelInfo,isShowLegend) {
		if (scene == null)
			return;
		if (gisMap != null) {
			gisMap.showRecListDistribution.apply(this, arguments);
		}
		if (globeMap != null) {
			//如果当前是二维地图这需要将二维坐标转换为经纬度
			var infoJson3d =MapUtils.deepClones(true, [], infoJson);
			var arrPnts = [];
			for (var i = 0; i < infoJson3d.length; i++) {
				arrPnts.push([Number(infoJson3d[i].coordinateX), Number(infoJson3d[i].coordinateY)]);
			}
			//批量坐标转换
			arrPnts = MapUtils.toLonLatArray(arrPnts);
			for (var j = 0; j < arrPnts.length; j++) {
				infoJson3d[j].coordinateX = arrPnts[j][0];
				infoJson3d[j].coordinateY = arrPnts[j][1];
			}
			that.callAfterGlobeLoaded(function() {
				globeMap.showRecListDistribution(infoJson3d, zoom, clickCallback, labelInfo);
			});
		}
	}

	/* 显示多个自定义图标 */
	that.showMultiObjectCurrentPosition = function(jsonInfo, zoom, bClear, hStyleID, infoStyle, bCanvas, tagName, clickCallback, mouseOverCallBack) {
		if (scene == null)
			return;
		if (gisMap != null) {
			gisMap.showMultiObjectCurrentPosition.apply(this, arguments);
		}
		if (globeMap != null) {
			if((typeof jsonInfo)=='string')
				jsonInfo=eval("("+jsonInfo+")");
			var infoCopy = MapUtils.deepClones(true, [], jsonInfo);
			var arrPnts = [];
			for (var i = 0; i < infoCopy.length; i++) {
				arrPnts.push([Number(infoCopy[i].x), Number(infoCopy[i].y)]);
			}
			//批量坐标转换
			arrPnts = MapUtils.toLonLatArray(arrPnts);
			for (var j = 0; j < arrPnts.length; j++) {
				infoCopy[j].x = arrPnts[j][0];
				infoCopy[j].y = arrPnts[j][1];
			}

			//三维地图可见，才做定位操作
			zoom = zoom && globeMap.globeVisible;
			that.callAfterGlobeLoaded(function() {
				globeMap.showMultiObjectCurrentPosition(infoCopy, zoom, bClear, hStyleID, clickCallback);
			});
		}
	}
	/* 获取地图的当前范围 */
	that.getMapExtent = function(callback) {
		if (scene == null)
			return;
		if (gisMap != null) {
			gisMap.getMapExtent.apply(this, arguments);
		}
	}

	/* 显示监督员 */
	that.showPatrolCurrentPosition = function(jsonInfo, zoom, bClear, hStyleID, clickCallback) {
		if (scene == null)
			return;
		if (gisMap != null) {
			gisMap.showPatrolCurrentPosition.apply(this, arguments);
		}
		if(globeMap != null){
			 var infoCopy = MapUtils.deepClones(true, [], jsonInfo);
			var arrPnts = [];
			for (var i = 0; i < infoCopy.length; i++) {
				arrPnts.push([Number(infoCopy[i].x), Number(infoCopy[i].y)]);
			}
			//批量坐标转换
			arrPnts = MapUtils.toLonLatArray(arrPnts);
			for (var j = 0; j < arrPnts.length; j++) {
				infoCopy[j].x = arrPnts[j][0];
				infoCopy[j].y = arrPnts[j][1];
			}
		that.callAfterGlobeLoaded(function() {
		   globeMap.showPatrolCurrentPosition(infoCopy, zoom, bClear, hStyleID, clickCallback);
			});
		}
	}

	/* 获取缓冲区 */
	that.getBuffer = function (layerID, x, y, radius,getBufferCallback){
		if (scene == null)
			return;
		if (gisMap != null) {
			gisMap.getBuffer.apply(this, arguments);
		}

	}


	/* 显示监督员责任网格 */
	that.showPatrolDutygridCells = function(infoJson, zoom, clickCallback) {
		if (scene == null)
			return;
		if (gisMap != null) {
			gisMap.showPatrolDutygridCells.apply(this, arguments);
		}
	}

	/* 标识位置 */
	that.markMap = function(projectTypeID, eventTypeID, actPropertyID, displayStyleID, layerID, clickCallback,cellIndexName,point) {
		if (scene == null)
			return;
		if (gisMap != null&& gisMap.gisVisible) {
			if(globeMap != null)
			   globeMap.removeMarkMapMouseHandler();
			gisMap.markMap.apply(this, arguments);
		}
		if(globeMap != null && globeMap.globeVisible && gisMap){
			//获取三维坐标
			var pointData;
			var eventInfo={
				actpropertyid: actPropertyID,
				displaystyleid: displayStyleID,
				eventtypeid: eventTypeID,
				projecttypeid: projectTypeID
			};
			var getdata=function(dataInfo){
				pointData=dataInfo;
				var getunitGrid=function(gridInfo){
					clickCallback&&clickCallback(gridInfo);
				};
				var unit=null;
				if(pointData) {
					var localPoint = MapUtils.toLocal(Number(pointData.longitude), Number(pointData.latitude));
					gisMap.markMap(projectTypeID, eventTypeID, actPropertyID, displayStyleID, layerID, getunitGrid, unit, localPoint);
				}
			}
		   globeMap.markMapXY(eventInfo,getdata);

		}
	}

	/* 显示特定图层 */
	that.showMapLayers = function(layerTag, showLevel, mode) {
		if (scene == null)
			return;
		if (gisMap != null) {
			gisMap.showMapLayers.apply(this, arguments);
		}

	}

	/* 案卷定位 */
	that.eventLocate = that.recLocate = function(eventID, defaultMapRange) {
		if (scene == null)
			return;
		if (gisMap != null) {
			gisMap.eventLocate.apply(this, arguments);
		}

	}

	/* 显示车辆人员轨迹 */
	that.showObjectTrace = function(objectID, symbolType, dateTime, queryCondition, hideControlPanel, symbolPic, optimizeParams, infoCallback, updatePositionCallback, closeCallback, traceDigCallback) {
		if (scene == null)
			return;
		if (gisMap != null&& gisMap.gisVisible) {
			gisMap.showObjectTrace.apply(this, arguments);
		}
		if (globeMap != null) {
			globeMap.showObjectTrace(objectID, symbolType, dateTime, queryCondition, hideControlPanel, symbolPic, optimizeParams, infoCallback, updatePositionCallback, closeCallback, traceDigCallback);
		}

	};
	
	/* 显示车辆人员轨迹热力的接口*/
	that.showTraceHeatMap = function(objectID, symbolType,starttime,endtime,queryCondition,hidePanel) {
		if (scene == null)
			return;
		if (gisMap != null&& gisMap.gisVisible) {
			gisMap.showTraceHeatMap.apply(this, arguments);
		}
	};

	/*添加车辆或人员轨迹*/
	that.addObjectTrace = function(jsonInfo, symbolType, clear, showControlPanel) {
		if (scene == null)
			return;
		if (gisMap != null) {
			gisMap.addObjectTrace.apply(this, arguments);
		}
	}
	
	/* 显示第三方上报人员轨迹 */
	that.showZzTaskTrace = function(objectID, symbolType, dataTime, queryCondition){
		if (scene == null)
			return;
		if (gisMap != null) {
			gisMap.showZzTaskTrace.apply(this, arguments);
		}
	}

	/* 绘制巡更路线 */
	that.showPatrolRoute = function(routeList, type, bClear, editable) {
		if (scene == null)
			return;
		if (gisMap != null) {
			gisMap.showPatrolRoute.apply(this, arguments);
		}
	}

	/* 添加巡更路线 */
	that.addPatrolRoute = function(addCallback, editCallback) {
		if (scene == null)
			return;
		if (gisMap != null) {
			gisMap.addPatrolRoute.apply(this, arguments);
		}
	}

	/* 删除巡更路线 */
	that.deletePatrolRoute = function(callback, withConfirm) {
			if (scene == null)
				return;
			if (gisMap != null) {
				gisMap.deletePatrolRoute.apply(this, arguments);
			}
		}
		
	 /* 获取正在编辑的路线 */
	that.getPatrolRouteEdit = function(callback) {
		if (scene == null)
			return;
		if (gisMap != null) {
			gisMap.getPatrolRouteEdit.apply(this, arguments);
		}
	}
	
	that.getStyles = function(type, styleType) {
		if (scene == null)
			return;
		if (gisMap != null) {
			return gisMap.getStyles.apply(this, arguments);
		}
}
	
/* 获取可见图层 */
that.getVisibleLayerIds = function (callback) {
			if (scene == null)
				return;
			if (gisMap != null) {
				gisMap.getVisibleLayerIds.apply(this, arguments);
			}
	}

	 
	that.identifyInfoWindow = function (usageID,keyValue,content,size) {
		if (scene == null)
			return;
		if (gisMap != null) {
			gisMap.identifyInfoWindow.apply(this, arguments);
		}
	}

	/* 更改工具条参数 */
	that.changeControlParam = function (id,param) {
		if (scene == null)
			return;
		if (gisMap != null) {
			gisMap.changeControlParam.apply(this, arguments);
		}
	}
/* 图层过滤显示 */
	that.setLayerDef = function (phyLayerID,layerDef) {
		if (scene == null)
			return;
		if (gisMap != null) {
			gisMap.setLayerDef.apply(this, arguments);
		}
	}
	
	that.setLayerColorDef=function(phyLayerIDs,colorDefs){
		if (scene == null)
			return;
		if (gisMap != null) {
			gisMap.setLayerColorDef.apply(this, arguments);
		}
	},

	/* 添加图形 */
	that.addGraphic = function(params, addCallback, editCallback) {
		if (scene == null)
			return;
		if (gisMap != null) {
			gisMap.addGraphic.apply(this, arguments);
		}
		if(globeMap!=null)
			globeMap.addGraphic(params, addCallback);
	}


	/* 编辑图形 */
	that.editGraphic = function(params, editCallback, deleteCallback) {
		if (scene == null)
			return;
		if (gisMap != null) {
			gisMap.editGraphic.apply(this, arguments);
		}
	}

	/* 区域饼图  */
	that.addCircleChart = function(name, data, color, param) {
		if (scene == null)
			return;
		if (gisMap != null) {
			gisMap.addCircleChart.apply(this, arguments);
		}
	}	
	
	that.drawGeometry = function(type, style, clear, callback,option) {
		if (scene == null)
			return;
		if (gisMap != null) {
			gisMap.drawGeometry.apply(this, arguments);
		}
		if(globeMap!=null){
			globeMap.drawGeometry(type, style, clear,callback,option);
		}
	}
	
	/* 显示矢量图层 */
	that.showVectorLayer = function(usageID, callback) {
		if (scene == null)
			return;
		if (gisMap != null) {
			gisMap.showVectorLayer.apply(this, arguments);
		}
	};

	/* 关闭矢量图层 */
	that.hideVectorLayer = function(layerID,serviceID) {
		if (scene == null)
			return;
		if (gisMap != null) {
			gisMap.hideVectorLayer.apply(this, arguments);
		}
	};

	/* 要素查询 */
	that.queryFeature = function(params, callback) {
		// 移除监听
		if (scene == null)
			return;
		if (gisMap != null) {
			gisMap.queryFeature.apply(this, arguments);
		}
	}
	
	 /* 热力图*/
	that.addHeatMap = function(data, option) {
		if (scene == null)
			return;
		if (gisMap != null) {
			gisMap.addHeatMap.apply(this, arguments);
		}
	}
	
	that.addGlobeHeatMap =function(data){
		if (scene == null)
			return;
		if(globeMap!=null){
			globeMap.addGlobeHeatMap(data);
		}			
	}

	/* 聚类 */
	that.addClusterLayer = function(data) {
		if (scene == null)
			return;
		if (gisMap != null) {
			gisMap.addClusterLayer.apply(this, arguments);
		}
		if(globeMap!=null){
			var datacopy=MapUtils.deepClones(true, [], data);
			 datacopy.data=transGeometries(data.data)
			globeMap.addClusterLayer(datacopy);
		}
	}
	
	 /* 添加热区图层 */
	that.addHotLayer = function (layerUsageID, outFields, visiblelevel, clickCallback) {
		if (scene == null)
			return;
		if (gisMap != null) {
			gisMap.addHotLayer.apply(this, arguments);
		}
		
	}
	
	 /* 添加等值线图 */
	that.addKrigingMap = function (datalist, options) {
		if (scene == null)
			return;
		if (gisMap != null) {
			gisMap.addKrigingMap.apply(this, arguments);
		}
	}

	/* 图层查询 */
	that.queryPhylayerFeatures = function(params, callback) {
		if (scene == null)
			return;
		if (gisMap != null) {
			gisMap.queryPhylayerFeatures.apply(this, arguments);
		}
	}

	/* 显示消息框 */
	that.showInfoWindow = function(params) {
		if (scene == null)
			return;
		if (gisMap != null) {
			gisMap.showInfoWindow.apply(this, arguments);
		}
	}
	
	/* 隐藏消息框 */
	that.hideInfoWindow = function (params) {
		if (scene == null)
			return;
		if (gisMap != null) {
			gisMap.hideInfoWindow.apply(this, arguments);
		}
	}
	
	/* 设置消息框样式 */
	that.setInfoWindowStyle = function (params) {
		if (scene == null)
			return;
		if (gisMap != null) {
			gisMap.setInfoWindowStyle.apply(this, arguments);
		}
	}
	/**
	 * 地图上弹出InfoWindow，可向infowindow容器中传入class，并导入cssfile实现风格自定义
	 * 特别注意，cssfile中对infowindow的定义要都在传入的class下定义，一般不建议使用
	 * @param visible
	 * @param x
	 * @param y
	 * @param title
	 * @param content
	 * @param clickHandlerItems
	 * @param cls
	 * @param cssfile
	 * @param mark
	 *egovagis新版本将上述参数改为params对象
	 */
	that.showInfoWindowEx = function(params) {
		if (scene == null)
			return;
		if (gisMap != null) {
			gisMap.showInfoWindowEx.apply(this, arguments);
		}
	}

	/* 显示扩展消息框 */
	that.hideInfoWindowEx = function (id) {
		if (scene == null)
			return;
		if (gisMap != null) {
			gisMap.hideInfoWindowEx.apply(this, arguments);
		}
	}
	
	that.showPatrolCurrentPosition = function(jsonInfo, zoom, bClear, hStyleID, clickCallback) {
		if (scene == null)
			return;
		if (gisMap != null) {
			gisMap.showPatrolCurrentPosition.apply(this, arguments);
		}
	}

	that.queryObjectInfo = function (geoShapes, tableName, xFieldName, yFieldName, callback, usePage, currentPage, numPerPage){
		if (!scene)
			return;
		if (gisMap)
			gisMap.queryObjectInfo.apply(this, arguments);
	}

	that.enableMapSnap = function (layerID, callback){
		if (!scene) return;
		if(gisMap)
			gisMap.enableMapSnap.apply(this, arguments);
	}

	that.disableMapSnap = function (layerID) {
		if (!scene) return;
		if(gisMap)
			gisMap.disableMapSnap.apply(this, arguments);
	}
	
	/* 根据PointID定位空中全景 */
	that.mmsAirPanoLocateByID = function(pointID) {
		if (scene == null)
			return;
		if (gisMap != null) {
			gisMap.mmsAirPanoLocateByID.apply(this, arguments);
		}
	}
	
	/* 空中全景历史对比回调 */
	that.mmsAirPanoCompare = function(callback) {
		if (scene == null)
			return;
		if (gisMap != null) {
			gisMap.mmsAirPanoCompare.apply(this, arguments);
		}
	}
	
	that.setMMSEyePositionTest = function(x,y) {
		if (scene == null)
			return;
		if (gisMap != null) {
			gisMap.setMMSEyePositionTest.apply(this, arguments);
		}
	}

	/* 获取图层信息 */
	that.getPhyLayerInfo= function(phyLayerID,getPhyLayerInfoCallBack) {
		if (scene == null)
			return;
		if(gisMap!=null)
			gisMap.getPhyLayerInfo.apply(this, arguments);
	}

	/* 获取图层字段信息 */
	that.getPhyLayerField= function(phyLayerIDs,getPhyLayerFieldCallback) {
		if (scene == null)
			return;
		if(gisMap!=null)
			gisMap.getPhyLayerField.apply(this, arguments);
	}
	
	/*对几何图形进行缓冲*/
	that.getGeometryBuffer=function(geometry,radius,callback){
		if (scene == null)
			return;
		if(gisMap!=null)
			gisMap.getGeometryBuffer.apply(this, arguments);
	}

	/* 显示视频闪烁点*/
	that.addVideoAlarm = function(coordX, coorY, successFunc, hitCallback) {
		if (scene == null)
			return;
		if (globeMap != null)
			globeMap.addVideoAlarm(coordX, coorY, successFunc, hitCallback);
	}

	that.createPanelInfo = function(entity, successFunc) {
		if (scene == null)
			return;
		if (globeMap != null)
			globeMap.createPanelInfo(entity, successFunc);
	}

	that.createAnimateCar = function(objectID, successFunc) {
		if (scene == null)
			return;
		if (globeMap != null)
			globeMap.createAnimateCar(objectID, successFunc);
	}

	/*根据id号删除一个视频闪烁点*/
	that.removeVideoAlarm = function(id) {
		if (scene == null)
			return;
		if (globeMap != null)
			globeMap.removeVideoAlarm(id);
	}

	that.addChart = function(options, zoom) {
		if (scene == null)
			return;
		if(gisMap!=null)
			gisMap.addChart.apply(this, arguments);
		if (globeMap!= null)
			that.callAfterGlobeLoaded(function() {
				globeMap.addChart(options, zoom);
			});
	}

	/**
	 * 删除三维柱状图
	 */
	that.removeChart = function() {
			if (scene == null)
				return;
			if (globeMap != null)
				globeMap.removeChart();
		}
		/**
		 * 点击查询模型信息
		 * @param callback
		 */
	that.queryModelInfo = function(callback) {
		if (scene == null)
			return;
		if (globeMap != null)
			globeMap.queryModelInfo(callback);
	}
	
	that.Plat2lonLat=function(positions,callback){
		  if (scene == null)
			return;
		if (globeMap != null)
			globeMap.Plat2lonLat(positions,callback);
	}
	//地面开挖
	that.digsuface=function(positions,depth,callback){
		if (scene == null)
			return;
		if (globeMap != null)
			globeMap.digsuface(positions,depth,callback);
	}
	//清除地面开挖
	that.removeDigsuface=function(){
		if (scene == null)
			return;
		if (globeMap != null)
			globeMap.removeDigsuface();
	}
	
	that.clearDrawGeometry=function(){
		if (scene == null)
			return;
		if (globeMap != null)
			globeMap.clearDrawGeometry();
	}
	/*坐标转换平面坐标转经纬度*/
	that.toLonLatArray=function(positions){
		if (scene == null)
		   return;
		   var lonlat = MapUtils.toLonLatArray(positions);
		   return lonlat;
	}
	
	/*经纬度转平面坐标 -----输入形式 [[100.0, 0.0], [101.0, 1.0]]*/
	that.toLocalArray=function(positions){
		if (scene == null)
		   return;
		   var local= MapUtils.toLocalArray(positions);
		   return local;
	}
	
	   /*二维geometry坐标转换*/
	function transGeometries(geometries){
		var geometriestemp=[];
		var pointtemp=[];
		if(!(geometries instanceof Array))
			geometriestemp=MapUtils.deepClones(true,[],[geometries]);
		else
			geometriestemp = MapUtils.deepClones(true,[],geometries);
		for (var i = 0; i < geometriestemp.length; i++) {
			var geometriesobj = geometriestemp[i];
			if (geometriesobj.rings != undefined) {
				for (var j = 0; j < geometriesobj.rings.length; j++) {
					var ring = geometriesobj.rings[j];
					var ringtemp = [];
					var ringfinal=[];
					for (var pnum = 0; pnum < ring.length; pnum++)
						ringtemp.push([Number(ring[pnum][0]), Number(ring[pnum][1])]);
						var lonlat = MapUtils.toLonLatArray(ringtemp);
					for(var templ=0;templ<lonlat.length;templ++)
						ringfinal.push([lonlat[templ][0], lonlat[templ][1]]);
					geometriesobj.rings[j] = ringfinal;
				}

			}
			if (geometriesobj.paths != undefined) {
				for (var j = 0; j < geometriesobj.paths.length; j++) {
					var paths = geometriesobj.paths[j];
					var pathtemp = [];
					var pathfinal=[];
					for (var pnum = 0; pnum < paths.length; pnum++)
						pathtemp.push([Number(paths[pnum][0]), Number(paths[pnum][1])]);
					 var lonlat=MapUtils.toLonLatArray(pathtemp);
					for(var templ=0;templ<lonlat.length;templ++)
						pathfinal.push([lonlat[templ][0], lonlat[templ][1]]);
					geometriesobj.paths[j] = pathfinal;
				}
			}
			if(geometriesobj.x != undefined&&geometriesobj.y != undefined){
				pointtemp.push([Number(geometriesobj.x), Number(geometriesobj.y)]);
			}
		}
		if(pointtemp.length>0){
			var lonlat=MapUtils.toLonLatArray(pointtemp);
			for(var temp=0;temp<lonlat.length;temp++)
			{
			   geometriestemp[temp].x=lonlat[temp][0];
				geometriestemp[temp].y=lonlat[temp][1];
			}
		}
		if(!(geometries instanceof Array))
			return geometriestemp[0];
		return geometriestemp;
	}
	/*根据要素坐标定位显示要素*/
	that.locateFeatureByCoords=function(geometries, type, ID, style, hStyle, zoom){
		if (scene == null)
			return;
		if(gisMap!=null)
			gisMap.locateFeatureByCoords.apply(this, arguments);
		if (globeMap!= null) {
			//二维坐标转化为经纬度
			var geometriestemp=transGeometries(geometries);
			globeMap.locateFeatureByCoords(geometriestemp, type, ID, style, hStyle, zoom);
		}

	}

	that.addMaskLayer = function(layerID,keyField,values,style,zoom) {
		if (scene == null)
			return;
		if(gisMap!=null)
			gisMap.addMaskLayer.apply(this, arguments);
	}

	/* 切换地图类型 */
	that.changeControlParam = function (type, param) {
		if (scene == null)
			return;
		if (gisMap != null) {
			gisMap.changeControlParam.apply(this, arguments);
		}
	}
	/*===============以下为私有方法=============*/

	//YSP：为了抵消二维地图默认定位到更低层级，缩小传入二维地图的范围
	that.reduceExtent_ = function(extent) {
		var factor = 0.55;
		var centerx = (extent.xmin + extent.xmax) / 2.0;
		var centery = (extent.ymin + extent.ymax) / 2.0;
		var lenx = extent.xmax - extent.xmin;
		var leny = extent.ymax - extent.ymin;
		var deltax = lenx * factor * 0.5;
		var deltay = leny * factor * 0.5;
		return {
			"xmin": centerx - deltax,
			"ymin": centery - deltay,
			"xmax": centerx + deltax,
			"ymax": centery + deltay
		};
	}

	//在三维地图中获取所显示的模型信息
	that.getSelectedLayerinfo=function (name,callback) {
		if(globeMap!=null){
			globeMap.getSelectedLayerinfo(name,callback);
		}
	}

	//三维地图点击模型事件
	that.addPickHandler=function (callback) {
		if (scene == null)
			return;
		if(globeMap!=null){
			globeMap.addPickHandler(callback);
		}
	}
	that.addRightClickHandler=function(callback){
		 if (scene == null)
			return;
		if(globeMap!=null){
			that.callAfterGlobeLoaded(function() {
			globeMap.addRightClickHandler(callback);
			});
		}
	}
	//模型查询事件
	that.pickModel=function(callback){
		if (scene == null)
			return;
		if(globeMap!=null){
			globeMap.pickModel(callback);
		}
	}

	/* 移除图层*/
	that.removeLayer = function(){
		if (scene == null)
			return;
		
		if (gisMap != null) {
			gisMap.removeLayer.apply(this, arguments);
		}
	}
	
	that.initMap(containerID, callback, mapType, mapConfig);
}

var EGovaMapUtils = {
	setDefaultMapID: function(id) {
		defaultMapID = id;
	},
	getDefaultMapID: function() {
		return defaultMapID;
	},
	//获取带有域名的地址,不支持已分号开头的多个地址
	// getServerUrl:function(url){
	// 	if(url==undefined){
	// 		url=context.gisServerURL;
	// 	}
	// 	if(url.indexOf("http")==0){
	// 		return url;
	// 	}else{
	// 		return context.originPath + url;
	// 	}
	// },
	//mapType为globe或者map，分别初始化为二维地图和三维地图
	getInstance: function(container, callback, mapConfig, mapType, mapParam,context) {
		// 不传containerID的时候默认返回第一个地图
		container =container||defaultMapID;
		container = getMapContainer(container);
		var uniqueID = getUniqueID(container);
		 if (mapList[uniqueID])
			return mapList[uniqueID];
		else {
			return new EGovaMap(container, callback, mapConfig, mapType, mapParam,context);
		}
	},
	releaseInstance: function(container) {
		container = getMapContainer(container);
		var uniqueID = getUniqueID(container);
		if (mapList[uniqueID]) {
			for (var i = mapArray.length-1; i >=0 ; i--) {
				if (mapArray[i] === mapList[uniqueID]) {
					delete mapArray[i];
					break;
				}
			}
			delete mapList[uniqueID];
		}
	}
}
export default EGovaMapUtils;