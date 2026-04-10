import { useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import {
  Box,
  Button,
  LinearProgress,
  Paper,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import UploadFileRoundedIcon from '@mui/icons-material/UploadFileRounded';
import { toast } from '../../Components/Toast';
import { buildTemplatePayload, whatsappCloudService } from '../../services/whatsappCloudService';
import TemplateSelector from './TemplateSelector';

const splitNumbers = (rawValue) =>
  String(rawValue || '')
    .split(/[\n,;\s]+/)
    .map((item) => item.replace(/[^\d+]/g, '').trim())
    .filter(Boolean);

export default function BulkSender({ standalone, search }) {
  const [numbersText, setNumbersText] = useState('');
  const [template, setTemplate] = useState(null);
  const [isSending, setIsSending] = useState(false);
  const [progress, setProgress] = useState({ total: 0, processed: 0, success: 0, failed: 0 });

  const numbers = useMemo(() => splitNumbers(numbersText), [numbersText]);

  const handleCsvUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const content = await file.text();
    setNumbersText((prev) => `${prev.trim()}\n${content}`.trim());
    event.target.value = '';
  };

  const sendBulkMessages = async () => {
    if (numbers.length === 0) return void toast.error('Please provide at least one recipient number.');
    if (!template?.name || !template?.language) return void toast.error('Please select a template first.');

    setIsSending(true);
    setProgress({ total: numbers.length, processed: 0, success: 0, failed: 0 });

    let success = 0;
    let failed = 0;

    for (let index = 0; index < numbers.length; index += 1) {
      const to = numbers[index];
      try {
        await whatsappCloudService.sendTemplateMessage(
          buildTemplatePayload({
            to,
            template: { name: template.name, language: template.language, parameters: template.parameters || [] },
          }),
        );
        success += 1;
      } catch {
        failed += 1;
      }
      setProgress({ total: numbers.length, processed: index + 1, success, failed });
    }

    failed > 0
      ? toast.error(`${failed} message(s) failed. ${success} sent successfully.`)
      : toast.success(`Bulk send completed. ${success} messages sent.`);

    setIsSending(false);
  };

  return (
    <Paper variant="outlined" sx={{ p: 2.5, borderRadius: standalone ? 0 : 3 }}>
      <Stack spacing={2}>
        <Box>
          <Typography variant="h6" fontWeight={700}>Broadcast Campaign</Typography>
          <Typography variant="body2" color="text.secondary">Send approved templates to multiple recipients.</Typography>
        </Box>

        <TextField
          multiline
          rows={5}
          disabled={isSending}
          value={numbersText}
          onChange={(event) => setNumbersText(event.target.value)}
          label="Recipient numbers"
          helperText="One number per line or comma separated"
          placeholder={'+14155552671\n+14155552672'}
        />

        <Button component="label" variant="outlined" startIcon={<UploadFileRoundedIcon />} sx={{ width: 'fit-content' }}>
          Upload CSV
          <input type="file" accept=".csv,text/csv" hidden onChange={handleCsvUpload} />
        </Button>

        <TemplateSelector selectedTemplate={template} onTemplateChange={setTemplate} disabled={isSending} searchQuery={search} />

        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.25} alignItems={{ sm: 'center' }}>
          <Button variant="contained" onClick={sendBulkMessages} disabled={isSending || numbers.length === 0}>
            {isSending ? 'Sending Broadcast…' : 'Send Broadcast'}
          </Button>
          <Typography variant="caption" color="text.secondary">Recipients: {numbers.length}</Typography>
        </Stack>

        {isSending ? <LinearProgress variant="determinate" value={(progress.processed / Math.max(progress.total, 1)) * 100} /> : null}

        <Stack direction="row" spacing={2} flexWrap="wrap">
          <Typography variant="body2">Total: <strong>{progress.total}</strong></Typography>
          <Typography variant="body2">Processed: <strong>{progress.processed}</strong></Typography>
          <Typography variant="body2" color="success.main">Success: <strong>{progress.success}</strong></Typography>
          <Typography variant="body2" color="error.main">Failed: <strong>{progress.failed}</strong></Typography>
        </Stack>
      </Stack>
    </Paper>
  );
}

BulkSender.propTypes = {
  standalone: PropTypes.bool,
  search: PropTypes.string,
};
BulkSender.defaultProps = {
  standalone: false,
  search: '',
};
