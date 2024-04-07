import FilesUploader from "./components/FileUploader/FilesUploader";
import "react-toastify/dist/ReactToastify.css";
import { ToastContainer } from "react-toastify";
function App() {
  return (
    <>
      <FilesUploader />
      <ToastContainer position="top-center" theme="dark" />
    </>
  );
}

export default App;
