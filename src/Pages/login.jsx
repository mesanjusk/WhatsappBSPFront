import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import apiClient from '../services/apiClient';
import { useAuth } from '../context/AuthContext';
import { ROUTES } from '../routes/routeConstants';

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [userName, setUserName] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorText, setErrorText] = useState('');

  const submit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setErrorText('');

    try {
      const response = await apiClient.post('/api/users/login', {
        User_name: userName,
        Password: password,
      });

      const data = response?.data || {};

      if (!data.success || !data.token) {
        setErrorText(data.message || 'Login failed. Please check username and password.');
        return;
      }

      login(data.token, {
        userName: data.user?.User_name || userName,
        userGroup: data.user?.User_group || '',
        mobileNumber: data.user?.Mobile_number || '',
      });

      toast.success('Login successful.');
      navigate(ROUTES.WHATSAPP, { replace: true });
    } catch (error) {
      setErrorText(
        error?.response?.data?.message || 'Login failed. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <form onSubmit={submit}>
        <input
          type="text"
          value={userName}
          onChange={(e) => setUserName(e.target.value)}
          placeholder="Username"
        />

        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
        />

        {errorText ? <p>{errorText}</p> : null}

        <button type="submit" disabled={loading}>
          {loading ? 'Logging in...' : 'Login'}
        </button>
      </form>
    </div>
  );
};

export default Login;