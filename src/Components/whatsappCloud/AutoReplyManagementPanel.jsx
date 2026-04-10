import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Modal from '../common/Modal';
import client from '../../apiClient';
import { useAutoReplyManagement } from './hooks/useAutoReplyManagement';
import { ROUTES } from '../../constants/routes';

export default function AutoReplyManagementPanel() {
  const navigate = useNavigate();
  const [mode, setMode] = useState('simple');
  const [templates, setTemplates] = useState([]);
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

  useEffect(() => {
    const loadTemplates = async () => {
      try {
        const res = await client.get('/whatsapp/templates');
        const list = Array.isArray(res?.data?.templates) ? res.data.templates : [];

        // keep only static templates (no body variables)
        const safeTemplates = list.filter((tpl) => {
          const Components = Array.isArray(tpl?.Components) ? tpl.Components : [];
          const body = Components.find(
            (component) => String(component?.type || '').toUpperCase() === 'BODY'
          );
          return !String(body?.text || '').includes('{{');
        });

        setTemplates(safeTemplates);
      } catch (err) {
        console.error('Failed to load templates', err);
        setTemplates([]);
      }
    };

    loadTemplates();
  }, []);

  const handleModeChange = (value) => {
    setMode(value);
    if (value === 'flow') navigate(ROUTES.FLOW_BUILDER);
  };

  return (
    <section className="space-y-4 rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="inline-flex rounded-lg border border-gray-200 bg-gray-50 p-1">
        <button
          type="button"
          onClick={() => handleModeChange('simple')}
          className={`rounded-md px-3 py-1.5 text-sm font-medium ${
            mode === 'simple' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600'
          }`}
        >
          Simple Auto Reply
        </button>
        <button
          type="button"
          onClick={() => handleModeChange('flow')}
          className={`rounded-md px-3 py-1.5 text-sm font-medium ${
            mode === 'flow' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600'
          }`}
        >
          Flow Builder
        </button>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold text-gray-800">Auto Reply</h3>
          <p className="text-sm text-gray-500">
            Rules are stored on the backend and executed from webhook events.
          </p>
        </div>
        <button
          type="button"
          onClick={loadAutoReplyRules}
          className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700"
        >
          Refresh
        </button>
      </div>

      <label className="block text-sm text-gray-700">
        Fallback reply preview
        <textarea
          value={fallbackReply}
          onChange={(event) => setFallbackReply(event.target.value)}
          rows={2}
          className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2"
        />
        <span className="mt-1 block text-xs text-gray-500">
          This preview is for testing only. Your actual webhook fallback still comes
          from backend env/config.
        </span>
      </label>

      <div className="rounded-lg border border-gray-200 p-3">
        <p className="text-sm font-semibold text-gray-800">Test Auto Reply</p>
        <div className="mt-2 flex flex-col gap-2 sm:flex-row">
          <input
            value={testInput}
            onChange={(event) => setTestInput(event.target.value)}
            placeholder="Simulate incoming message"
            className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm"
          />
          <button
            type="button"
            onClick={handleTest}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white"
          >
            Test
          </button>
        </div>
        {testResult ? (
          <p className="mt-2 rounded bg-gray-50 px-3 py-2 text-sm text-gray-700">
            Reply: {testResult}
          </p>
        ) : null}
      </div>

      <div className="flex justify-end">
        <button
          type="button"
          onClick={openAddModal}
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white"
        >
          Add Rule
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left font-semibold text-gray-600">
                Keyword
              </th>
              <th className="px-4 py-3 text-left font-semibold text-gray-600">
                Reply
              </th>
              <th className="px-4 py-3 text-left font-semibold text-gray-600">
                Status
              </th>
              <th className="px-4 py-3 text-right font-semibold text-gray-600">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 bg-white">
            {isLoading ? (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-sm text-gray-500">
                  Loading rules...
                </td>
              </tr>
            ) : null}

            {!isLoading && rules.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-sm text-gray-500">
                  No auto-reply rules configured.
                </td>
              </tr>
            ) : (
              rules.map((rule) => (
                <tr key={rule.id}>
                  <td className="px-4 py-3 font-medium text-gray-800">
                    {rule.keyword}
                    <span className="ml-1 text-xs text-gray-500">
                      ({rule.matchType})
                    </span>
                  </td>
                  <td
                    className="max-w-md truncate px-4 py-3 text-gray-600"
                    title={rule.replyMode === 'template' ? rule.templateName : rule.replyText}
                  >
                    {rule.replyMode === 'template'
                      ? `Template: ${rule.templateName} · ${rule.templateLanguage}`
                      : rule.replyText}
                  </td>
                  <td className="px-4 py-3">
                    <button
                      type="button"
                      onClick={() => handleToggle(rule.id)}
                      className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                        rule.active
                          ? 'bg-emerald-50 text-emerald-700'
                          : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      {rule.active ? 'Active' : 'Inactive'}
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => openEditModal(rule)}
                        className="rounded-md border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-700"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(rule.id)}
                        className="rounded-md border border-red-200 px-3 py-1.5 text-xs font-medium text-red-700"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {isModalOpen ? (
        <Modal
          onClose={() => setIsModalOpen(false)}
          title={editingRule ? 'Edit Rule' : 'Add Rule'}
        >
          <form onSubmit={handleSaveRule} className="space-y-4">
            <label className="block text-sm text-gray-700">
              Keyword
              <input
                value={formData.keyword}
                onChange={(event) =>
                  setFormData((prev) => ({ ...prev, keyword: event.target.value }))
                }
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2"
              />
            </label>

            <label className="block text-sm text-gray-700">
              Match Type
              <select
                value={formData.matchType}
                onChange={(event) =>
                  setFormData((prev) => ({ ...prev, matchType: event.target.value }))
                }
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2"
              >
                <option value="contains">Contains</option>
                <option value="exact">Exact</option>
                <option value="starts_with">Starts with</option>
              </select>
            </label>

            <label className="block text-sm text-gray-700">
              Reply Mode
              <select
                value={formData.replyMode}
                onChange={(event) =>
                  setFormData((prev) => ({
                    ...prev,
                    replyMode: event.target.value,
                    templateName: event.target.value === 'template' ? prev.templateName : '',
                    replyText: event.target.value === 'text' ? prev.replyText : '',
                  }))
                }
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2"
              >
                <option value="text">Reply Text</option>
                <option value="template">Reply Template</option>
              </select>
            </label>

            {formData.replyMode === 'text' ? (
              <label className="block text-sm text-gray-700">
                Reply
                <textarea
                  rows={3}
                  value={formData.replyText}
                  onChange={(event) =>
                    setFormData((prev) => ({ ...prev, replyText: event.target.value }))
                  }
                  className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2"
                />
              </label>
            ) : (
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <label className="block text-sm text-gray-700">
                  Template Name
                  <select
                    value={formData.templateName}
                    onChange={(event) =>
                      setFormData((prev) => ({
                        ...prev,
                        templateName: event.target.value,
                      }))
                    }
                    className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2"
                  >
                    <option value="">Select template</option>
                    {templates.map((tpl) => (
                      <option key={tpl.id || tpl.name} value={tpl.name}>
                        {tpl.name}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="block text-sm text-gray-700">
                  Language
                  <input
                    value={formData.templateLanguage}
                    onChange={(event) =>
                      setFormData((prev) => ({
                        ...prev,
                        templateLanguage: event.target.value,
                      }))
                    }
                    className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2"
                  />
                </label>
              </div>
            )}

            <label className="block text-sm text-gray-700">
              Delay Seconds
              <input
                type="number"
                min="0"
                max="30"
                value={formData.delaySeconds}
                onChange={(event) =>
                  setFormData((prev) => ({
                    ...prev,
                    delaySeconds: event.target.value,
                  }))
                }
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2"
              />
            </label>

            <label className="inline-flex items-center gap-2 text-sm text-gray-700">
              <input
                type="checkbox"
                checked={formData.active}
                onChange={(event) =>
                  setFormData((prev) => ({ ...prev, active: event.target.checked }))
                }
              />
              Active
            </label>

            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSavingRule}
                className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSavingRule ? 'Saving...' : 'Save'}
              </button>
            </div>
          </form>
        </Modal>
      ) : null}
    </section>
  );
}