import React, { useState } from 'react';
import axios from 'axios';
import fileIcon from "../assets/file.png";
import folderIcon from "../assets/folder.png";
import renameIcon from "../assets/rename.png";
import downloadIcon from "../assets/download.png";
import deleteIcon from "../assets/delete.png";
import '../styles/File.css'
import apiEndpoint from '../main';
import Modal from './Modal';

function File({file, currentFolderPath, updatePath, updateFolderChildren, setBackStack, currentChildren, forwardStack, setForwardStack, updateFileStructure}){
    let type = file.type;
    let name = file.name;
    let path = file.path;
    let folderChildren = file.children;

    let deleteRef = React.createRef();
    let cancelDeleteBtnRef = React.createRef();
    let confirmDeleteBtnRef = React.createRef();

    let renameRef = React.createRef();
    let cancelRenameBtnRef = React.createRef();
    let confirmRenameBtnRef = React.createRef();
    const [newName, setNewName] = useState(name);

    let folderOnClick = () => {
        updatePath(path);
        setBackStack(prev => {prev.push({path: currentFolderPath, children: currentChildren}); return prev;});

        if(forwardStack.length !== 0){
            //console.log("forwardStack[last element] is different from current path: ", forwardStack[forwardStack.length - 1].path.includes(path));
            setForwardStack([]);
        }

        updateFolderChildren(folderChildren);
        console.log(file);
    }

    let downloadFile = () => {
        const url = `${apiEndpoint}download?path=${encodeURIComponent(path)}`;

        axios({url: url, method: 'GET', responseType: 'blob',}).then(response => {
            const blob = new Blob([response.data]);
            // create a URL for the blob object
            const url = window.URL.createObjectURL(blob);
            
            // create a link element and click it to trigger the download
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', name);
            document.body.appendChild(link);
            link.click();
            
            // clean up... remove the link and revoke the URL
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
        }).catch(error => {
            console.error('Error downloading file:', error);
        });
    }

    let downloadFolder = (event) => {
        // this prevents the folder from accidentally being opened when trying to download it
        event.stopPropagation();

        const url = `${apiEndpoint}downloadFolder?path=${encodeURIComponent(path)}`;

        axios({url: url, method: 'GET', responseType: 'blob',}).then(response => {
            const blob = new Blob([response.data]);
            const url = window.URL.createObjectURL(blob);
            
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `${name}.zip`);
            document.body.appendChild(link);
            link.click();
            
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
        }).catch(error => {
            console.error('Error downloading folder:', error);
        });
    }

    let handleDelete = () => {
        let deletingFile = type === "file" ? true : false;
        const url = `${apiEndpoint}${deletingFile ? "deleteFile" : "deleteFolder"}?path=${encodeURIComponent(path)}`;

        axios.delete(url).then(response => {
            console.log(`${deletingFile ? "File" : "Folder"} deleted successfully`);
            alert(`${deletingFile ? "File" : "Folder"} with name: "${name}" was deleted successfully!`);

            updateFileStructure();
        }).catch(error => {
            console.error(`Error deleting ${deletingFile ? "file" : "folder"}:`, error);
            alert(`Something went wrong! An error occured when trying to delete the ${deletingFile ? "file" : "folder"}.`);
        });
    }

    let handleRename = () => {
        console.log("path: ", path, "    newName: ", newName);
        axios.put(apiEndpoint + 'rename', {
            oldPath: path,
            newName: newName
        }).then(response => {
            console.log('Folder renamed successfully');
            updateFileStructure();
        }).catch(error => {
            console.error('Error renaming folder:', error);
        });
    }

    const handleInputChange = (event) => {
        setNewName(event.target.value);
    };

    return (
        <>
            <div className='file' onClick={type == "file" ? () => {} : folderOnClick}>
                <img src={type == "file" ? fileIcon : folderIcon} className={type == "file" ? "blue-icon-color" : "yellow-icon-color"} />
                <label>{name}</label>
                <div className='file-actions-container'>
                    <label title="Rename" ref={renameRef}>
                        <img src={renameIcon} />
                    </label>
                    <label title="Download" onClick={type == "file" ? downloadFile : (event) => downloadFolder(event)}>
                        <img src={downloadIcon} />
                    </label>
                    <label title="Delete" ref={deleteRef}>
                        <img src={deleteIcon} />
                    </label>
                </div>
            </div>

            <Modal openBtnRef={deleteRef} cancelBtnRefs={[cancelDeleteBtnRef, confirmDeleteBtnRef]}>
                <div className='flex flex-column gap-20'>
                    <label>{`Are you sure you want to delete ${type} with name: "${name}"?`}</label>
                    <div className='flex justify-center align-center gap-50'>
                        <button ref={confirmDeleteBtnRef} onClick={handleDelete}>Yes</button>
                        <button ref={cancelDeleteBtnRef}>No</button>
                    </div>
                </div>
            </Modal>

            <Modal openBtnRef={renameRef} cancelBtnRefs={[cancelRenameBtnRef, confirmRenameBtnRef]}>
                <div style={{ gap: "8px" }} className='flex flex-column'>
                    <label>{`Enter new name:`}</label>
                    <input className="rename-input-field" value={newName} onChange={handleInputChange} />
                    <div style={{ marginTop: "15px" }} className='flex justify-center align-center gap-50'>
                        <button ref={confirmRenameBtnRef} onClick={handleRename}>Confirm</button>
                        <button ref={cancelRenameBtnRef}>Cancel</button>
                    </div>
                </div>
            </Modal>
        </>
    )
}

export default File