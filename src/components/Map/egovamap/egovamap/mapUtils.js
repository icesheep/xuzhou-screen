//import CoordConvert from 'egovacoordconvert';
var MapUtils = {
	type: function (obj) {
		var result = Array.isArray(obj) ? 'array' : (typeof obj);
		return result;
	},
	deepClones: function () {
		var options,
		name,
		src,
		copy,
		copyIsArray,
		clone,
		target = arguments[0] || {},
		i = 1,
		length = arguments.length,
		deep = false;

		// Handle a deep copy situation
		if (typeof target === "boolean") {
			deep = target;

			// Skip the boolean and the target
			target = arguments[i] || {};
			i++;
		}

		// Handle case when target is a string or something (possible in deep copy)
		if (this.type(target) !== "object" && this.type(target) !== 'function' && this.type(target) !== 'array') {
			target = {};
		}

		// Extend jQuery itself if only one argument is passed
		if (i === length) {
			target = this;
			i--;
		}

		for (; i < length; i++) {

			// Only deal with non-null/undefined values
			if ((options = arguments[i]) != null) {

				// Extend the base object
				for (name in options) {
					src = target[name];
					copy = options[name];

					// Prevent never-ending loop
					if (target === copy) {
						continue;
					}

					// Recurse if we're merging plain objects or arrays
					if (deep && copy && (this.type(copy) === "object" ||
							(copyIsArray = (this.type(copy) === "array")))) {

						if (copyIsArray) {
							copyIsArray = false;
							clone = src && (this.type(copy) === "array") ? src : [];

						} else {
							clone = src && (this.type(copy) === "object") ? src : {};
						}

						// Never move original objects, clone them
						target[name] = this.deepClones(deep, clone, copy);

						// Don't bring in undefined values
					} else if (copy !== undefined) {
						target[name] = copy;
					}
				}
			}
		}
		// Return the modified object
		return target;
	},
	//限制经纬度坐标在一个正确范围
	limitLon: function (x) {
		x = x > 180 ? 180 : x;
		x = x < -180 ? -180 : x;
		return x;
	},

	//限制经纬度坐标在一个正确范围
	limitLat: function (y) {
		y = y > 90 ? 90 : y;
		y = y < -90 ? -90 : y;
		return y;
	},

	//限制经纬度坐标在一个正确范围
	limitLonLatArray: function (arrPnts) {
		var result = [];
		var length = arrPnts.length;
		for (var k = 0; k < length; ++k) {
			result.push([this.limitLon(arrPnts[k][0]), this.limitLat(arrPnts[k][1])]);
		}
		return result;
	},

	//坐标变换，本地转经纬度，返回 {x, y}格式
	toLonLat: function (x, y) {
		var that = this;
		//that.resultPoint=null;
		var callback = function (result) {
			that.resultPoint = {
				x: that.limitLon(result[0][0]),
				y: that.limitLat(result[0][1])
			};

		}
		var coords = x + ',' + y;
		if (this.getglobeParams().fourpara){
			//CoordConvert.convert("xian80towgsllfourparam", coords, callback);
		}else
			that.resultPoint = {
				x: x,
				y: y
			};
		return that.resultPoint
	},

	//批量坐标变换，本地转经纬度，返回坐标点对数组，传入形式[[100.0, 0.0], [101.0, 1.0]]传出形式相同
	toLonLatArray: function (arrPnts) {
		var that = this;
		if (arrPnts.length == 0) {
			return arrPnts;
		}
		var coords = '';
		for (var i = 0; i < arrPnts.length; i++) {
			if (i == arrPnts.length - 1)
				coords += arrPnts[i][0] + ',' + arrPnts[i][1];
			else
				coords += arrPnts[i][0] + ',' + arrPnts[i][1] + ';';
		}
		var callback = function (result) {
			that.resultPoints = result;

		}
		if (this.getglobeParams().fourpara){
			//CoordConvert.convert("xian80towgsllfourparam", coords, callback);
		}else
			that.resultPoints = arrPnts;
		return that.resultPoints;
	},

	//坐标变换，经纬度转本地，返回 {x, y}格式
	toLocal: function (x, y) {
		var that = this;
		var callback = function (result) {
			that.resultPoint = {
				x: result[0][0],
				y: result[0][1]
			};

		}
		var coords = x + ',' + y;
		if (this.getglobeParams().unfourpara){
			//CoordConvert.convert("ydcl", coords, callback);
		}else
			that.resultPoint = {
				x: x,
				y: y
			};
		return that.resultPoint
	},

	//批量坐标变换，经纬度转本地，返回坐标点对数组，输入形式 [[100.0, 0.0], [101.0, 1.0]]，输出形式相同
	toLocalArray: function (arrPnts) {
		var that = this;
		if (arrPnts.length == 0) {
			return arrPnts;
		}
		var coords = '';
		for (var i = 0; i < arrPnts.length; i++) {
			if (i == arrPnts.length - 1)
				coords += arrPnts[i][0] + ',' + arrPnts[i][1];
			else
				coords += arrPnts[i][0] + ',' + arrPnts[i][1] + ';';
		}
		var callback = function (result) {
			that.resultPoints = result;

		}
		if (this.getglobeParams().unfourpara){
			//CoordConvert.convert("ydcl", coords, callback);
		}else
			that.resultPoints = arrPnts
				return that.resultPoints;
	},

	//二维地图范围转成三维经纬度地图范围
	toLonLatExtent: function (extent) {
		var lowerleft = this.toLonLat(extent.xmin, extent.ymin);
		var upperright = this.toLonLat(extent.xmax, extent.ymax);
		if (lowerleft && upperright) {
			return {
				"xmin": lowerleft.x,
				"ymin": lowerleft.y,
				"xmax": upperright.x,
				"ymax": upperright.y
			};
		}
	},

	//三维经纬度地图范围转成二维地图范围
	toLocalExtent: function (extent) {
		var lowerleft = this.toLocal(extent.west || extent.xmin, extent.south || extent.ymin);
		var upperright = this.toLocal(extent.east || extent.xmax, extent.north || extent.ymax);
		if (lowerleft && upperright) {
			return {
				"xmin": lowerleft.x,
				"ymin": lowerleft.y,
				"xmax": upperright.x,
				"ymax": upperright.y
			};
		}
	},
	getglobeParams:function(){
		return {};
	}
}
export default MapUtils;