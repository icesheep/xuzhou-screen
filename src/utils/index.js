export const rootPath = window.location.pathname.includes('view/build/index.html') ? 
`${window.location.origin}${window.location.pathname.replace('/view/build/index.html','')}` :
`${window.location.origin}/eUrbanMIS0523/`;
// `${window.location.origin}/dc/`;

export const qs = (name, searchUrl) => {
  const reg = new RegExp(`(^|&)${name}=([^&]*)(&|$)`);
  const url = searchUrl ? searchUrl : window.location.search;
  const r = url.substr(1).replace(/\?/g, '&').match(reg);
  if (r !== null) {
    return decodeURIComponent(r[2]);
  }
  return '';
};

export const isMac = () => /macintosh|mac os x/i.test(navigator.userAgent);

export const getExploreName = () => {
  const userAgent = navigator.userAgent;
  if (userAgent.indexOf("Opera") > -1 || userAgent.indexOf("OPR") > -1) {
    return 'Opera';
  } else if (userAgent.indexOf("compatible") > -1 && userAgent.indexOf("MSIE") > -1) {
    return 'IE';
  } else if (userAgent.indexOf("Edge") > -1) {
    return 'Edge';
  } else if (userAgent.indexOf("Firefox") > -1) {
    return 'Firefox';
  } else if (userAgent.indexOf("Safari") > -1 && userAgent.indexOf("Chrome") === -1) {
    return 'Safari';
  } else if (userAgent.indexOf("Chrome") > -1 && userAgent.indexOf("Safari") > -1) {
    return 'Chrome';
  } else if (!!window.ActiveXObject || "ActiveXObject" in window) {
    return 'IE>=11';
  } else {
    return 'Unkonwn';
  }
}

const timeChange = (timestamp) => {
  const arrTimestamp = `${timestamp}`.split('');
  for (let start = 0; start < 13; start++) {
    if (!arrTimestamp[start]) {
        arrTimestamp[start] = '0';
    }
  }
  timestamp = arrTimestamp.join('') * 1;

  const minute = 1000 * 60;
  const hour = minute * 60;
  const day = hour * 24;
  // const halfamonth = day * 15;
  const month = day * 30;
  const now = new Date().getTime();
  const diffValue = now - timestamp;

  // 如果本地时间反而小于变量时间
  if (diffValue < 0) {
      return '不久前';
  }

  // 计算差异时间的量级
  const monthC = diffValue / month;
  const weekC = diffValue / (7 * day);
  const dayC = diffValue / day;
  const hourC = diffValue / hour;
  const minC = diffValue / minute;

  // 数值补0方法
  const zero = function (value) {
      if (value < 10) {
          return '0' + value;
      }
      return value;
  };

  // 使用
  if (monthC > 12) {
      // 超过1年，直接显示年月日
      return (function () {
          const date = new Date(timestamp);
          return date.getFullYear() + '年' + zero(date.getMonth() + 1) + '月' + zero(date.getDate()) + '日';
      })();
  } else if (monthC >= 1) {
      return parseInt(monthC, 10) + "月前";
  } else if (weekC >= 1) {
      return parseInt(weekC, 10) + "周前";
  } else if (dayC >= 1) {
      return parseInt(dayC, 10) + "天前";
  } else if (hourC >= 1) {
      return parseInt(hourC, 10) + "小时前";
  } else if (minC >= 1) {
      return parseInt(minC, 10) + "分钟前";
  }
  return '刚刚';
};

// Date.prototype.Format = function (fmt) { //author: meizz
//   const o = {
//       "M+": this.getMonth() + 1, //月份
//       "d+": this.getDate(), //日
//       "h+": this.getHours(), //小时
//       "m+": this.getMinutes(), //分
//       "s+": this.getSeconds(), //秒
//       "q+": Math.floor((this.getMonth() + 3) / 3), //季度
//       "S": this.getMilliseconds() //毫秒
//   };
//   if (/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
//   for (var k in o)
//   if (new RegExp("(" + k + ")").test(fmt)) fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
//   return fmt;
// }

export default timeChange;
