<%@ page contentType="text/html;charset=UTF-8" pageEncoding="UTF-8"%>
<%@ include file="/view/include/common/taglibs.jsp"%>
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html style="height:100%;width:100%;">
<head lang="en">
    <meta charset="UTF-8">
    <title>eGovaGlobe三维</title>
	<script type="text/javascript" src="<c:url value='${param.serverURL}/library/globe/api/initGlobe.js'/>"></script>
</head>
<body>
    <div id="cesiumContainer" class="fullWindow"></div>
    <div id="loadingIndicator" class="loadingIndicator"></div>
</body>

</html>