import './mapswich.css';
import $ from 'jquery';

var scene = null;
var defaultSettings = {
	right: 0,
	bottom: 0,
	left: null,
	top: null
};

var MapSwich = function ($container, settings, pScene, prefix,context) {
	var that = this;
	scene = pScene;
	var parentScene = pScene.pageId || "parentScene";
	var msgPrefix = prefix;
	that.$mapSwichContainer = null;
	that.settings = {};
	for(var i in defaultSettings){
		that.settings[i] = defaultSettings[i];
	}
	for(var i in settings){
		that.settings[i] = settings[i];
	}

	that.init = function () {
		that.$mapSwichContainer =$container.getElementsByClassName("mapType-wrapper")[0];
		if (!that.$mapSwichContainer) {
			that.$mapSwichContainer = document.createElement("div");
			that.$mapSwichContainer.id = "mapType-wrapper";
			that.$mapSwichContainer.classList.add("mapType-wrapper");
			   var mapSwichHTML='<div class="mapTypeNoMms">' +
				'<div class="mapTypeCard gis"><span>二维</span></div>' +
				'<div class="mapTypeCard globe"><span>三维</span></div>' +
				'</div>';
			that.$mapSwichContainer.innerHTML = mapSwichHTML;
			$container.append(that.$mapSwichContainer);
		}
		that.$mapType =that.$mapSwichContainer.getElementsByClassName("mapTypeNoMms")[0];
		var $bntgis = that.$mapSwichContainer.getElementsByClassName("gis")[0];
		var $bntglobe = that.$mapSwichContainer.getElementsByClassName("globe")[0];
		that.$mapSwichContainer.onmouseover=function () {
			 that.$mapSwichContainer.classList.add("expand");
		};

		that.$mapSwichContainer.onmouseleave=function () {
			 that.$mapSwichContainer.classList.remove("expand");
		};
		updateMaptype();

		function updateMaptype() {
			if (context.currentMapType == "map") {
				$bntgis.classList.add("active");
				$bntglobe.classList.remove("active");
				$bntgis.remove()
				that.$mapType.append($bntgis);
				/*that.updatePosition({
					bottom: 0
				});*/
			} else if (context.currentMapType == "globe") {
				$bntgis.classList.remove("active");
				$bntglobe.classList.add("active");
				$bntglobe.remove()
				that.$mapType.append($bntglobe);
				/*that.updatePosition({
					bottom: 30
				});*/
			} else {
				$bntgis.classList.remove("active");
				$bntglobe.classList.remove("active");
				/*that.updatePosition({
					bottom: 0
				});*/
			}
			that.updatePosition(that.settings);
			bindClickFn();
		}

		function bindClickFn() {
			$bntgis.onclick=null;
			$bntglobe.onclick=null;
			$bntgis.onclick=function () {
				context.currentMapType = "map";
				updateMaptype();
				scene.fire((msgPrefix + ":openGisMap"), {
					args: []
				}, parentScene, false);
			};

			$bntglobe.onclick=function (e) {
				var ctl = e.ctrlKey;
				context.currentMapType = "globe";
				updateMaptype();
				scene.fire((msgPrefix + ":openGlobeMap"), {
					args: [ctl]
				}, parentScene, false);
			};
		}
	};

	that.updatePosition = function (params) {
		that.settings  = {};
		for(var i in defaultSettings){
			that.settings[i] = defaultSettings[i];
		}
		for(var i in params){
			that.settings[i] = params[i];
		}
		that.$mapSwichContainer.style = "";
		var style = {};
		for (var key in  that.settings) {
			if (that.settings[key] != null) {
				style[key] = that.settings[key];
			}
		}
		if (context.currentMapType == "globe") {
			if (style.bottom == 0) {
				style.bottom = 30;
			}
			if (style.top != null && style.top < 56) {
				style.top = 56
			}
		}
		for(var i in style){
			that.$mapSwichContainer.style[i] = style[i];
		}
	};
	that.hide=function(){
		if($(that.$mapSwichContainer))
			that.$mapSwichContainer.style.display = "none";
	};
	that.show=function(){
		 if($(that.$mapSwichContainer))
			that.$mapSwichContainer.style.display = "block";
	};

	that.init();
};
export default MapSwich;
