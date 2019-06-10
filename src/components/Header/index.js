import React , {useState,useReducer,useContext} from 'react';
import { DatePicker } from 'antd';
import moment from 'moment';
import { withRouter, NavLink } from 'react-router-dom';
import locale from 'antd/lib/date-picker/locale/zh_CN';
import {myContext} from '@/reducer/header';
import './index.less';
import pagesConfig from '@/routes/config';
const {MonthPicker} = DatePicker;
function Header(props)  {
  const [param, setParam] = useState('1');
  const {topDate, dispatch} = useContext(myContext);
  function onChange(e, eString) {
    dispatch({ type: "changeDate", payload: {timeType: param, baseTime: eString} })
  }
  function disabledDate(current) {
    // Can not select days before today and today
    return current && current > moment().endOf('day');
  }
  function getPicker(value='1') {
    if(value === '1') {
      return <DatePicker allowClear={false} locale={locale} disabledDate={disabledDate} defaultValue={moment()}
      onChange={onChange} />
    }else if(value === '3') {
      return <MonthPicker allowClear={false} locale={locale} disabledDate={disabledDate} defaultValue={moment()}
      onChange={onChange} />
    }else if(value === '6') {
      const start = 2018;
      let end = moment().year();
      const arr = [];
      while(end > start) {
        arr.push(end);
        end--;
      }
      return <select style={{width: '2rem'}} onChange={(e)=>{
        dispatch({ type: "changeDate", payload: {timeType: param, baseTime: e.target.value} })
      }}>
        {
          arr.map(item =>
          <option value={item}>{item}</option>)
        }
      </select>
    }
  }
  return (
    <div className="header-box">
      <div className="logo-box">
        <div className="title">市、县(市)数字城管数据展示平台</div>
      </div>
      <div className="time">
        <select onChange={(e)=>{
          setParam(e.target.value)
          if(e.target.value === '1') {
            dispatch({ type: "changeDate", payload: {timeType: e.target.value, baseTime: moment().format('YYYY-MM-DD')} })
          }else if(e.target.value === '3') {
            dispatch({ type: "changeDate", payload: {timeType: e.target.value+'-01', baseTime: moment().format('YYYY-MM')+'-01'} })
          }else if(e.target.value === '6') {
            dispatch({ type: "changeDate", payload: {timeType: e.target.value, baseTime: moment().year()} })
          }
        }}>
          <option value="1">日</option>
          {/* <option value="2">周</option> */}
          <option value="3">月</option>
          {/* <option value="4">季</option> */}
          {/* <option value="5">半年</option> */}
          <option value="6">年</option>
        </select>
        {getPicker(param)}
      </div>
      {/* <div className="menu-box">
        {
          pagesConfig.routes.menus.map(item =>
            <NavLink to={item.route} key={item.route} className={`menu-div ${props.location.pathname.indexOf(item.route) > -1 ? 'active' : ''}`}>
              <div className="menu-nav">
                {item.title}
              </div>
            </NavLink>
          )
        }
      </div> */}
    </div>
  );
}

export default withRouter(Header)
