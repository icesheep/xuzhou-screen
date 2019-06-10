import React, { useState } from 'react';
import './index.less';
const Rect = (props) => {
  const [title] = useState(props.title)
  return (
    <div className="rect-border">
      <div className="rect-title">
        {title}
        {props.extra}
      </div>
      <div className="rect-box">
        {
          props.children
        }
      </div>
    </div>
  );
}

export default Rect;