// import FilesUploader4 from './components/FilesUploader4'
import FilesUploader from './components/FileUploader/FilesUploader'
import 'react-toastify/dist/ReactToastify.css';
import { ToastContainer } from 'react-toastify';
function App() {
  return <>
<FilesUploader />
  {/* <FilesUploader4 /> */} <ToastContainer position="top-center" theme="dark"/>
  </>
}

export default App
