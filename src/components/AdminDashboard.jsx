import React, { useState, useRef, useEffect } from 'react';
import { Toast } from 'primereact/toast';
import { FileUpload } from 'primereact/fileupload';
import { ProgressBar } from 'primereact/progressbar';
import { Button } from 'primereact/button';
import { Tooltip } from 'primereact/tooltip';
import { Tag } from 'primereact/tag';
import { Paginator } from 'primereact/paginator';
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog';
import { storage } from '../firebaseConfig';
import { ref, uploadBytesResumable, getDownloadURL, listAll, deleteObject } from 'firebase/storage';
import '../css/admin.css';

const AdminDashboard = () => {
  const [uploadedImages, setUploadedImages] = useState([]);
  const [totalSize, setTotalSize] = useState(0);
  const toast = useRef(null);
  const fileUploadRef = useRef(null);
  const [first, setFirst] = useState(0);
  const [rows, setRows] = useState(12);
  const [uploadProgress, setUploadProgress] = useState({});

  useEffect(() => {
    loadImages();
  }, []);

  const loadImages = async () => {
    try {
      const imagesRef = ref(storage, 'images');
      const imageList = await listAll(imagesRef);
      const imageUrls = await Promise.all(
        imageList.items.map(async (item) => {
          const url = await getDownloadURL(item);
          return { name: item.name, url };
        })
      );
      setUploadedImages(imageUrls);
    } catch (error) {
      console.error("Error loading images:", error);
      toast.current.show({ severity: 'error', summary: 'Error', detail: 'Failed to load images' });
    }
  };

  const onTemplateSelect = (e) => {
    let _totalSize = totalSize;
    let files = e.files;

    Object.keys(files).forEach((key) => {
      _totalSize += files[key].size || 0;
    });

    setTotalSize(_totalSize);
  };

  const onTemplateUpload = async (e) => {
    let _totalSize = 0;

    for (let file of e.files) {
      _totalSize += file.size || 0;
      await uploadImage(file);
    }

    setTotalSize(_totalSize);
    toast.current.show({ severity: 'info', summary: 'Success', detail: 'File Uploaded' });
  };

  const uploadImage = async (file) => {
    const storageRef = ref(storage, `images/${file.name}`);
    const uploadTask = uploadBytesResumable(storageRef, file);

    uploadTask.on('state_changed',
      (snapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        setUploadProgress(prev => ({...prev, [file.name]: progress}));
      },
      (error) => {
        toast.current.show({ severity: 'error', summary: 'Error', detail: 'Failed to upload image' });
        setUploadProgress(prev => ({...prev, [file.name]: 0}));
      },
      async () => {
        const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
        setUploadedImages(prevImages => [...prevImages, { name: file.name, url: downloadURL }]);
        setUploadProgress(prev => ({...prev, [file.name]: 100}));
        
        // Clear the file from the FileUpload component
        if (fileUploadRef.current) {
          fileUploadRef.current.clear();
        }
      }
    );
  };

  const onTemplateRemove = (file, callback) => {
    setTotalSize(totalSize - file.size);
    callback();
  };

  const onTemplateClear = () => {
    setTotalSize(0);
  };

  const headerTemplate = (options) => {
    const { className, chooseButton, uploadButton, cancelButton } = options;
    const value = totalSize / 10000;
    const formatedValue = fileUploadRef && fileUploadRef.current ? fileUploadRef.current.formatSize(totalSize) : '0 B';

    return (
      <div className={`${className} admin-dashboard-header`}>
        <div className="admin-dashboard-header-buttons">
          {chooseButton}
          {uploadButton}
          {cancelButton}
        </div>
        <div className="admin-dashboard-header-info">
          <span>{formatedValue} / 1 MB</span>
          <ProgressBar value={value} showValue={false} className="admin-dashboard-progress-bar"></ProgressBar>
        </div>
      </div>
    );
  };

  const itemTemplate = (file, props) => {
    return (
      <div className="admin-dashboard-item">
        <div className="admin-dashboard-item-info">
          <img alt={file.name} role="presentation" src={file.objectURL} width={100} />
          <span className="admin-dashboard-item-details">
            <span className="admin-dashboard-item-name">{file.name}</span>
            <small>{new Date().toLocaleDateString()}</small>
          </span>
        </div>
        <Tag value={props.formatSize} severity="warning" className="admin-dashboard-item-tag" />
        <ProgressBar value={uploadProgress[file.name] || 0} className="admin-dashboard-item-progress" />
        <Button type="button" icon="pi pi-times" className="p-button-outlined p-button-rounded p-button-danger admin-dashboard-item-button" onClick={() => onTemplateRemove(file, props.onRemove)} />
      </div>
    );
  };

  const emptyTemplate = () => {
    return (
      <div className="admin-dashboard-empty">
        <i className="pi pi-image admin-dashboard-empty-icon"></i>
        <span className="admin-dashboard-empty-text">
          Drag and Drop Image Here
        </span>
      </div>
    );
  };

  const chooseOptions = { icon: 'pi pi-fw pi-images', iconOnly: true, className: 'custom-choose-btn p-button-rounded p-button-outlined' };
  const uploadOptions = { icon: 'pi pi-fw pi-cloud-upload', iconOnly: true, className: 'custom-upload-btn p-button-success p-button-rounded p-button-outlined' };
  const cancelOptions = { icon: 'pi pi-fw pi-times', iconOnly: true, className: 'custom-cancel-btn p-button-danger p-button-rounded p-button-outlined' };

  const handleDelete = (imageName) => {
    confirmDialog({
      message: 'Are you sure you want to delete this image?',
      header: 'Confirm Delete',
      icon: 'pi pi-exclamation-triangle',
      acceptClassName: 'p-button-danger',
      accept: () => deleteImage(imageName),
      reject: () => {}
    });
  };

  const deleteImage = async (imageName) => {
    try {
      const imageRef = ref(storage, `images/${imageName}`);
      await deleteObject(imageRef);
      setUploadedImages(uploadedImages.filter(img => img.name !== imageName));
      toast.current.show({ severity: 'success', summary: 'Success', detail: 'Image deleted successfully' });
    } catch (error) {
      toast.current.show({ severity: 'error', summary: 'Error', detail: 'Failed to delete image' });
    }
  };

  const onPageChange = (event) => {
    setFirst(event.first);
    setRows(event.rows);
  };

  return (
    <div className="admin-dashboard">
      <h2>Admin Dashboard</h2>
      <Toast ref={toast}></Toast>
      <ConfirmDialog />

      <Tooltip target=".custom-choose-btn" content="Choose" position="bottom" />
      <Tooltip target=".custom-upload-btn" content="Upload" position="bottom" />
      <Tooltip target=".custom-cancel-btn" content="Clear" position="bottom" />

      <FileUpload
        ref={fileUploadRef}
        name="demo[]"
        multiple
        accept="image/*"
        maxFileSize={1000000}
        customUpload
        uploadHandler={onTemplateUpload}
        onSelect={onTemplateSelect}
        onError={onTemplateClear}
        onClear={onTemplateClear}
        headerTemplate={headerTemplate}
        itemTemplate={itemTemplate}
        emptyTemplate={emptyTemplate}
        chooseOptions={chooseOptions}
        uploadOptions={uploadOptions}
        cancelOptions={cancelOptions}
        className="admin-dashboard-file-upload"
      />

      <div className="image-list">
        {uploadedImages.slice(first, first + rows).map((image, index) => (
          <div key={index} className="image-item">
            <img src={image.url} alt={image.name} />
            <Button
              icon="pi pi-trash"
              onClick={() => handleDelete(image.name)}
            />
          </div>
        ))}
      </div>
      <Paginator
        first={first}
        rows={rows}
        totalRecords={uploadedImages.length}
        onPageChange={onPageChange}
      />
    </div>
  );
};

export default AdminDashboard;