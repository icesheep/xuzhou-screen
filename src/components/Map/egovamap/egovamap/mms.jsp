<%@ page contentType="text/html;charset=UTF-8" pageEncoding="UTF-8"%>
<%@ include file="/view/include/common/taglibs.jsp"%>
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html style="height:100%;width:100%;">
<head lang="en">
    <meta charset="UTF-8">
    <title>eGovaMMS实景</title>
	<script type="text/javascript" src="<c:url value='${param.mmsServerUrl}/library/mms/api/MMSAPI.js?clientType=js'/>"></script>
	<script>
		function GetRequest() {
			var url = location.search; //获取url中"?"符后的字串
			var theRequest = new Object();
			if (url.indexOf("?") != -1) {
				var str = url.substr(1);
				strs = str.split("&");
				for(var i = 0; i < strs.length; i ++) {
					theRequest[strs[i].split("=")[0]]=(strs[i].split("=")[1]);
				}
			}
			return theRequest;
		}

		var Request = GetRequest();

		var simpleMode;
		if(Request["simpleMode"]) {
			simpleMode = true;
		}
		window.msgPrefix = Request["msgPrefix"];
		window.parentScene =  Request["parentScene"];
		window.proxyURL = Request["proxyUrl"];
		var mmsConfig = {
			panoID : "eGovaMMS",
			msgPrefix: "${param.msgPrefix}",
			mmsWsdlUrl : "${param.mmsWsdlUrl}",
			mmsPicUrl : "${param.mmsPicUrl}",
			mmsSymbolUrl : "${param.mmsSymbolUrl}",
			mediaRootUrl: "${param.mediaRootUrl}",
			mmsServerUrl: "${param.mmsServerUrl}",
			proxyUrl: "${param.proxyUrl}"
		};
		window.mmsConfig = mmsConfig;

		function init(){
			//初始化实景API
			if(typeof initEgovaMMSAPI != "undefined") {
			    console.info("----------initEgovaMMSAPI");
			    initEgovaMMSAPI();
			}else {
				console.error("----------initEgovaMMSAPI:failed!check mmsServerUrl.");
			}
		}
    </script>
</head>
<body onload="init();" style="height:100%;width:100%;overflow:hidden;margin:0;">
    <div id="eGovaMMS" name="eGovaMMS" style="width: 100%;height: 100%;border: none;"></div>
</body>
</html>