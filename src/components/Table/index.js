import React, { useState, useEffect } from 'react';
import Pagination from '@/components/Pagination';
import './index.less';
const Table = (props) => {
  const [columns, setColumns] = useState(props.columns)
  const [data, setData] = useState(props.data)
  const [height] = useState(props.height)
  const [pagination, setPagination] = useState(props.pagination)
  const [selected, setSelected] = useState('')
  const [childrenflag, setChildrenflag] = useState(false);
  useEffect(() => {
    // useKey(props.tabIndex)
    setColumns(props.columns);
    setChildrenflag(hasChildren(props.columns||[]));
    setData(props.data);
    setPagination(props.pagination);
  }, [props.pagination, props.data, props.columns])
  function hasChildren(columns) {
    for(let i = 0; i < columns.length; i++) {
      if(columns[i].children) {
        return true;
      }
    }
    return false;
  }
  return (
    <div className="eg-table">
      <div className="table">
        <div className="thead">
          <div className="tr rec-head">
            {columns && columns.length > 0 && columns.map(v =>
              {
                return v.children ? <div className="th-child" style={{ flex: v.width || 1 }}>
                  <div className="th-child1" style={{ flex: v.width || 1 }}>
                    {v.name}
                  </div>
                  <div className="th-child1" style={{ flex: v.width || 1 }}>
                    {v.children.map(item => <div className="th-child2" style={{ flex: item.width || 1 }}>
                      {item.name}
                    </div>)}
                  </div>
                </div> : <div className="th" style={{ flex: v.width || 1, height: childrenflag ? '0.8rem' : '0.4rem',lineHeight: childrenflag ? '0.8rem' : '0.4rem' }}>
                  {v.name}
                </div>
              }
              
            )}
          </div>
        </div>
        <div className="tbody" style={{ height: height }}>
          {data && data.length > 0 && data.map((v, index) =>
            <div 
              className="tr rec-row" 
              style={{ cursor: props.rowSelelect ? 'pointer' : 'auto', backgroundColor: selected == v ? '#3b75bd' : null }} 
              onClick={() => { 
                if (props.rowSelelect) { props.rowSelelect(v); setSelected(v) } }
              }
            >
              {
                columns.map(j => {
                  return j.children ?
                    <div style={{ flex: j.width || 1,display: 'flex'}}>
                      {
                        j.children.map(item => <div className="td" title={!item.hideTitle && v[item.id]} style={{ flex: item.width || 1 }}>
                        {
                          item.formatter ? item.formatter(v[item.id], v, index) : v[item.id]
                        }
                      </div>)
                      }
                    </div>
                    : <div className="td" title={!j.hideTitle && v[j.id]} style={{ flex: j.width || 1 }}>
                      {
                        j.formatter ? j.formatter(v[j.id], v, index) : v[j.id]
                      }
                    </div>
                }
              )}
            </div>
          )}
        </div>
      </div>
      {pagination ? <Pagination
        {...pagination}
      /> : null}
    </div>
  );
}

export default Table;