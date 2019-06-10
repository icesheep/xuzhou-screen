import React, { Component } from 'react';
import Header from './components/Header';
import './index.css';
import { Layout, LocaleProvider } from 'antd';
import { isMac, getExploreName } from './utils';
import zh_CN from 'antd/lib/locale-provider/zh_CN';
import 'moment/locale/zh-cn';
import pagesConfig from './routes/config';
import { ContextProvider } from '@/reducer/header';
const { Content } = Layout;

export default class App extends Component {
  

  constructor(props) {
    super(props)
    this.state = {
    }
    this.handleResize = this.handleResize.bind(this);
    this.backNav = this.backNav.bind(this);
  }

  handleResize() {
    // const zoom = document.documentElement.clientWidth / 1920;
    // const myZoom = (zoom < 0.75 ? 0.75 : zoom);
    // this.props.saveZoom(myZoom);
    // document.body.style.zoom = myZoom;
  }

  componentDidMount() {
    const exploreName = getExploreName();
    if (!(exploreName === 'Edge' || exploreName === 'IE' || exploreName === 'IE>=11')) {
      this.handleResize();
      window.addEventListener('resize', this.handleResize);
    }
    document.title = pagesConfig.title;
  }

  getAbsoluteUrl = (url) => {
    if(url && url.length > 0) {
              if (url.indexOf("http") === 0) {
                  return url;
              } else {
                  if (typeof eUrban === "undefined" || typeof window.eUrban.global === "undefined" || window.eUrban.global.originPath === "undefined") {
                      return url;
                  }
                  return window.eUrban.global.originPath + url;
              }
          }
          return url;
      }

  componentWillUnmount() {
    const exploreName = getExploreName();
    if (!(exploreName === 'Edge' || exploreName === 'IE' || exploreName === 'IE>=11')) {
      window.removeEventListener('resize',this.handleResize);
    }
  }

  backNav() {
    return <Header />;
  }

  render() {
    return (
      <LocaleProvider locale={zh_CN}>
        <ContextProvider>
        <Layout className={`outer-bg ${isMac() ? 'macpc' : ''}`}>
          {
            this.backNav()
          }

          <Content className="content-box">
          {
            this.props.children
          }
          </Content>
        </Layout>
          </ContextProvider>
      </LocaleProvider>
    )
  }
}
