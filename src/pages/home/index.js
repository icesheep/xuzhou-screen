/* eslint-disable eqeqeq */
import React, { useState, useEffect, useContext } from 'react';
import Rect from '@/components/Rect';
import Map from '@/components/Map';
import moment from 'moment';
import { myContext } from '@/reducer/header';
import ReactEcharts from 'echarts-for-react';
import axios from '@/axios/ajax';
import './index.less';
// import {testData} from '/testData';
function Home(props) {
  const { topDate } = useContext(myContext);
  const [_emap, setEmap] = useState(null);
  const [data1, setData1] = useState([]);
  const [data2, setData2] = useState([]);
  const [total, setTotal] = useState({});
  const [recData, setRecData] = useState([]);
  useEffect(() => {
    axios.ajax({
      url: window.location.pathname.includes('view/build/index.html') ?
        `${window.location.origin}${window.location.pathname.replace('/build/index.html', '')}/test/data/testData.json` :
        `${window.location.origin}/api/testData.json`
    }).then((data) => {
      setData1(data.resultInfo.data.data.slice(0, 3))
      setData2(data.resultInfo.data.data.slice(3, 6))
      setTotal(data.resultInfo.data.data2)
    })
  }, [])
  useEffect(() => {
    axios.ajax({
      url: 'statiscenter/compeval/district/getchartdata',
      params: {
        timeType: (topDate && topDate.timeType) || 1,
        baseTime: (topDate && topDate.baseTime) || moment().format('YYYY-MM-DD'),
        regionType: 1,
        regionId: 0,
      }
    }).then((data) => {
      setRecData(data.resultInfo.data.chartData)
      renderMap(data.resultInfo.data.chartData)
    })
  }, [topDate])

  const renderMap = (data = recData) => {
    var geoCoord = {}, values = [];
    for (var i = 0; i < data.length; i++) {
      var t1 = {};
      geoCoord[data[i].NAME] = [data[i].X, data[i].Y];
      t1.name = data[i].NAME;
      t1.value = data[i].REPORTNUM;
      values.push(t1);
    }

    var option = {
      title: {
        show: false
      },
      tooltip: {
        trigger: 'item'
      },
      dataRange: {
        show: false,
        min: 400,
        max: 400,
        calculable: false,
        color: ['#0082EB']
      },
      geoCoord: geoCoord,
      series: [
        {
          name: '案件数量',
          type: 'map',
          mapType: 'none',
          hoverable: false,
          data: [],
          markPoint: {
            symbol: 'circle',
            symbolSize: 18,       // 标注大小，半宽（半径）参数，当图形为方向或菱形则总宽度为symbolSize * 2
            itemStyle: {
              normal: {          // 标注边线线宽，单位px，默认为1
                label: {
                  show: true,
                  color: '#fff',
                  fontSize: 14,
                  formatter: '{c}'
                }
              },
              emphasis: {
                label: {
                  show: false
                }
              }
            },
            data: values
          }
        },
        {
          name: '案件数量',
          type: 'map',
          mapType: 'none',
          data: [],
          markPoint: {
            symbol: 'emptyCircle',
            symbolSize: 15,
            effect: {
              show: true,
              shadowBlur: 0
            },
            itemStyle: {
              normal: {
                label: { show: false }
              }
            },
            data: values
          }
        }
      ]
    };
    if(_emap) {
      _emap.clearAllGraphics();
      _emap.addChart(option, false);
    }
  }


  const getOption1 = (name) => {
    var data = {};
    for (let i = 0; i < recData.length; i++) {
      if (recData[i].NAME === name) {
        data = recData[i];
      }
    }
    return {
      color: ['#009DFFFF', '#24DA56FF', '#FBB03BFF', '#6981EEFF', '#BE55D3FF', '#FF4000FF'],
      tooltip: {
        trigger: 'item',
      },
      grid: {
        left: 0,
        top: 0,
        bottom: 0
      },
      legend: {
        orient: 'vertical',
        icon: "circle",
        right: 'right',
        top: 'middle',
        itemGap: 5,
        data: ['上报数', '立案数', '派遣数', '处置数', '结案数', '按时结案数'],
        formatter: function (name) {
          if (name == '上报数') {
            return name + '   ' + (data.REPORTNUM || 0)
          } else if (name == '立案数') {
            return name + '   ' + (data.INSTNUM || 0)
          } else if (name == '派遣数') {
            return name + '   ' + (data.DISPATCHNUM || 0)
          } else if (name == '处置数') {
            return name + '   ' + (data.DISPOSENUM || 0)
          } else if (name == '结案数') {
            return name + '   ' + (data.ARCHIVENUM || 0)
          } else if (name == '按时结案数') {
            return name + '   ' + (data.INTIMEARCHIVENUM || 0)
          }
        },
        textStyle: {
          color: 'white'
        }
      },
      series: [
        {
          name: '访问来源',
          type: 'pie',
          center: ['30%', '50%'],
          radius: ['50%', '100%'],
          avoidLabelOverlap: false,
          label: {
            normal: {
              show: false,
            }
          },
          labelLine: {
            normal: {
              show: false
            }
          },
          data: [
            { value: data.REPORTNUM || 0, name: '上报数' },
            { value: data.INSTNUM || 0, name: '立案数' },
            { value: data.DISPATCHNUM || 0, name: '派遣数' },
            { value: data.DISPOSENUM || 0, name: '处置数' },
            { value: data.ARCHIVENUM || 0, name: '结案数' },
            { value: data.INTIMEARCHIVENUM || 0, name: '按时结案数' },
          ]
        }
      ],
    }
  };
  const getOption2 = (name) => {
    var data = {};
    for (let i = 0; i < recData.length; i++) {
      if (recData[i].NAME === name) {
        data = recData[i];
      }
    }
    return {
      grid: {
        left: 0,
        right: 0,
        top: 0,
        bottom: 15,
      },
      xAxis: [{
        type: 'value',
        max: 100,
        show: false,
      }],
      yAxis: [{
        type: 'category',
        data: ['按时结案率', '结案率', '立案率'],
        splitLine: {
          show: false
        },
        axisLine: {
          show: false,
        },
        axisTick: {
          show: false,
        }
      }],
      series: [{
        type: 'bar',
        barWidth: 10,
        barCategoryGap: '20%',
        silent: true,
        zlevel: 1,
        label: {
          normal: {
            position: 'insideTopLeft',
            offset: [0, 10],
            show: true,
            textStyle: {
              color: '#fff',
              fontSize: 14
            },
            formatter: function (params) {
              return params.name
            }
          }
        },
        itemStyle: {
          normal: {
            barBorderRadius: [10, 10, 10, 10],
            color: '#41E4FF'
          }
        },
        data: [
          (data.INTIMEARCHIVERATE && data.INTIMEARCHIVERATE.replace('%', '')) || 0,
          (data.ARCHIVERATE && data.ARCHIVERATE.replace('%', '')) || 0,
          (data.INSTRATE && data.INSTRATE.replace('%', '')) || 0],
      }, {
        type: 'bar',
        silent: true,
        barWidth: 10,
        barGap: '-100%',
        barCategoryGap: '20%',
        label: {
          normal: {
            position: 'insideTopRight',
            offset: [0, 10],
            show: true,
            textStyle: {
              color: '#fff',
              fontSize: 14,
            },
            formatter: function (params) {
              if (params.name == '立案率') {
                return data['INSTRATE'] || '0%'
              } else if (params.name == '结案率') {
                return data['ARCHIVERATE'] || '0%'
              } else if (params.name == '按时结案率') {
                return data['INTIMEARCHIVERATE'] || '0%'
              }

            }
          }
        },
        itemStyle: {
          normal: {
            barBorderRadius: [10, 10, 10, 10],
            color: '#6485D6'
          }
        },
        data: [100, 100, 100],
      }]
    }
  };
  return (
    <div className="home-box">
      <div className="home-box-left">
        {data1.map(item =>
          <div className="home-box-devide">
            <Rect title={item.name}>
              <div className="home-rect-content">
                <div className="top">
                  <div className="title">
                    <div className="num">{item.num1}</div>
                    <div className="text">系统覆盖面积</div>
                  </div>
                  <div className="title">
                    <div className="num">{item.num2}</div>
                    <div className="text">单元网格数量</div>
                  </div>
                  <div className="title">
                    <div className="num">{item.num3}</div>
                    <div className="text">责任网格数量</div>
                  </div>
                </div>
                <div className="bottom">
                  <div className="chart">
                    <ReactEcharts
                      option={getOption1(item.name)}
                      notMerge
                      lazyUpdate
                      style={{ height: '100%', width: '100%' }}
                    />
                  </div>
                  <div className="chart">
                    <ReactEcharts
                      option={getOption2(item.name)}
                      notMerge
                      lazyUpdate
                      style={{ height: '100%', width: '100%' }}
                    />
                  </div>
                </div>
              </div>
            </Rect>
          </div>)}
      </div>
      <div className="home-box-middle">
        <div className="total">
          <div className="text">总面积<span>{total.totalArea}</span>km²</div>
          <div className="text">覆盖面积<span>{total.coverArea}</span>km²</div>
          <div className="text">下辖<span>{total.quNum}</span>区、<span>{total.xianNum}</span>县、<span>{total.shiNum}</span>县级市</div>
        </div>
        <Map getMapInstance={(ref) => { setEmap(ref) }} callback={renderMap} />
      </div>
      <div className="home-box-right">
        {data2.map(item =>
          <div className="home-box-devide">
            <Rect title={item.name}>
              <div className="home-rect-content">
                <div className="top">
                  <div className="title">
                    <div className="num">{item.num1}</div>
                    <div className="text">系统覆盖面积</div>
                  </div>
                  <div className="title">
                    <div className="num">{item.num2}</div>
                    <div className="text">单元网格数量</div>
                  </div>
                  <div className="title">
                    <div className="num">{item.num3}</div>
                    <div className="text">责任网格数量</div>
                  </div>
                </div>
                <div className="bottom">
                  <div className="chart">
                    <ReactEcharts
                      option={getOption1(item.name)}
                      notMerge
                      lazyUpdate
                      style={{ height: '100%', width: '100%' }}
                    />
                  </div>
                  <div className="chart">
                    <ReactEcharts
                      option={getOption2(item.name)}
                      notMerge
                      lazyUpdate
                      style={{ height: '100%', width: '100%' }}
                    />
                  </div>
                </div>
              </div>
            </Rect>
          </div>)}
      </div>
    </div>
  );
}
export default Home;

