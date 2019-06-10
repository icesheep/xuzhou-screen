import React, { useState, useEffect } from 'react';
import './index.less';
const Modal = (props) => {
  const [visible,setVisible] = useState(props.visible)
  const [title] = useState(props.title)
  const [width] = useState(props.width || '8rem')
  const [height] = useState(props.height || '6rem')
  useEffect(() => {
    setVisible(props.visible)
  },[props.visible])
  return (
    <div>
      {
        visible ? <div className="eg-modal">
        <div className="eg-mask"></div>
        <div className="eg-document">
          <div className="eg-page">
            <div className="close-btn" onClick={props.onClose}>×</div>
            <div className="modal-title">{title}</div>
            <div className="modal-content" style={{width: width, height: height}}>
              {
                props.children
              }
            </div>
          </div>
        </div>
      </div> : null
      }
      
    </div>
  );
}
Modal['info'] = function (props) {
  return (
    <div>
      {
        <div className="eg-modal">
        <div className="eg-mask"></div>
        <div className="eg-document">
          <div className="eg-page">
            <div className="close-btn" onClick={props.onClose}>×</div>
            <div className="modal-title">{props.title}</div>
            <div className="modal-content" style={{width: props.width||'8rem', height: props.height||'6rem'}}>
              {
                props.children
              }
            </div>
          </div>
        </div>
      </div> 
      }
    </div>
  );
}

export default Modal;