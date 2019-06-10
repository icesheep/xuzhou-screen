import axios from 'axios';
import { message } from 'antd';

// url 地址
// msg msg提示
// headers header配置
// data 参数
export const get = ({url, msg = '接口异常', headers}) => (
  axios.get(url, headers)
  .then(res => res.data)
  .catch(err => {
     message.warn(msg);
  })
)

export const post = ({url, data, msg = '接口异常', headers}) => (
  axios.post(url, data, headers)
  .then(res => res.data)
  .catch(err => {
      message.warn(msg);
  })
)
