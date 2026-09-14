import { StrictMode } from 'react' 
import { createRoot } from 'react-dom/client' 
import './index.css' 
import ExamInterfaceReplica from './index.js' 

createRoot(document.getElementById('root')).render(
<StrictMode> 
  <ExamInterfaceReplica /> 
  </StrictMode>,
) 
