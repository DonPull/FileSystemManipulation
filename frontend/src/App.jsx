import axios from 'axios';
import { useEffect, useRef, useState } from 'react'
import './App.css'
import apiEndpoint from './main';
import File from './components/File';
import arrowIcon from "./assets/arrow.png";
import uploadIcon from "./assets/upload.png";

function App() {
  const [fileStructure, setFileStructure] = useState({});
  const [currentFolderPath, setCurrentFolderPath] = useState("");
  const [currentChildren, setCurrentChildren] = useState([]);
  
  const [backStack, setBackStack] = useState([]);
  const [forwardStack, setForwardStack] = useState([]);
  let greyedOutColor = "invert(99%) sepia(3%) saturate(469%) hue-rotate(226deg) brightness(113%) contrast(5%)";

  const fileInputRef = useRef(null);

  let updateFileStructure = () => {
    axios.get(apiEndpoint + "fileStructure")
    .then(res => {setFileStructure(res.data)})
    .catch(err => console.log(err));
  }

  useEffect(() => {
    // get the file structure of the server in order to render it
    updateFileStructure();
  }, []);

  useEffect(() => {
    setCurrentFolderPath(fileStructure.path);
    setCurrentChildren(fileStructure.children !== undefined ? fileStructure.children : []);
    //console.log(fileStructure)
  }, [fileStructure]);

  useEffect(() => {
    //console.log("forwardStack changed -> ", forwardStack);
  }, [forwardStack]);

  let goBack = () => {
    if(backStack.length === 0) return;

    let obj = backStack.pop();
    setCurrentChildren(obj.children);
    setCurrentFolderPath(obj.path);

    setForwardStack(prev => {prev.push({path: currentFolderPath, children: currentChildren}); return prev;});
  }

  let goForward = () => {
    if(forwardStack.length === 0) return;

    let obj = forwardStack.pop();
    setCurrentChildren(obj.children);
    setCurrentFolderPath(obj.path);

    setBackStack(prev => {prev.push({path: currentFolderPath, children: currentChildren}); return prev;});
    console.log(forwardStack);
  }

  let handleFileUpload = (event) => {
    const file = event.target.files[0];
    const formData = new FormData();
    formData.append('file', file);

    axios.post(apiEndpoint + 'upload', formData, { headers: {'Content-Type': 'multipart/form-data'}}).then(response => {
      console.log('File uploaded successfully');
      updateFileStructure();
    })
    .catch(error => {
      console.error('Error uploading file:', error);
      alert("Something went wrong when uploading a file!");
    });
  }

  return (
    <>
      <div id="file-manager">

        <div id="header">
          <div id="controls-container">
            <img onClick={goBack} style={backStack.length === 0 ? {filter: greyedOutColor} : {}} src={arrowIcon}/>
            <img onClick={goForward} style={forwardStack.length === 0 ? {filter: greyedOutColor} : {}} src={arrowIcon}/>
          </div>

          <div id="current-path-container">
            <label title={currentFolderPath}>{currentFolderPath}</label>
          </div>
        </div>

        <div id="file-list">
          {currentChildren.length !== 0 ? currentChildren.map(e => {
            return (<File key={e.type + e.name} file={e} currentFolderPath={currentFolderPath} updatePath={setCurrentFolderPath} updateFolderChildren={setCurrentChildren} setBackStack={setBackStack} currentChildren={currentChildren} forwardStack={forwardStack} setForwardStack={setForwardStack} updateFileStructure={updateFileStructure} />)
          }) : <>This directory is empty.</>}
        </div>

      </div>

      <div id="upload-file-container" onClick={() => fileInputRef.current.click()}>
        <input
          type="file"
          onChange={handleFileUpload}
          style={{ display: 'none' }}
          ref={fileInputRef}
        />
        <img src={uploadIcon} />
        <label>Upload File</label>
      </div>
    </>
  )
}

export default App
