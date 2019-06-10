var XEvent = function () {
	this.handlers = {};
}
XEvent.prototype = {
	on: function (type, handler) {
		if (typeof this.handlers[type] == "undefined") {
			this.handlers[type] = [];
		}
		this.handlers[type].push(handler);
		return handler;
	},
	fire: function (type, msgData) {
		if (this.handlers[type]instanceof Array) {
			var handlers = this.handlers[type];
			for (var i = 0, len = handlers.length; i < len; i++) {
				handlers[i](msgData);
			}
		}
	},
	//除所有该事件下对应的方法
	remove: function (type) {
		if (this.handlers[type]instanceof Array) {
			this.handlers[type] = [];
		}
	},
	removeHandler: function (type, handler) {
		if (this.handlers[type]instanceof Array) {
			var handlers = this.handlers[type];
			for (var i = 0, len = handlers.length; i < len; i++) {
				if (handlers[i] === handler) {
					handlers.splice(i, 1);
					break;
				}
			}

		}
	},
	clear: function () {
		this.handlers = {};
	}
};

var XScene = function (pageType, pageId) {
	this.pageType = pageType;
	this.pageId = pageId;
	this._evt = new XEvent();
	this._handler = [];
	this.hostWin = window;
};

XScene.prototype = {
	getParameter: function () {
		if (this.pageType == "modal") {
			return window.dialogArguments.parameter;
		}
		return null;
	},

	getCallback: function () {
		if (this.pageType == "modal") {
			return window.dialogArguments.callback;
		}
		return null;
	},

	getParentScene: function (pageId, stopOnTop) {
		stopOnTop = stopOnTop || false;
		var parent = null;
		if (this.pageType == "iframe" || this.pageType == "iframe-dialog") {
			if (window != window.parent) {
				parent = window.parent;
			}
		}
		if (!stopOnTop) {
			if (this.pageType == "modal") {
				parent = window.dialogArguments.hostWin;
			}
			if (this.pageType == "dialog") {
				parent = window.opener;
			}
		}
		if (!parent || !parent.__xsense)
			return null;
		if (parent.__xsense && parent.__xsense.pageId !== pageId) {
			return parent.__xsense.getParentScene(pageId, stopOnTop);
		}
		return parent.__xsense;
	},

	closeAllDialogs: function () {
		var parent = null;
		if (this.pageType == "iframe" || this.pageType == "iframe-dialog") {
			if (window != window.parent) {
				parent = window.top;
			}
		}
		if (this.pageType == "modal") {
			parent = window.dialogArguments.hostWin;
			window.close();
		}
		if (this.pageType == "dialog") {
			parent = window.opener;
			window.close();
		}
		if (!parent || !parent.__xsense)
			return null;
		if (parent.__xsense) {
			parent.__xsense.closeAllDialogs();
		}
	},

	fire: function (msgId, msgData, pageId, stopOnTop) {
		stopOnTop = stopOnTop || false;
		if (!pageId || pageId === this.pageId) {
			this._evt.fire(msgId, msgData);
		} else {
			var parent = this.getParentScene(pageId, stopOnTop);
			if (parent) {
				parent.fire(msgId, msgData, pageId, stopOnTop)
			}
			return null;
		}
	},
	remove: function (msgId, pageId, stopOnTop) {
		stopOnTop = stopOnTop || false;
		if (!pageId || pageId === this.pageId) {
			this._evt.remove(msgId);
			return null;
		} else {
			var parent = this.getParentScene(pageId, stopOnTop);
			if (parent) {
				parent.remove(msgId, pageId, stopOnTop);
			}
			return null;
		}
	},
	removeHandler: function (msgId, msgHandler, pageId, stopOnTop) {
		stopOnTop = stopOnTop || false;
		if (!pageId || pageId === this.pageId) {
			this._evt.removeHandler(msgId, msgHandler);
			return null;
		} else {
			var parent = this.getParentScene(pageId, stopOnTop);
			if (parent) {
				parent.removeHandler(msgId, msgHandler, pageId, stopOnTop);
			}
			return null;
		}
	},
	on: function (msgId, msgHandler, pageId, stopOnTop) {
		stopOnTop = stopOnTop || false;
		if (!pageId || pageId === this.pageId) {
			var h = this._evt.on(msgId, msgHandler);
			return null;
		} else {
			var parent = this.getParentScene(pageId, stopOnTop);
			if (parent) {
				var h = parent.on(msgId, msgHandler, pageId, stopOnTop);
				if (h) {
					this._handler.push(h);
				}
			}
			return null;
		}
	},
	detachAll: function () {
		for (var i = 0; i < this._handler.length; i++) {
			this._handler[i].detach();
		}
	}
};

XScene.create = function (pageType, pageId) {
	window.__xsense = new XScene(pageType, pageId);
	return window.__xsense;
};

//pageType: iframe, iframe-dialog, modal, dialog, desktop
//iframe 普通的IFrame页面
//iframe-dialog 对应于desktop上的一个Iframe对话框
//modal 弹出的模态对话框
//dialog　弹出的普通对话框
var EGovaScene = {

	create: function (pageType, pageId) {
		return XScene.create(pageType, pageId);
	},

	getSense: function () {
		return window.__xsense;
	}
};
export default EGovaScene;