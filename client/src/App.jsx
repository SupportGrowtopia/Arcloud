import { useState, useEffect } from 'react';
import axios from 'axios';
import './styles/main.css';
import { Folder, FileText, ArrowLeft, CloudUpload, FolderPlus } from 'lucide-react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';


function App() {
  const [folders, setFolders] = useState([]);
  const [files, setFiles] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [newFolderName, setNewFolderName] = useState('');
  const [activeFolder, setActiveFolder] = useState(null); // null = root
  const [loading, setLoading] = useState(false);


  useEffect(() => {
    fetchFolders();
    fetchFiles();
  }, []);

  useEffect(() => {
    fetchFiles(activeFolder || '');
  }, [activeFolder]);

  const fetchFolders = async () => {
    const res = await axios.get('http://localhost:5000/api/folders');
    setFolders(res.data);
  };

  const fetchFiles = async (folder = '') => {
    const res = await axios.get(`http://localhost:5000/api/files?folder=${folder}`);
    setFiles(res.data);
  };

  const createFolder = async () => {
    if (!newFolderName) return;
    await axios.post('http://localhost:5000/api/folders', { folderName: newFolderName });
    setNewFolderName('');
    fetchFolders();
  };

  const uploadFile = async () => {
    if (!selectedFile) return;
    const formData = new FormData();
    formData.append('file', selectedFile);
    if (activeFolder) formData.append('folder', activeFolder);
  
    try {
      setLoading(true);
      await axios.post('http://localhost:5000/api/upload', formData);
      toast.success('File berhasil diupload!');
      setSelectedFile(null);
      fetchFiles(activeFolder);
    } catch (error) {
      toast.error('Gagal upload file!');
    } finally {
      setLoading(false);
    }
  };
  
  const renameFolder = async (oldName, newName) => {
    await axios.post('http://localhost:5000/api/folder/rename', {
      oldName,
      newName,
    });
    fetchFolders(); // Refresh list
  };
  

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) setSelectedFile(file);
  };  

  const deleteFolder = async (folderName) => {
    await axios.post('http://localhost:5000/api/folder/delete', { folderName });
    fetchFolders();
  };
  

  return (
    <div className="app">
      <ToastContainer position="top-center" />
      <div className="container">
        <div className="header">
          <CloudUpload className="icon" />
          <h1>Arcloud</h1>
        </div>
        <p className="tagline">Kelola file dan folder seperti Google Drive mini.</p>

        <div className="controls">
          <div className="folder-creator">
            <input
              type="text"
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              placeholder="Nama folder baru..."
            />
            <button onClick={createFolder}><FolderPlus size={16} /> Buat Folder</button>
          </div>
          <div className="upload-section">
          <input type="file" onChange={(e) => setSelectedFile(e.target.files[0])} />
          <button onClick={uploadFile} disabled={loading}>
              {loading ? 'Uploading...' : `Upload ke ${activeFolder || 'root'}`}
            </button>
              <div
                onDrop={handleDrop}
                onDragOver={(e) => e.preventDefault()}
                className="dropzone"
              >
                {selectedFile ? selectedFile.name : 'Drag & Drop file di sini atau pilih manual'}
              </div>
          </div>
        </div>

        {activeFolder && (
          <div className="back-button">
            <button onClick={() => setActiveFolder(null)}><ArrowLeft size={16} /> Kembali</button>
          </div>
        )}

        {!activeFolder && (
          <div className="folder-grid">
            {folders.map((folder, idx) => (
              <div key={idx} className="folder-card" onClick={() => setActiveFolder(folder)}>
                <Folder size={40} />
                <span>{folder}</span>
              </div>
            ))}
          </div>
        )}

        <div className="file-list">
          <h3>
            {activeFolder
              ? `📂 Isi Folder: ${activeFolder}`
              : '📁 File di Root'}
          </h3>

          {files.length === 0 && <p className="empty-msg">Belum ada file.</p>}

          {files.length > 0 && (
            <ul>
              {files.map((file, idx) => (
                <li key={idx}>
                  <FileText className="file-icon" />
                  <a
                    href={`http://localhost:5000/uploads/${activeFolder ? `${activeFolder}/` : ''}${file}`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    {file}
                  </a>
                </li>
              ))}
            </ul>
          )}
        </div>

        <footer>
          <p>© {new Date().getFullYear()} Arcloud. Dibuat dengan 💜 oleh Dear Putra.</p>
        </footer>
      </div>
    </div>
  );
}

export default App;
