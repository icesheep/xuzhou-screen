import React, { useState, useEffect } from 'react';
import './index.less';
const Pagination = (props) => {
  const [currentPage,setCurrentPage] = useState(props.currentPage || 1)
  const [page,setPage] = useState(props.currentPage || '')
  // const [numPerPage,setNumPerPage] = useState(props.numPerPage || 10)
  const [totalPage,setTotalPage] = useState(props.totalPage || 1)
  const [totalRecord,setTotalRecord] = useState(props.totalRecord || 0)
  useEffect(() => {
    // useKey(props.tabIndex)
    setCurrentPage(props.currentPage)
    setPage(props.currentPage)
    // setNumPerPage(props.numPerPage)
    setTotalPage(props.totalPage || 0)
    setTotalRecord(props.totalRecord)
  },[props.currentPage,props.numPerPage,props.totalPage,props.totalRecord])
  function _handleChange(p) {
    if(p >= 1 && p <= totalPage) {
      // useCurrentPage(p);
      props.onChange&&props.onChange(p);
    }
  }
  function _prev() {
    if(currentPage-1 >= 1) {
      _handleChange(currentPage-1)
    }
  }
  function _next() {
    if(currentPage+1 <= totalPage) {
      _handleChange(currentPage+1)
    }
  }
  function _jumpPrev() {
    _handleChange(Math.max(1, currentPage - 5));
  }
  function _jumpNext() {
    _handleChange(Math.min(totalPage, currentPage + 5));
  }
  function onKeyup(e) {
    if(e.keyCode === 13) {
      _handleChange(e.target.value)
    }
  }
  function onChange(e) {
    setPage(e.target.value)
  }
  function getPage() {
    let pagerList = [];
    if(totalPage === 0) {
      return <li className="auto" title="暂无数据!">
        暂无数据!
      </li> 
    }else if(totalPage <= 9) {
      for(let i = 1; i <= totalPage; i++) {
        pagerList.push(<li className={currentPage === i?"active" : ""} onClick={_handleChange.bind(this,i)}>{i}</li>)
      }
    }else {
      var jumpPrev = <li onClick={_jumpPrev} title="向前5页">•••</li>;
      var jumpNext = <li onClick={_jumpNext} title="向后5页">•••</li>;
      var lastPager = <li onClick={_handleChange.bind(this,totalPage)} title={totalPage}>{totalPage}</li>;
      var firstPager = <li onClick={_handleChange.bind(this,1)} title={1}>1</li>;
      var left = Math.max(1, currentPage - 2);
      var right = Math.min(currentPage + 2, totalPage);
      if (currentPage - 1 <= 2) {
        right = 1 + 4;
      }
      if (totalPage - currentPage <= 2) {
        left = totalPage - 4;
      }
      for (var i = left; i <= right; i++) {
        var active = currentPage === i;
        pagerList.push(<li onClick={_handleChange.bind(this,i)} title={i} className={active?"active" : ""}>{i}</li>);
      }
      if (currentPage - 1 >= 4) {
        pagerList.unshift(jumpPrev);
      }
      if (totalPage - currentPage >= 4) {
        pagerList.push(jumpNext);
      }
      if (left !== 1) {
        pagerList.unshift(firstPager);
      }
      if (right !== totalPage) {
        pagerList.push(lastPager);
      }
    }
    pagerList.unshift(<li className="auto" title="上一页" onClick={_prev}>
      上一页
    </li>);
    pagerList.push(<li className="auto" title="下一页" onClick={_next}>
      下一页
    </li>);
    pagerList.push(<li className="auto" title="跳至">
      跳至<input onKeyUp={onKeyup} onChange={onChange} value={page} />页
    </li>);
    if(totalRecord > 0) {
      pagerList.push(<li className="auto" title={totalRecord}>
        共{totalRecord}条
      </li>);
    }
    return pagerList;
  }
  return (
    <div className="eg-pagination">
      <nav aria-label="Page navigation">
        <ul className="pagination">
          {getPage()}
        </ul>
      </nav>
    </div>
  );
}

export default Pagination;