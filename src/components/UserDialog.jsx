import React, { useState, useEffect } from "react";
import useScreenSize from '../hooks/useScreenSize';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import { Checkbox } from 'primereact/checkbox';

const UserDialog = ({ visible, onHide, onSave, user }) => {
  const isMobile = useScreenSize();

  const [formData, setFormData] = useState({
    email: '',
    emailVerified: false,
    isAdmin: false,
  });

  useEffect(() => {
    if (user) {
      setFormData({
        email: user.email,
        emailVerified: user.emailVerified,
        isAdmin: user.customClaims?.admin || false,
      });
    }
  }, [user]);

  const handleInputChange = (e) => {
    const { name, value, checked } = e.target;
    setFormData({ ...formData, [name]: name === 'emailVerified' || name === 'isAdmin' ? checked : value });
  };

  const handleSave = () => {
    onSave(user.uid, formData);
    onHide();
  };

  return (
    <Dialog 
      visible={visible} 
      onHide={onHide} 
      header="Edit User"
      className={isMobile ? "user-dialog-mobile" : ""}
    >
      <div className="p-fluid">
        <div className="p-field">
          <label htmlFor="email">Email</label>
          <InputText id="email" name="email" value={formData.email} onChange={handleInputChange} />
        </div>
        <div className="p-field-checkbox">
          <Checkbox inputId="emailVerified" name="emailVerified" checked={formData.emailVerified} onChange={handleInputChange} />
          <label htmlFor="emailVerified">Email Verified</label>
        </div>
        <div className="p-field-checkbox">
          <Checkbox inputId="isAdmin" name="isAdmin" checked={formData.isAdmin} onChange={handleInputChange} />
          <label htmlFor="isAdmin">Admin</label>
        </div>
      </div>
      <Button label="Save" icon="pi pi-check" onClick={handleSave} />
    </Dialog>
  );
};

export default UserDialog;