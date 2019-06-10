import React, { useState, useEffect } from 'react';
import './index.less';
const Tab = (props) => {
  const [key, setKey] = useState(props.tabIndex)
  const [children, setChildren] = useState(props.children)
  useEffect(() => {
    setKey(props.tabIndex);
    setChildren(props.children);
  },[props.children,props.tabIndex])
  return (
    <div className="eg-tab">
      <div className="wp-tab">
        {children.length > 0 && children.map(item => <div className={`wp-tab-nav ${item.key===key ? 'active' : ''}`} onClick={()=>{props.onChange(item)}}>{item.props.name}</div>)}
      </div>
      <div className="wp-tab-content">
        {
          children.filter((item) => item.key === key)
        }
      </div>
    </div>
  );
}

export default Tab;