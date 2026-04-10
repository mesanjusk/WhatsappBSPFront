import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, MenuItem, Paper, Stack, TextField, Typography } from '@mui/material';
import axios from '../apiClient.js';
import { FullscreenAddFormLayout } from '../components/ui';
import { compactCardSx, compactFieldSx } from '../components/ui/addFormStyles';

export default function AddCategory() {
  const navigate = useNavigate();

  const [Customer_name, setCustomer_Name] = useState('');
  const [Remark, setRemark] = useState('');
  const [userGroup, setUserGroup] = useState('');
  const [customerOptions, setCustomerOptions] = useState([]);

  useEffect(() => {
    axios.get('/customer/GetCustomersList')
      .then((res) => {
        if (res.data.success) {
          const options = res.data.result.map((item) => item.Customer_name);
          setCustomerOptions(options);
        }
      })
      .catch((err) => {
        console.error('Error fetching customer options:', err);
      });
  }, []);

  useEffect(() => {
    const group = localStorage.getItem('User_group');
    setUserGroup(group);
  }, []);

  function addCustomer() {
    navigate('/addCustomer');
  }

  async function submit(e) {
    e.preventDefault();

    try {
      if (!Customer_name) {
        alert('Customer Name is required.');
        return;
      }

      const response = await axios.post('/enquiry/addEnquiry', {
        Customer_name,
        Remark,
      });

      if (response.data.success) {
        alert(response.data.message);
        navigate('/allOrder');
      } else {
        alert('Failed to add Enquiry');
      }
    } catch (err) {
      console.log('Error adding Enquiry:', err);
    }
  }

  const closeModal = () => {
    if (userGroup === 'Office User') {
      navigate('/home');
    } else if (userGroup === 'Admin User') {
      navigate('/home');
    }
  };

  return (
    <FullscreenAddFormLayout
      onSubmit={submit}
      onClose={closeModal}
      submitLabel="Submit"
      cancelLabel="Close"
    >
      <Paper sx={compactCardSx}>
        <Stack spacing={1.2}>
          <Typography variant="h6" fontWeight={700}>Add Enquiry</Typography>
          <TextField
            label="Customer Name"
            select
            value={Customer_name}
            onChange={(e) => setCustomer_Name(e.target.value)}
            size="small"
            sx={compactFieldSx}
          >
            <MenuItem value="">Select Customer</MenuItem>
            {customerOptions.map((option) => (
              <MenuItem key={option} value={option}>{option}</MenuItem>
            ))}
          </TextField>

          <Button variant="outlined" onClick={addCustomer}>Add Customer</Button>

          <TextField
            label="Order Details"
            autoComplete="off"
            onChange={(e) => setRemark(e.target.value)}
            value={Remark}
            placeholder="Remarks"
            multiline
            minRows={3}
            size="small"
            sx={compactFieldSx}
          />
        </Stack>
      </Paper>
    </FullscreenAddFormLayout>
  );
}
