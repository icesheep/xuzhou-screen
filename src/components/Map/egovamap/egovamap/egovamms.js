var scene = null;

function checkServerURL(url,callback){
	var proxyList = url.split(";");
	if(proxyList.length<=1){
		window.eUrban.global.mmsServerURL = url;
		callback();
		return ;
	}
	var params = {isLoad:false};
	for(var i in proxyList){
		checkProxy(proxyList[i],params,callback);
	}
}

function checkProxy(proxyUrl,params,callback) {
	var img = new Image();
	if(proxyUrl.indexOf("http://")<0){
		proxyUrl = window.location.origin+"/"+proxyUrl;
	}
	img.src = proxyUrl + '/symbol/1_1_1.png';
	img.onload = function (e1) {
		if(!params.isLoad){
			params.isLoad = true;
			window.eUrban.global.mmsServerURL = proxyUrl;
			callback();
		}
		img = null;
	};
}

var EGovaMMSMap = function($container, pScene, prefix, mmsParams, mapConfig, mmsType) {
	var that = this;
	scene = pScene;
	var parentScene = "parentScene" || "MMSMap";
	var msgPrefix = prefix || "MMS";
	var proxyURL = window.eUrban.global.rootPath + "/home/gis/proxy.htm";

	that.mmsVisible = false;
	that.mmsLoaded = false;
	that.isLoading = false;
	that.mapConfig = mapConfig;
	that.mmsType = mmsType;
	that.$mmsMapFrame = null;
	that.mmsMapContainer = null;
	that.mapContainer = null;
	that.curPointX = null;
	that.curPointY = null;
	that.mmsMapContainer = $container.getElementsByClassName(".mmsmap-container")[0];
	
	if (that.mmsMapContainer) {
		var mmsMapHTML = '<iframe class="mmsmap-iframe" webkitAllowFullScreen="true" mozallowfullscreen="true"  allowFullScreen="true"></iframe>';
		var element = document.createElement("div");
		element.classList.add("mmsmap-container");
		element.innerHTML = mmsMapHTML;
		$container.append(element);
		that.mmsMapContainer = element;
	}
	that.$mmsMapFrame = that.mmsMapContainer.getElementsByClassName("mmsmap-iframe")[0];
	that.mapContainer = $container.getElementsByClassName("emap-container")[0];

	that.init = function() {
		if (!that.isLoading) {
			that.isLoading = true;
			if(that.mmsType == 1) {
				checkServerURL(mmsParams.mmsServerURL, function () {
					var mmsAPIURL = window.eUrban.global.mmsServerURL + '/library/mms/api/MMSAPI.js';
					var mmsCCDPicURL = window.eUrban.global.mmsServerURL + '/mmspic/Image';
					var mmsSymbolURL = window.eUrban.global.mmsServerURL + '/symbol';
					var mmsWsdlURL = window.eUrban.global.mmsServerURL + '/ws/MMSInspector?wsdl';

					var mmsConfig = { panoID : "eGovaMMS",
						mmsApiUrl: mmsAPIURL, mmsServerUrl : window.eUrban.global.mmsServerURL,
						mmsPicUrl : mmsCCDPicURL, mmsSymbolUrl : mmsSymbolURL,
						mediaRootUrl : mmsParams.mmsMediaURL,
						mmsWsdlUrl: mmsWsdlURL,
						proxyUrl : proxyURL };
					var prefix = 'msgPrefix=' + msgPrefix + '&parentScene=' + parentScene + '&proxyUrl=' + proxyURL;
					for (var item in mmsConfig) {
						prefix += "&" + item + "=" + mmsConfig[item];
					}
					if(typeof mmsParams.simpleMode !== 'undefined') {
						prefix = prefix + '&simpleMode=true';
					}

					//违建系统无底部工具栏
					var pageUrl = window.document.URL;
					var bottom = 20;
					if(pageUrl.indexOf('ibmain')>0) {
						bottom = -10;
					}

					var mmsMapUrl = window.eUrban.global.rootPath + "/library/urban/egovamap/mms.jsp?" + prefix;
					if(msgPrefix == 'mappage0' || msgPrefix == 'egovamappage0_gis'){
						//仅主页上的实景设置控件样式
						mmsMapUrl += '&navi={visible:true,left:20,top:60}&toolbar={visible:true,top:60}&footer={visible:true,bottom:' + bottom + '}&toolBarDefine=104,105';
					}else{
						mmsMapUrl += '&navi={visible:true,left:10,top:20}&toolbar={visible:true,top:20}&toolBarDefine=104,105';
					}
					var encodeUrl = encodeURI(mmsMapUrl);
					that.$mmsMapFrame.src = encodeUrl;
				});
			}
			else if(that.mmsType == 2) {
				//立得实景
				var mapHTML = '<div id="desktop-closemms"><div class="desktop-closemms-img"></div><div class="desktop-closemms-tips">关闭实景</div></div>';
				$container.append(mapHTML);

				that.desktopclosemms = $container.find("#desktop-closemms");
				if(that.desktopclosemms !== 'undefined'){
					that.desktopclosemms.click(function(e){
						that.desktopclosemms[0].style.display = 'none';
						that.closeMMS();
					});
				}
			}
		}

		if(that.mapContainer) {
			that.mapContainer.onmouseover = function(evt) {
				if (that.mmsVisible) {
					that.mapContainer.style.height = '300px';
				}
			};
			that.mapContainer.onmouseout = function(evt) {
				if (that.mmsVisible) {
					that.mapContainer.style.height = '140px';
				}
			};
		}

		//绑定地图事件
		that.bindEvent("setMMSEyePreviewCallback", that.setMMSEyePreview);  //地图眼睛拖动预览回调
		that.bindEvent("setMMSEyePositionCallback", that.setMMSEyePosition);  //地图眼睛点击回调
		that.bindEvent("setMMSEyePositionAngleCallback", that.setMMSAngle);  //地图眼睛转动回调
		//that.bindEvent("identifyPartCallback", that.identifyPart);  //地图点击部件回调
		// 实景加载完毕后
		that.bindEvent("mmsLoadedCallback", that.onMmsLoaded);
		that.bindEvent("mmsAirPanoLocateCallback", that.mmsAirPanoLocateByID);
		that.bindEvent("mmsAirPanoCompareCallback", that.setAirPanoCompare);
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

	that.dispatchSceneEvent = function(msgId, msgData) {
		if (scene == null)
			return;
		scene.fire(msgPrefix + ":" + msgId, { args : msgData }, parentScene, false);
	}

	that.onMmsLoaded = function() {
		that.mmsLoaded = true;
		console.info("----------mmsLoadedCallback");
		//绑定实景事件
		that.bindEvent('setPanoEyePreviewCallback', that.setGISEyePreview); // 实景预览回调
		that.bindEvent('getlocateroutemmspointsCallback', that.drawTrackLine); // 实景定位回调
		that.bindEvent('getlocatemmspointsCallback', that.setGISEyePosition); // 实景位置更新回调
		that.bindEvent('panorotateCallback', that.setGISEyeAngle); // 实景转动回调
		that.bindEvent('partClickCallback', that.panoPartClick);  //地图点击部件回调

		// that.bindEvent('eventClickCallback', eventClick);
		that.bindEvent('mmsClosePanoCallback', that.closeMMS);
		that.bindEvent('mmsFullScreenCallback', that.fullScreenMMS);
		// flex
		that.bindEvent('mmsInitCompleteCallback', that.mmsFlexInitComplete);
	}

	/**
	 * 实景窗口关闭
	 */
	that.closeMMS = function(evt) {
		that.mmsVisible = false;
		that.mmsMapContainer.style.height = '0';

		if(that.mapContainer) {
			that.mapContainer.style.height = '100%';
			that.mapContainer.style.width = '100%';
			that.mapContainer.style.bottom = '0px';
			that.mapContainer.style.right = '0px';
			that.mapContainer.style.backgroundColor = '#ffffff';
			
			that.dispatchSceneEvent('clearGraphic', [ "MMSFeature" ]);
			that.dispatchSceneEvent('clearGraphic', [ "", "mms" ]);

			//恢复地图工具条
			var param = {visible:true};
			that.fireEvent("changeControlParam", {args:["toolbar", param]});
			if (that.mapConfig && that.mapConfig.params) {
				var params = that.mapConfig.params;
				if (params["geocode"]) {
					var type ="geocode";
					that.fireEvent("changeControlParam", {args:[type, param]});
				}
			}

			//触发实景弹框关闭事件
			that.fireEvent("closeMMSPanel", {args:[]});

			//地图重新缩放定位到原来的中心点
			setTimeout(center, 800);
			function center() {
				if(that.curPointX != null && that.curPointY != null){
					that.dispatchSceneEvent('centerAndZoom', [that.curPointX, that.curPointY]);
				}
			}
		}
	}

	/**
	 * 实景窗口最大化
	 */
	that.fullScreenMMS = function() {
		if(that.mapContainer) {
			that.mapContainer.style.width = '333px';
			that.mapContainer.style.height = '140px';
		}
	}

	that.showMMSView = function() {
		if(that.mmsMapContainer) {
			that.mmsVisible = true;
			that.mmsMapContainer.style.height = '100%';
			that.mmsMapContainer.style.display = 'block';
		}
	}

	/** *****************************GIS地图调用MMS地图************************ */
	/**
	 * 实景预览
	 * 
	 * @param res
	 */
	that.setMMSEyePreview = function(evt) {
		var res = evt.args;
		var pos = res[0];
		var x = pos.x;
		var y = pos.y;
		// EGovaMMSAPI.setMMSEyePreview(x, y);
		if(that.mmsType == 1){
			that.dispatchSceneEvent('setPanoEyePreview', [ x, y ]);
		}else if(that.mmsType == 2){
			that.$mmsMapFrame.contentWindow.trueVision.showVisionByLngLat(x, y);
		}
	}

	/**
	 * 响应地图点击，触发实景定位
	 * 
	 * @param res
	 */
	that.setMMSEyePosition = function(evt) {
		if(that.mmsType == 1){
			if(!that.mmsLoaded) {
				console.error("----------mmsLoaded:failed!");
				return;
			}
		}
		var res = evt.args;
		if (!that.mmsVisible) {// 初次定位时调整布局
			that.mmsVisible = true;
			that.mmsMapContainer.style.height = '100%';
			// that.mmsMapContainer.style.top = "0px";
			// that.mmsMapContainer.style.bottom = "0px";
			that.mmsMapContainer.style.display = 'block';

			if(that.mapContainer) {
				that.mapContainer.style.height = '140px';
				that.mapContainer.style.width = '333px';
				that.mapContainer.style.backgroundColor = '#F2EFE9';
				that.mapContainer.style.bottom = '30px';   //msgPrefix == 'mappage0' ? '57px' : '25px';
				that.mapContainer.style.right = '1px';
				//隐藏地图工具条
				that.fireEvent("changeControlParam", {args:["toolbar", {visible:true,items:'zoomin,zoomout,pan,fullextent,mmseye'}]});
				that.fireEvent("changeControlParam", {args:["geocode", {visible:false}]});
				//触发实景弹框已打开事件
				that.fireEvent("openedMMSPanel", {args:[]});
			}
		}
		var pos = res[0];
		var x = pos.x;
		var y = pos.y;
		// EGovaMMSAPI.mmsPanoLocateByXY(x, y);
		if(that.mmsType == 1){
			that.dispatchSceneEvent('mmsPanoLocateByXY', [ x, y ]);   //mmsAirPanoLocate
		}else if(that.mmsType == 2){
			that.desktopclosemms[0].style.display = 'block';
			if(!that.mmsLoaded){
				that.$mmsMapFrame.src = window.eUrban.global.rootPath +"/other/mms/truemap/TrueVisionDMI/trueVision/index.htm?x=" + x + "&y=" + y;
				that.mmsLoaded = true;
			}else{
				that.$mmsMapFrame.contentWindow.truevision.showVisionByLngLat(x, y);
			}
		}
	}

	/**
	 * 响应地图眼睛拖动事件，触发实景旋转
	 * 
	 * @param res
	 */
	that.setMMSAngle = function(evt) {
		if(!that.mmsLoaded) {
			return;
		}
		var res = evt.args;
		var angle = res[0].angle;
		// EGovaMMSAPI.rotationView(angle);
		that.dispatchSceneEvent('rotatePanoView', [ angle ]);
	}

	/**
	 * i查询
	 * 
	 * @param res
	 */
	that.identifyPart = function(evt) {
		if(!that.mmsLoaded) {
			return;
		}
		var res = evt.args;
		// EGovaMMSAPI.mmsPartLocateByObjectCode(res[0], res[1].x,
		// res[1].y);
		that.dispatchSceneEvent('mmsPartLocateByObjectCode', [ res[0], res[1].x, res[1].y ]);
	}

	/** *******************************MMS地图调用GIS地图********************************** */
	/**
	 * 响应实景组件预览事件，触发地图事件显示实景缩略图
	 * 
	 * @param res
	 */
	that.setGISEyePreview = function(evt) {
		that.dispatchSceneEvent('setMMSEyePreview', evt.args);
	}

	/**
	 * 响应实景组件定位后，在地图绘制实景轨迹线
	 * 
	 * @param res
	 */
	that.drawTrackLine = function(evt) {
		var points = evt.args;
		var length = points.length;
		var feature = [], trackPoint;
		for ( var i = 0; i < length; i++) {
			trackPoint = {};
			trackPoint.x = Number(points[i].x);
			trackPoint.y = Number(points[i].y);
			feature.push(trackPoint);
		}
		var style = { "type" : "esriSMS", "style" : "esriSMSCircle", "color" : [ 255, 0, 0, 255 ], "size" : 8 };
		that.dispatchSceneEvent('clearAllGraphics', []);
		// that.dispatchSceneEvent('centerAndZoom', [matchPoint.x,
		// matchPoint.y, 5]);
		that.dispatchSceneEvent('locateFeatureByCoords', [ feature, 'polygon', 'MMSFeature', style, style, false ]);
	}

	/**
	 * 响应实景点变换后，更新地图
	 * 
	 * @param res
	 */
	that.setGISEyePosition = function(evt) {
		var data = evt.args;
		that.curPointX = data[0].x;
		that.curPointY = data[0].y;
		that.dispatchSceneEvent('clearGraphic', [ 'labelFeature' ]);
		that.dispatchSceneEvent('setMMSEyePosition', [ data[0].x, data[0].y, data[1] ]);
		// dispatchSceneEvent('centerAndZoom', [data[0].x, data[0].y], 5);
		setTimeout(center, 800);
		function center() {
			that.dispatchSceneEvent('centerAndZoom', [ data[0].x, data[0].y ], 5);
		}
	}

	/**
	 * 响应实景旋转，触发地图眼睛转动
	 * 
	 * @param res
	 */
	that.setGISEyeAngle = function(evt) {
		var data = evt.args;
		if (!data.length) {
			data = [ data ];
		}
		that.dispatchSceneEvent('setMMSEyePosition', data);
	}

	/**
	 * 实景中点击部件标注，触发地图高亮显示
	 * 
	 * @param res
	 */
	that.panoPartClick = function(evt) {
		var data = evt.args;
		var layerID = data[0];
		var x = data[1];
		var y = data[2];
		var uniqueCode = data[3];
		var label = [ { x : x, y : y } ];
		var style = { "type" : "esriSMS", "style" : "esriSMSCircle", "color" : [ 0, 0, 255, 255 ], "size" : 12 };
		that.dispatchSceneEvent('clearGraphic', [ 'labelFeature' ]);
		that.dispatchSceneEvent('locateFeatureByCoords', [ label, 'polygon', 'labelFeature', style, style, true ]);
		that.dispatchSceneEvent('showMapLayers', [ 10634, 5, 0 ]);// 需与GIS统一layerid
	}

	/**
	 * 实景flex客户端初始化后回调函数
	 * 
	 * @param res
	 */
	that.mmsFlexInitComplete = function(returnStr) {
//			alert("mmsInitCompleteCallback");
	}
	
	that.locateEvent = function(eventID, x, y, z) {
		that.dispatchSceneEvent('locateEvent',[eventID, x, y, z]);
	}

	that.mmsAirPanoLocateByID = function(evt) {
		var res = evt.args;
		if (!that.mmsVisible) {// 初次定位时调整布局
			that.mmsVisible = true;
			that.mmsMapContainer.style.height = '100%';
			// that.mmsMapContainer.style.top = "0px";
			// that.mmsMapContainer.style.bottom = "0px";
			that.mmsMapContainer.style.display = 'block';

			if(that.mapContainer) {
				that.mapContainer.style.height = '140px';
				that.mapContainer.style.width = '333px';
				that.mapContainer.style.backgroundColor = '#F2EFE9';
				that.mapContainer.style.bottom = '30px';  //msgPrefix == 'mappage0' ? '57px' : 
				that.mapContainer.style.right = '1px';
				//隐藏地图工具条
				that.fireEvent("changeControlParam", {args:["toolbar", {visible:true,items:'zoomin,zoomout,pan,fullextent,mmseye'}]});
				that.fireEvent("changeControlParam", {args:["geocode", {visible:false}]});
			}
		}
		var pointID = res[0];
		// EGovaMMSAPI.mmsAirPanoLocateByID(pointID);
		that.dispatchSceneEvent('mmsAirPanoLocateByID', [pointID]);
	}

	that.setAirPanoCompare = function(evt) {
		var callback = evt.args[0];
		that.dispatchSceneEvent('setAirPanoCompareCallback', [callback]);
	}
	
	that.init();
}
export default EGovaMMSMap;