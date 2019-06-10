import React, { Component } from 'react';
import moment from 'moment';
import axios from '../../axios/ajax';
import recField from './recField';
import defaultmediaURL from './icon/img-default.png';
import {rootPath} from '@/utils';
import './index.less';

class Rec extends Component {

  constructor(props) {
    super(props);
    this.state = {
      recID: false,
      labelList: [],
      textList: [],
      mediaList: [],
      processinfo: [],
      index: false,
      posIndex: false,
      bigPicVisible: false,
      total: [],
    }
  }

  showRec = (recID) => {
    this.setState({recID},this.initData)
  }

  initData = () => {
    const {recID} = this.state;
    this.getrecformid(recID);
    this.getMedia(recID);
    this.getrecprocessinfo(recID);
  }

  getrecformid = (recID) => {
    axios.ajax({
      url: '/home/mis/rec/getrecformid',
      method: 'GET',
      params: {
        recID
      }
    }).then((res) => {
      if(res.data&&res.data.form) {
        this.getforminfo(res.data.form.formName,{"recID": recID});
      }
    });
  }
  getMedia = (recID) => {
    axios.ajax({
      url: '/media/get',
      method: 'GET',
      params: {
        relationTypeID: 1,
        relationID: recID,
      }
    }).then((res) => {
      let posIndex = false;
      let index = false;
      let total = [];
      if(res.data.mediaList&&res.data.mediaList.length > 0) {
        for(let i=0; i< res.data.mediaList.length; i++) {
          if(!res.data.mediaList[i].mediaURL.includes('http')) {
            res.data.mediaList[i].mediaURL = `${rootPath}/${res.data.mediaList[i].mediaURL}`
          }
          if(res.data.mediaList[i].mediaUsage === '位置图' ) {
            posIndex = i;
          }else {
            total.push(i);
          }
        }
      }
      if(total.length > 0) {
        index = 0;
      }
      console.log(res.data.mediaList ,index, posIndex, total);
      this.setState({mediaList: res.data.mediaList ,index, posIndex, total});
    });
  }
  getrecprocessinfo = (recID) => {
    axios.ajax({
      url: '/home/workflow/getrecprocessinfo',
      method: 'GET',
      params: {
        processType: 'last',
        recID
      }
    }).then((res) => {
      for(let i = 0; i < res.resultInfo.data.processInfo.length; i++) {
         res.resultInfo.data.processInfo[i].tableIndex = i+1;
      }
      this.setState({processinfo: res.resultInfo.data.processInfo });
    });
  }
  getforminfo = (formName, param) => {
    axios.ajax({
      url: '/home/form/formpreview/getforminfo',
      method: 'POST',
      params: {
        formName,
        param
      }
    }).then((res) => {
      this.setState({labelList: res.resultInfo.data.form.componentList});
      this.getformdata(res.resultInfo.data.form.formID,param);
    });
  }
  getformdata = (formID, param) => {
    axios.ajax({
      url: '/home/form/formpreview/getformdata',
      method: 'GET',
      params: {
        formID,
        param
      }
    }).then((res) => {
      this.setState({textList: res.resultInfo.data.formData});
    });
  }

  close = () => {
    this.setState({recID: false})
  }

  getText = (componentID) => {
    const {labelList} = this.state;
    for(let i = 0; i < labelList.length; i++) {
      if(labelList[i].id.componentID === componentID) {
        console.log(labelList[i])
        return labelList[i].text;
      }
    }
  }

  downLoad = (url,mediaName) => {
    let alink = window.document.createElement("a");
    alink.href = url;
    alink.download = mediaName;
    alink.click();
  }

  showBigPic = () => {
    this.setState({bigPicVisible: true})
  }

  hideBigPic = () => {
    this.setState({bigPicVisible: false})
  }

  scrollLeft = () => {
    const {index,total} = this.state;
    if(total.length > 0) {
      if(index === 0) {
        this.setState({index: total.length-1})
      }else {
        this.setState({index: index-1})
      }
    }
  }

  scrollRight = () => {
    const {index,total} = this.state;
    if(total.length > 0) {
      if(index === total.length - 1) {
        this.setState({index: 0})
      }else {
        this.setState({index: index+1})
      }
    }
  }

  onlyDownload = () => {
    const {recID} = this.state;
    const responseUrl = rootPath + "/home/mis/rec/downloadrecpdf?recID=" + recID;
    window.open(responseUrl);
  }

  recDownload = () => {
    const {recID} = this.state;
    const responseUrl = rootPath + "/home/mis/rec/downloadrecinfo?recID=" + recID;
    window.open(responseUrl);
  }

  render() {
    const { recID, textList, mediaList, index, posIndex, processinfo, bigPicVisible, total, labelList } = this.state;
    const { parentClass } = this.props;
    const basicColumns = [
      {id:"tableIndex", name:"序号", field:"tableIndex", width:1},
      {id:"actDefName", name:"办理阶段", field:"actDefName", width:2},
      {id:"startTime", name:"开始时间", field:"startTime", width:2},
      {id:"endTime", name:"结束时间", field:"endTime", width:2},
      {id:"humanName", name:"经办人员", field:"humanName", width:2},
      {id:"unitName", name:"部门", field:"unitName", width:2},
      {id:"detail", name:"意见", field:"detail", width:2}
    ];
    return (
      <div>
        {recID ?
          <div className={`rec-component ${parentClass}`} style={{ backgroundColor: 'rgb(7, 30, 94)' }}>
            <div className="small-corner q1"></div>
            <div className="small-corner q2"></div>
            <div className="small-corner q3"></div>
            <div className="small-corner q4"></div>
            <div className="top">
              <h3 className="rec-title"><span>案件主页</span><div onClick={this.close} className="close"></div></h3>
              <div className="rec-info">
                <div className="part1">
                  {
                    labelList&&labelList.length > 0&&labelList.map(v => 
                      // <div className="rec-row">
                      //   <div className="rec-label" title={recField[v.fieldPhyName]}>{recField[v.fieldPhyName]}</div>
                      //   <div className="rec-text" title={v.value}>{v.value}</div>
                      // </div>
                      <div title={(textList.find(item=>item.fieldPhyName===v.fieldPhyName)||{}).value} className={v.tableName ? "rec-text" : "rec-label"} style={{...{position:'absolute', width:`${v.width/100}rem`, left:`${v.x/100}rem`, top:`${v.y/100}rem`},...(v.style.includes('none')?{display:'none'}:{})}}>{v.tableName? (textList.find(item=>item.fieldPhyName===v.fieldPhyName)||{}).value : v.text}</div>
                    )
                  }
                  {/* {
                    textList&&textList.length > 0&&textList.map(v => 
                      // <div className="rec-row">
                      //   <div className="rec-label" title={recField[v.fieldPhyName]}>{recField[v.fieldPhyName]}</div>
                      //   <div className="rec-text" title={v.value}>{v.value}</div>
                      // </div>
                      <div className="rec-text" style={{position:'absolute', width:`${v.width/100}rem`, left:`${v.x/100}rem`, top:`${v.y/100}rem`}} title={v.value}>{v.value}</div>
                    )
                  } */}
                </div>
                <div className="part2">
                  {
                    mediaList&&mediaList.length > 0&&total.length>0?
                    <div className="part2Div">
                      <div onClick={this.scrollLeft} className="leftCursor"></div>
                      <div onClick={this.scrollRight} className="rightCursor"></div>
                      <img className="media-pic" alt="" src={mediaList[total[index]].mediaURL}/>
                      <div className="text">图片{mediaList[total[index]].mediaUsage}
                        [{index+1}-{total.length}/{total.length}]
                        [{mediaList[total[index]].createTime&&moment(mediaList[total[index]].createTime).format('YYYY-MM-DD HH:mm:ss')}]</div>
                      <div className="icon">
                        <div onClick={() => {this.downLoad(mediaList[total[index]].mediaURL, mediaList[total[index]].mediaName)}} className="download"></div>
                        <div onClick={this.showBigPic} className="open"></div>
                      </div>
                      {
                        bigPicVisible?<div className="bigPic">
                          <img alt="" src={mediaList[total[index]].mediaURL}/>
                          <div onClick={this.hideBigPic} className="closeBigPic"></div>
                        </div>: null
                      }
                    </div>:
                    <div className="part2Div">
                      <img className="media-pic" alt="" src={defaultmediaURL}/>
                      <div className="text">[未上传图片]</div>
                    </div>
                  }
                  
                </div>
                <div className="part3">
                  {
                    posIndex!==false&&<img alt="" src={mediaList[posIndex].mediaURL}/>
                  }
                </div>
              </div>
            </div>
            <div className="bottom">
              <h3 className="rec-title">
                <span>办理经过</span>
                {/* <div onClick={this.recDownload} className="rec-download">案件下载</div>
                <div onClick={this.onlyDownload} className="rec-download">直接下载</div> */}
              </h3>
              <table>
                <thead>
                  <tr className="rec-head">
                    {basicColumns.map(v => 
                      <th style={{flex: v.width}}>{v.name}</th>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {processinfo.map(v => 
                    <tr className="rec-row">
                      {basicColumns.map(j => 
                        <td style={{flex: j.width}}>{v[j.id]}</td>
                      )}
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            
          </div >  : null}
      </div>
    )
  }
}

export default Rec
