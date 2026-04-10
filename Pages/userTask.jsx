import { useEffect, useMemo, useState } from 'react';
import { Alert, Box, Button, Card, CardContent, Chip, Divider, Stack, Typography } from '@mui/material';
import { useAuth } from '../context/AuthContext';
import axios from '../apiClient';
import { fetchMyOrderTasks } from '../services/orderService';

export default function UserTask() {
  const { userName } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [attendanceFlow, setAttendanceFlow] = useState([]);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const loadPage = async () => {
    if (!userName) return;
    try {
      setError('');
      const [taskRes, attendanceRes] = await Promise.all([
        fetchMyOrderTasks(userName),
        axios.get(`/attendance/getTodayAttendance/${userName}`),
      ]);
      setTasks(taskRes?.data?.result?.orders || []);
      setAttendanceFlow(attendanceRes?.data?.flow || []);
      setMessage(taskRes?.data?.result?.message || '');
    } catch (err) {
      console.error(err);
      setError('Failed to load your day view.');
    }
  };

  useEffect(() => {
    loadPage();
  }, [userName]);

  const hasStarted = attendanceFlow.includes('In');
  const hasEnded = attendanceFlow.includes('Out');

  const saveAttendance = async (type) => {
    try {
      setError('');
      await axios.post('/attendance/addAttendance', {
        User_name: userName,
        Type: type,
        Status: type === 'Out' ? 'Completed' : 'Present',
        Time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      });
      await loadPage();
    } catch (err) {
      console.error(err);
      setError('Failed to update attendance.');
    }
  };

  const summary = useMemo(() => {
    const overdue = tasks.filter((task) => task.overdue).length;
    return `${tasks.length} order tasks for today${overdue ? ` • ${overdue} overdue` : ''}`;
  }, [tasks]);

  return (
    <Stack spacing={2} sx={{ p: { xs: 1, md: 2 } }}>
      <Box>
        <Typography variant="h5" fontWeight={700}>My day</Typography>
        <Typography color="text.secondary">Start attendance, then work your assigned order queue till 8:00 PM.</Typography>
      </Box>

      {error && <Alert severity="error">{error}</Alert>}
      {message && <Alert severity="info">{message}</Alert>}

      <Card>
        <CardContent>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} justifyContent="space-between" alignItems={{ sm: 'center' }}>
            <Box>
              <Typography variant="subtitle1" fontWeight={700}>Attendance actions</Typography>
              <Typography variant="body2" color="text.secondary">Today flow: {attendanceFlow.length ? attendanceFlow.join(' → ') : 'Not started'}</Typography>
            </Box>
            <Stack direction="row" spacing={1}>
              <Button variant="contained" disabled={hasStarted} onClick={() => saveAttendance('In')}>Start day</Button>
              <Button variant="outlined" disabled={!hasStarted || hasEnded} onClick={() => saveAttendance('Out')}>End day</Button>
            </Stack>
          </Stack>
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Box>
              <Typography variant="subtitle1" fontWeight={700}>Assigned order tasks</Typography>
              <Typography variant="body2" color="text.secondary">{summary}</Typography>
            </Box>
            <Chip label={tasks.length ? 'Working queue' : 'No tasks'} color={tasks.length ? 'primary' : 'default'} />
          </Stack>

          <Divider sx={{ my: 2 }} />

          <Stack spacing={1.5}>
            {tasks.map((task) => (
              <Box key={task._id} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2, p: 1.5 }}>
                <Typography fontWeight={700}>Order #{task.Order_Number}</Typography>
                <Typography variant="body2" color="text.secondary">Task: {task?.latestStatusTask?.Task || task.stage || 'Design'}</Typography>
                <Typography variant="body2" color="text.secondary">Due: {task?.dueDate ? new Date(task.dueDate).toLocaleString() : 'Today 8:00 PM'}</Typography>
                {task.overdue && <Chip size="small" color="error" label="Pending from previous day" sx={{ mt: 1 }} />}
              </Box>
            ))}
            {!tasks.length && <Typography variant="body2" color="text.secondary">No order tasks are assigned yet.</Typography>}
          </Stack>
        </CardContent>
      </Card>
    </Stack>
  );
}
