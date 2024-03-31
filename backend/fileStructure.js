const fs = require('fs');
const path = require('path');

// function to recursively read directory contents and construct file structure
function getFileStructure(folderPath) {
    return new Promise((resolve, reject) => {
        fs.readdir(folderPath, { withFileTypes: true }, (err, files) => {
            if (err) {
                reject(err);
                return;
            }

            const fileStructure = {
                name: path.basename(folderPath),
                path: folderPath,
                type: 'folder',
                children: []
            };

            files.forEach(file => {
                const filePath = path.join(folderPath, file.name);
                if (file.isDirectory()) {
                    // recursively read subfolders
                    getFileStructure(filePath)
                        .then(subfolderStructure => {
                            fileStructure.children.push(subfolderStructure);
                            if (fileStructure.children.length === files.length) {
                                resolve(fileStructure);
                            }
                        })
                        .catch(err => reject(err));
                } else {
                    // add files to the file structure
                    fileStructure.children.push({
                        name: file.name,
                        path: filePath,
                        type: 'file'
                    });
                    if (fileStructure.children.length === files.length) {
                        resolve(fileStructure);
                    }
                }
            });

            // if the folder is empty
            if (files.length === 0) {
                resolve(fileStructure);
            }
        });
    });
}

module.exports = { getFileStructure };