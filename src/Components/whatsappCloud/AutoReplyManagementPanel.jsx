import {
  Box,
  Button,
  Chip,
  Paper,
  Stack,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import Modal from '../common/Modal';
import { useAutoReplyManagement } from './hooks/useAutoReplyManagement';

export default function AutoReplyManagementPanel() {
  const {
    rules,
    fallbackReply,
    isModalOpen,
    editingRule,
    formData,
    testInput,
    testResult,
    isSavingRule,
    isLoading,
    setFallbackReply,
    setIsModalOpen,
    setFormData,
    setTestInput,
    loadAutoReplyRules,
    openAddModal,
    openEditModal,
    handleSaveRule,
    handleDelete,
    handleToggle,
    handleTest,
  } = useAutoReplyManagement();

  return (
    <Paper variant="outlined" sx={{ p: 2.5, borderRadius: { xs: 0, md: 3 }, height: '100%', overflow: 'auto' }}>
      <Stack spacing={2}>
        <Stack direction="row" justifyContent="space-between" spacing={1}>
          <Box>
            <Typography variant="h6" fontWeight={700}>Auto Reply Rules</Typography>
            <Typography variant="body2" color="text.secondary">Backend-driven keyword and template automations.</Typography>
          </Box>
          <Button variant="outlined" onClick={loadAutoReplyRules}>Refresh</Button>
        </Stack>

        <TextField
          multiline
          rows={2}
          label="Fallback reply preview"
          value={fallbackReply}
          onChange={(event) => setFallbackReply(event.target.value)}
        />

        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
          <TextField
            value={testInput}
            onChange={(event) => setTestInput(event.target.value)}
            placeholder="Simulate incoming message"
            fullWidth
          />
          <Button variant="contained" onClick={handleTest}>Test</Button>
        </Stack>
        {testResult ? <Typography variant="body2">Reply: <strong>{testResult}</strong></Typography> : null}

        <Stack direction="row" justifyContent="flex-end">
          <Button variant="contained" onClick={openAddModal}>Add Rule</Button>
        </Stack>

        <Box sx={{ overflowX: 'auto', border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Keyword</TableCell>
                <TableCell>Reply</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {isLoading ? (
                <TableRow><TableCell colSpan={4} align="center">Loading rules...</TableCell></TableRow>
              ) : null}
              {!isLoading && rules.length === 0 ? (
                <TableRow><TableCell colSpan={4} align="center">No auto-reply rules configured.</TableCell></TableRow>
              ) : rules.map((rule) => (
                <TableRow key={rule.id}>
                  <TableCell>{rule.keyword} <Typography component="span" variant="caption">({rule.matchType})</Typography></TableCell>
                  <TableCell>{rule.replyMode === 'template' ? `Template: ${rule.templateName} · ${rule.templateLanguage}` : rule.replyText}</TableCell>
                  <TableCell>
                    <Chip
                      label={rule.active ? 'Active' : 'Inactive'}
                      color={rule.active ? 'success' : 'default'}
                      size="small"
                      onClick={() => handleToggle(rule.id)}
                    />
                  </TableCell>
                  <TableCell align="right">
                    <Stack direction="row" spacing={1} justifyContent="flex-end">
                      <Button size="small" variant="outlined" onClick={() => openEditModal(rule)}>Edit</Button>
                      <Button size="small" color="error" variant="outlined" onClick={() => handleDelete(rule.id)}>Delete</Button>
                    </Stack>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Box>
      </Stack>

      {isModalOpen ? (
        <Modal onClose={() => setIsModalOpen(false)} title={editingRule ? 'Edit Rule' : 'Add Rule'}>
          <form onSubmit={handleSaveRule} className="space-y-4">
            <label className="block text-sm text-gray-700">Keyword<input value={formData.keyword} onChange={(event) => setFormData((prev) => ({ ...prev, keyword: event.target.value }))} className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2" /></label>
            <label className="block text-sm text-gray-700">Match Type<select value={formData.matchType} onChange={(event) => setFormData((prev) => ({ ...prev, matchType: event.target.value }))} className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2"><option value="contains">Contains</option><option value="exact">Exact</option><option value="starts_with">Starts with</option></select></label>
            <label className="block text-sm text-gray-700">Reply Mode<select value={formData.replyMode} onChange={(event) => setFormData((prev) => ({ ...prev, replyMode: event.target.value, templateName: event.target.value === 'template' ? prev.templateName : '', replyText: event.target.value === 'text' ? prev.replyText : '' }))} className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2"><option value="text">Reply Text</option><option value="template">Reply Template</option></select></label>
            {formData.replyMode === 'text' ? <label className="block text-sm text-gray-700">Reply<textarea rows={3} value={formData.replyText} onChange={(event) => setFormData((prev) => ({ ...prev, replyText: event.target.value }))} className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2" /></label> : <div className="grid grid-cols-1 gap-3 sm:grid-cols-2"><label className="block text-sm text-gray-700">Template Name<input value={formData.templateName} onChange={(event) => setFormData((prev) => ({ ...prev, templateName: event.target.value }))} className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2" /></label><label className="block text-sm text-gray-700">Language<input value={formData.templateLanguage} onChange={(event) => setFormData((prev) => ({ ...prev, templateLanguage: event.target.value }))} className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2" /></label></div>}
            <label className="block text-sm text-gray-700">Delay Seconds<input type="number" min="0" max="30" value={formData.delaySeconds} onChange={(event) => setFormData((prev) => ({ ...prev, delaySeconds: event.target.value }))} className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2" /></label>
            <label className="inline-flex items-center gap-2 text-sm text-gray-700"><Switch checked={formData.active} onChange={(event) => setFormData((prev) => ({ ...prev, active: event.target.checked }))} />Active</label>
            <div className="flex justify-end gap-2"><button type="button" onClick={() => setIsModalOpen(false)} className="rounded-lg border border-gray-300 px-4 py-2 text-sm">Cancel</button><button type="submit" disabled={isSavingRule} className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-60">{isSavingRule ? 'Saving...' : 'Save'}</button></div>
          </form>
        </Modal>
      ) : null}
    </Paper>
  );
}
