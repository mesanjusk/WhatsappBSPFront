import { useCallback, useEffect, useMemo, useState } from 'react';
import { toast } from '../../../Components';
import { whatsappCloudService } from '../../../services/whatsappCloudService';
import { parseApiError } from '../../../utils/parseApiError';

export const initialFormState = {
  keyword: '',
  matchType: 'contains',
  replyMode: 'text',
  replyText: '',
  templateName: '',
  templateLanguage: 'en_US',
  active: true,
  delaySeconds: '',
};

export const matchesRule = (rule, input) => {
  const text = String(input || '').trim().toLowerCase();
  const keyword = String(rule?.keyword || '').trim().toLowerCase();

  if (!text || !keyword || !rule?.active) return false;
  if (rule.matchType === 'exact') return text === keyword;
  if (rule.matchType === 'starts_with') return text.startsWith(keyword);
  return text.includes(keyword);
};

export const normalizeRules = (list) =>
  (Array.isArray(list) ? list : []).map((rule) => {
    const replyType = String(rule?.replyType || rule?.replyMode || 'text').toLowerCase();
    const active =
      typeof rule?.active === 'boolean' ? rule.active : Boolean(rule?.isActive);
    const templateLanguage = String(
      rule?.templateLanguage || rule?.language || 'en_US'
    );

    return {
      ...rule,
      id: rule?.id || rule?._id || `${rule?.keyword || 'rule'}-${Math.random()}`,
      active,
      isActive: active,
      replyMode: replyType,
      replyText:
        replyType === 'text' ? String(rule?.reply || rule?.replyText || '') : '',
      templateName:
        replyType === 'template'
          ? String(rule?.reply || rule?.templateName || '')
          : '',
      templateLanguage,
    };
  });

export function useAutoReplyManagement() {
  const [rules, setRules] = useState([]);
  const [fallbackReply, setFallbackReply] = useState(
    'Thanks for your message. Our team will reply shortly.'
  );
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRuleId, setEditingRuleId] = useState(null);
  const [formData, setFormData] = useState(initialFormState);
  const [testInput, setTestInput] = useState('');
  const [testResult, setTestResult] = useState('');
  const [isSavingRule, setIsSavingRule] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const loadAutoReplyRules = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await whatsappCloudService.getAutoReplyRules();
      const list =
        response?.data?.data?.rules ||
        response?.data?.rules ||
        response?.data?.data ||
        response?.data ||
        [];
      const normalized = normalizeRules(list);
      setRules(normalized);
      return normalized;
    } catch (error) {
      toast.error(parseApiError(error, 'Failed to load auto-reply rules.'));
      return [];
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAutoReplyRules();
  }, [loadAutoReplyRules]);

  const editingRule = useMemo(
    () => rules.find((rule) => rule.id === editingRuleId) || null,
    [editingRuleId, rules]
  );

  const openAddModal = () => {
    setEditingRuleId(null);
    setFormData(initialFormState);
    setIsModalOpen(true);
  };

  const openEditModal = (rule) => {
    setEditingRuleId(rule.id);
    setFormData({
      ...initialFormState,
      keyword: rule.keyword || '',
      matchType: rule.matchType || 'contains',
      replyMode: rule.replyMode || 'text',
      replyText: rule.replyText || '',
      templateName: rule.templateName || '',
      templateLanguage: rule.templateLanguage || 'en_US',
      active: rule.active,
      delaySeconds: rule.delaySeconds ?? '',
    });
    setIsModalOpen(true);
  };

  const buildRulePayload = () => ({
    keyword: formData.keyword.trim(),
    matchType: formData.matchType,
    replyType: formData.replyMode,
    reply:
      formData.replyMode === 'text'
        ? formData.replyText.trim()
        : formData.templateName.trim(),
    templateLanguage:
      formData.replyMode === 'template'
        ? String(formData.templateLanguage || 'en_US').trim() || 'en_US'
        : undefined,
    isActive: Boolean(formData.active),
    delaySeconds:
      formData.delaySeconds === '' ? null : Number(formData.delaySeconds),
  });

  const handleSaveRule = async (event) => {
    event.preventDefault();
    const payload = buildRulePayload();

    if (!payload.keyword) {
      toast.error('Keyword is required.');
      return;
    }

    if (payload.replyType === 'text' && !payload.reply) {
      toast.error('Reply text is required for text mode.');
      return;
    }

    if (payload.replyType === 'template' && !payload.reply) {
      toast.error('Template name is required for template mode.');
      return;
    }

    setIsSavingRule(true);

    try {
      if (editingRuleId) {
        await whatsappCloudService.updateAutoReplyRule(editingRuleId, payload);
        toast.success('Rule updated.');
      } else {
        await whatsappCloudService.createAutoReplyRule(payload);
        toast.success('Rule added.');
      }

      setIsModalOpen(false);
      setFormData(initialFormState);
      setEditingRuleId(null);
      await loadAutoReplyRules();
    } catch (error) {
      toast.error(parseApiError(error, 'Failed to save rule.'));
    } finally {
      setIsSavingRule(false);
    }
  };

  const handleDelete = async (ruleId) => {
    try {
      await whatsappCloudService.deleteAutoReplyRule(ruleId);
      await loadAutoReplyRules();
      toast.success('Rule deleted.');
    } catch (error) {
      toast.error(parseApiError(error, 'Failed to delete rule.'));
    }
  };

  const handleToggle = async (ruleId) => {
    try {
      const response = await whatsappCloudService.toggleAutoReplyRule(ruleId);
      const updatedRule = normalizeRules([response?.data?.data || response?.data])[0];
      setRules((prev) =>
        prev.map((item) => (item.id === ruleId ? updatedRule : item))
      );
      toast.success('Rule updated.');
    } catch (error) {
      toast.error(parseApiError(error, 'Failed to toggle rule.'));
    }
  };

  const handleTest = () => {
    const matchedRule = rules.find((rule) => matchesRule(rule, testInput));

    if (matchedRule) {
      setTestResult(
        matchedRule.replyMode === 'template'
          ? `Template: ${matchedRule.templateName} (${matchedRule.templateLanguage || 'en_US'})`
          : matchedRule.replyText
      );
      return;
    }

    setTestResult(fallbackReply.trim() || 'No reply would be sent.');
  };

  return {
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
  };
}
