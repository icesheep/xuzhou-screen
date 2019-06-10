const { injectBabelPlugin } = require('react-app-rewired'); // 重写webpack
const rewireLess = require('react-app-rewire-less'); //antd 主题
const path = require('path'); // 路径
const webpack = require("webpack");

module.exports = function override(config, env) {
  config = injectBabelPlugin(
    ['import', { libraryName: 'antd', libraryDirectory: 'es', style: true }],
    config
  );

  config = rewireLess.withLoaderOptions({
    modifyVars: {
      "@primary-color": "#30E8FD",
      "@font-size-base": "16px"
    },
    javascriptEnabled: true
  })(config, env);

  config.resolve.alias = {
    '@': path.resolve(__dirname) + '/src/'
  }

  if (env.NODE_ENV === 'production') {
    config.devtool = false;
  }

  config.plugins = [...config.plugins,
    new webpack.optimize.CommonsChunkPlugin({
     minChunks: 2,
     minSize: 0,
     children: true,
     deepChildren: true,
     async: true
   })
  ];

  return config;
};
