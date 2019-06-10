import React, { useReducer } from "react";

const myContext = React.createContext();

function reducer(state, action) {
  switch (action.type) {
    case "changeDate":
      return action.payload;
    default:
      return state;
  }
}

const ContextProvider = props => {
  const [topDate, dispatch] = useReducer(reducer);
  return (
    <myContext.Provider value={{ topDate, dispatch }}>
      {props.children}
    </myContext.Provider>
  );
};

export { reducer, myContext, ContextProvider };