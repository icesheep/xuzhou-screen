export default {
  // 所有路由
  navsHome: [],
  routes: {
    routesHome: [],
    menus: [
      {
        route: '/home',
        title: '首页',
        img: require('../images/routes/city.png'),
        component: 'home',
        key: 'menu1',
        subs: null
      },
      // {
      //   route: '/interfaceMonitor',
      //   title: '接口监控',
      //   img: require('../images/routes/work.png'),
      //   component: 'interfaceMonitor',
      //   key: 'menu1',
      //   subs: null
      // },
      // {
      //   route: '/caseMonitor',
      //   title: '案件监控',
      //   img: require('../images/routes/app.png'),
      //   component: 'caseMonitor',
      //   key: 'menu1',
      //   subs: null
      // },
      // {
      //   route: '/appMonitor',
      //   title: 'APP监控',
      //   img: require('../images/routes/desktop.png'),
      //   component: 'appMonitor',
      //   key: 'menu1',
      //   subs: null
      // },
      // {
      //   route: '/warnMonitor',
      //   title: '报警信息',
      //   img: require('../images/routes/desktop.png'),
      //   component: 'warnMonitor',
      //   key: 'menu1',
      //   subs: null
      // }
    ],
  },
  logo: require('../images/logo.png'),
  redirect: '/home',
  title: '城管',
  // 自定义单独页面
  index: {

  }
}
