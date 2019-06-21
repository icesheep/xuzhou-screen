import React, { Component } from 'react';
import EGovaMap from './egovamap/egovamap/egovamap';
import {rootPath} from '@/utils';
import axios from '@/axios/ajax';

class Map extends Component {

  constructor(props) {
    super(props);
    const mapConfigDefault = {
      params:{
        navi:"{visible:false,left:20,top:90}",
        toolbar:"{items:'zoomin,zoomout,pan,fullextent,measurelength,measurearea,refresh,layertree,identify,snap,locatexy',visible:false,left:20,top:60}",
        geocode:"{visible:false,right:20,top:60}",trace:"{right:5,bottom:185}",switchbar:"{right:20,top:102}",layertree:"{top:160}",
        // style: 'black',
        config: 'sysconfigdp',
        //disableMapEvent:true
      },
      mapconfig3D:{ toolbar:"{ visible:true,left:20,top:60}"},
      maskPos : {visible:true,top:95}
    };
    this.mapConfig = {
      params:{...mapConfigDefault.params,...props.mapConfig&&props.mapConfig.params},
      mapconfig3D:{ ...mapConfigDefault.mapconfig3D,...props.mapConfig&&props.mapConfig.mapconfig3D},
      maskPos : { ...mapConfigDefault.maskPos,...props.mapConfig&&props.mapConfig.maskPos}
    };
    this.emap = null;
    this.emapId = this.props.id || `map${new Date().getTime()}`;
  }
  
  componentDidMount() {
    EGovaMap.releaseInstance(this.emapId);
    axios.ajax({
      url:  window.location.pathname.includes('view/build/index.html') ?
      `${window.location.origin}${window.location.pathname.replace('/build/index.html', '')}/test/data/getgisserverconfig.json` :
      `${window.location.origin}/api/getgisserverconfig.json`
    }).then((res) => {
      let data = res.resultInfo.data;
      var context = {
        rootPath:rootPath.includes('localhost') ? window.location.origin : rootPath,
        humanID:"",
        gisServerURL: data.gisServerURL || "http://221.229.211.32:8081/eUrbanGIS/",
        originPath:"",
        mapCenterFlag:"",
        coordinateX:"",
        coordinateY:"",
        humanLayerUsageID:"",
        regionCode:"",
        humanLayerKeyFieldName:"",
        mapZoomRange:"",
        mmsEnabled:"",
        mmsParams:"",
        globeParams:"",
        globeEnabled:false,
        globeServerURL:"",
        globeCallBack:"",
        gisEnabled:true,
        currentMapType:"",
        mmsServerURL:"",
        assetsPath:rootPath.includes('localhost') ? "/" : "",
        mapType:"emap",
      }
      this.emap = EGovaMap.getInstance(this.emapId, ()=>{this.props.callback&&this.props.callback()}, this.mapConfig,null,null,context);
      if(this.props && this.props.getMapInstance){
          this.props.getMapInstance(this.emap);
      }
    })
    // var data = {}
    // var context = {
    //   rootPath:rootPath.includes('localhost') ? window.location.origin : rootPath,
    //   humanID:"",
    //   gisServerURL: data.gisServerURL || "http://221.229.211.32:8081/eUrbanGIS/",
    //   originPath:"",
    //   mapCenterFlag:"",
    //   coordinateX:"",
    //   coordinateY:"",
    //   humanLayerUsageID:"",
    //   regionCode:"",
    //   humanLayerKeyFieldName:"",
    //   mapZoomRange:"",
    //   mmsEnabled:"",
    //   mmsParams:"",
    //   globeParams:"",
    //   globeEnabled:false,
    //   globeServerURL:"",
    //   globeCallBack:"",
    //   gisEnabled:true,
    //   currentMapType:"",
    //   mmsServerURL:"",
    //   assetsPath:rootPath.includes('localhost') ? "/" : "",
    //   mapType:"emap",
    // }
    // this.emap = EGovaMap.getInstance(this.emapId, ()=>{this.props.callback&&this.props.callback()}, this.mapConfig,null,null,context);
    // if(this.props && this.props.getMapInstance){
    //     this.props.getMapInstance(this.emap);
    // }
  }

  render() {
		return (
			<div style={{width: '100%', height: '100%'}} id={this.emapId}>
      </div>
		);
	}
  
}

export default Map;