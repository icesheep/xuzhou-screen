import React from 'react';
import { Spin } from 'antd';

export default class Bundle extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      splitCmp: null
    };
  }

  componentWillMount() {
    this.load(this.props)
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.load !== this.props.load) {
      this.load(nextProps)
    }
  }

  load(props) {
    this.setState({
      splitCmp: null
    });
    props.load().then((splitCmp) => {
      this.setState({
          splitCmp: splitCmp.default ? splitCmp.default : splitCmp
      });
    });
  }

  render() {
    const { splitCmp } = this.state;
    let spin = <div style={{textAlign: 'center', marginTop:50}}><Spin size="large"/><br/>别急，正在拼命加载中。。。</div>;
    return splitCmp ? this.props.children(splitCmp) : spin;
  }
}
