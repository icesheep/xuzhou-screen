<%@ page contentType="text/html;charset=UTF-8" pageEncoding="UTF-8"%>
<%@ include file="/view/include/common/taglibs.jsp"%>
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html style="height:100%;width:100%" xmlns="http://www.w3.org/1999/xhtml" lang="en" xml:lang="en">
    <head>
        <title>${applicationScope.textSystemTitle}</title>
        <meta http-equiv="Content-Type" content="text/html; charset=UTF-8"/>
    </head>
    <body style="overflow:hidden;padding:0px;margin:0px;" class="nihilo">
        <div id="map" style="width:100%;height:100%;position:absolute;left:0px;top:0px;right:0px;bottom:0px;">
        </div>
		<div id="wait_temp" class="datagrid-mask mymask">
			<div class="datagrid-mask-msg mymask"><span>正在加载地图……</span></div>
		</div>
		<script>
			/** 获取跟路径 **/
			var getRootPath = function() {
				var src = window.location.href;
				var idxProtocol = src.indexOf("://") + 3;
				var idxEnd = src.substr(idxProtocol).indexOf("/") + idxProtocol + 1;
				var originPath = src.substring(0, idxEnd);
				return originPath;
			};
			var serverUrl = '${param.serverURL}';
			if(serverUrl.indexOf("http")!=0){
				serverUrl = getRootPath()+serverUrl;
			}
		    var mainScript = document.createElement("script");
	        mainScript.setAttribute("type", "text/javascript");
	        mainScript.setAttribute("src", serverUrl + '/library/egovagis/map/map.js?bust=${param.bust}');
	        document.getElementsByTagName("head").item(0).appendChild(mainScript);
		</script>
    </body>
</html>


