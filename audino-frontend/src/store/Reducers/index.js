import { combineReducers } from "redux";
import { loginReducer } from "./loginReducer";
import { projectReducer } from "./projectReducer";
import { taskReducer } from "./taskReducer";
import { annotationReducer } from "./annotationReducer";
import { cloudReducer } from "./cloudstorageReducer";

const rootReducer = combineReducers({
  loginReducer,
  taskReducer,
  projectReducer,
  annotationReducer,
  cloudReducer,
});

export default rootReducer;
