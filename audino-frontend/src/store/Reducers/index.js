import { combineReducers } from "redux";
import { loginReducer } from "./loginReducer";
import { projectReducer } from "./projectReducer";
import { taskReducer } from "./taskReducer";
import { annotationReducer } from "./annotationReducer";

const rootReducer = combineReducers({
  loginReducer,
  taskReducer,
  projectReducer,
  annotationReducer,
});

export default rootReducer;
