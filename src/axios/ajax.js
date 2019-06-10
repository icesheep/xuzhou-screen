import axios from 'axios';
import Jsonp from 'jsonp';
import { rootPath } from '../utils';
import { Modal } from 'antd';
import _ from 'lodash';

export default class Axios {

  static jsonp(para) {
    return new Promise((resolve, reject) => {
      Jsonp(para.url, (err, res) => {
        resolve(res)
        // if (res.data.success) {
        //   resolve(res);
        // } else {
        //   Modal.info({
        //     title: "提示",
        //     content: res.resultinfo.message
        //   });
        //   reject(res);
        // }
      });
    });
  }

  static ajax(para) {
    return new Promise((resolve, reject) => {
      axios({
        url: para.url,
        method: para.method || "GET",
        // baseURL: para.baseURL ? baseURL2 : baseURL,
        baseURL: para.url.includes('http')?'':rootPath,
        timeout: 60000,
        params: _.omitBy(para.params, _.isNull),
        headers: {
          'X-Requested-With': 'XMLHttpRequest',
        },
      }).then(res => {
        if (res.data) {
          console.log(res.data)
          resolve(res.data);
        } else {
          Modal.info({
            title: "提示",
            content: res.message || res.resultinfo.message
          });
          reject(res);
        }
      }).catch(
        
        (res) => {
          // document.body.classList.remove('loading-indicator');
          // Modal.info({
          //   title: "提示",
          //   content: '接口超时或者其他错误！'
          // });
          if(res.toString().includes('401')){
            window.location.assign(rootPath+'/main.html')
          }
        }
      )
    })
  }
}
