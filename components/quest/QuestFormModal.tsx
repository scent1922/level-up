import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Switch,
  Modal,
  ScrollView,
  Alert,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import FrequencyPicker, { FrequencyValue } from './FrequencyPicker';
import type { Quest } from '@/types';

interface Props {
  visible: boolean;
  quest?: Quest | null; // null/undefined = create mode
  onClose: () => void;
  onCreate: (params: Omit<Quest, 'id' | 'user_id' | 'created_at'>) => Promise<void>;
  onUpdate: (questId: string, updates: Partial<Quest>) => Promise<void>;
  onDelete: (questId: string) => Promise<void>;
}

const DEFAULT_FREQUENCY: FrequencyValue = { type: 'daily', value: '[]' };

function parseReminderTime(time: string | null): { hour: string; minute: string } {
  if (!time) return { hour: '09', minute: '00' };
  const [h, m] = time.split(':');
  return { hour: h ?? '09', minute: m ?? '00' };
}

export default function QuestFormModal({
  visible,
  quest,
  onClose,
  onCreate,
  onUpdate,
  onDelete,
}: Props) {
  const isEditMode = quest != null;

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [frequency, setFrequency] = useState<FrequencyValue>(DEFAULT_FREQUENCY);
  const [reminderEnabled, setReminderEnabled] = useState(false);
  const [reminderHour, setReminderHour] = useState('09');
  const [reminderMinute, setReminderMinute] = useState('00');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (visible) {
      if (quest) {
        setName(quest.name);
        setDescription(quest.description ?? '');
        setFrequency({ type: quest.frequency_type, value: quest.frequency_value });
        setReminderEnabled(quest.reminder_enabled);
        const { hour, minute } = parseReminderTime(quest.reminder_time);
        setReminderHour(hour);
        setReminderMinute(minute);
      } else {
        setName('');
        setDescription('');
        setFrequency(DEFAULT_FREQUENCY);
        setReminderEnabled(false);
        setReminderHour('09');
        setReminderMinute('00');
      }
      setLoading(false);
    }
  }, [visible, quest]);

  const reminderTime = reminderEnabled
    ? `${reminderHour.padStart(2, '0')}:${reminderMinute.padStart(2, '0')}`
    : null;

  const handleSubmit = useCallback(async () => {
    if (!name.trim()) {
      Alert.alert('이름 필요', '퀘스트 이름을 입력해주세요.');
      return;
    }
    setLoading(true);
    try {
      const params = {
        name: name.trim(),
        description: description.trim() || null,
        frequency_type: frequency.type,
        frequency_value: frequency.value,
        reminder_enabled: reminderEnabled,
        reminder_time: reminderTime,
        is_active: true,
      };
      if (isEditMode && quest) {
        await onUpdate(quest.id, params);
      } else {
        await onCreate(params);
      }
      onClose();
    } catch (e) {
      Alert.alert('오류', '저장 중 문제가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  }, [name, description, frequency, reminderEnabled, reminderTime, isEditMode, quest, onCreate, onUpdate, onClose]);

  const handleDelete = useCallback(() => {
    if (!quest) return;
    Alert.alert(
      '퀘스트 삭제',
      `"${quest.name}" 퀘스트를 삭제할까요?`,
      [
        { text: '취소', style: 'cancel' },
        {
          text: '삭제',
          style: 'destructive',
          onPress: async () => {
            setLoading(true);
            try {
              await onDelete(quest.id);
              onClose();
            } catch {
              Alert.alert('오류', '삭제 중 문제가 발생했습니다.');
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  }, [quest, onDelete, onClose]);

  const handleHourChange = (text: string) => {
    const cleaned = text.replace(/[^0-9]/g, '').slice(0, 2);
    setReminderHour(cleaned);
  };

  const handleMinuteChange = (text: string) => {
    const cleaned = text.replace(/[^0-9]/g, '').slice(0, 2);
    setReminderMinute(cleaned);
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        style={styles.overlay}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <TouchableOpacity style={styles.backdrop} onPress={onClose} activeOpacity={1} />
        <View style={styles.sheet}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>{isEditMode ? '퀘스트 수정' : '새 퀘스트'}</Text>
            <TouchableOpacity onPress={onClose} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <Text style={styles.closeBtn}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView
            style={styles.body}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {/* Name */}
            <View style={styles.field}>
              <Text style={styles.label}>퀘스트 이름 *</Text>
              <TextInput
                style={styles.input}
                placeholder="예: 매일 30분 달리기"
                placeholderTextColor="#555"
                value={name}
                onChangeText={(t) => setName(t.slice(0, 50))}
                maxLength={50}
                autoFocus={!isEditMode}
              />
              <Text style={styles.charCount}>{name.length}/50</Text>
            </View>

            {/* Description */}
            <View style={styles.field}>
              <Text style={styles.label}>설명 (선택)</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="퀘스트에 대한 간단한 설명..."
                placeholderTextColor="#555"
                value={description}
                onChangeText={(t) => setDescription(t.slice(0, 200))}
                multiline
                maxLength={200}
                numberOfLines={3}
              />
              <Text style={styles.charCount}>{description.length}/200</Text>
            </View>

            {/* Frequency */}
            <View style={styles.field}>
              <Text style={styles.label}>반복 주기</Text>
              <FrequencyPicker value={frequency} onChange={setFrequency} />
            </View>

            {/* Reminder */}
            <View style={styles.field}>
              <View style={styles.switchRow}>
                <Text style={styles.label}>알림</Text>
                <Switch
                  value={reminderEnabled}
                  onValueChange={setReminderEnabled}
                  trackColor={{ false: '#3A3A3A', true: '#3A2E10' }}
                  thumbColor={reminderEnabled ? '#C8A84B' : '#666'}
                />
              </View>
              {reminderEnabled && (
                <View style={styles.timeRow}>
                  <TextInput
                    style={styles.timeInput}
                    value={reminderHour}
                    onChangeText={handleHourChange}
                    keyboardType="number-pad"
                    maxLength={2}
                    placeholder="09"
                    placeholderTextColor="#555"
                  />
                  <Text style={styles.timeSep}>:</Text>
                  <TextInput
                    style={styles.timeInput}
                    value={reminderMinute}
                    onChangeText={handleMinuteChange}
                    keyboardType="number-pad"
                    maxLength={2}
                    placeholder="00"
                    placeholderTextColor="#555"
                  />
                </View>
              )}
            </View>

            <View style={styles.spacer} />
          </ScrollView>

          {/* Buttons */}
          <View style={styles.footer}>
            {isEditMode ? (
              <>
                <TouchableOpacity
                  style={styles.deleteBtn}
                  onPress={handleDelete}
                  disabled={loading}
                  activeOpacity={0.8}
                >
                  <Text style={styles.deleteBtnText}>삭제</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.saveBtn, loading && styles.btnDisabled]}
                  onPress={handleSubmit}
                  disabled={loading}
                  activeOpacity={0.8}
                >
                  <Text style={styles.saveBtnText}>{loading ? '저장 중...' : '저장'}</Text>
                </TouchableOpacity>
              </>
            ) : (
              <TouchableOpacity
                style={[styles.createBtn, loading && styles.btnDisabled]}
                onPress={handleSubmit}
                disabled={loading}
                activeOpacity={0.8}
              >
                <Text style={styles.createBtnText}>{loading ? '만드는 중...' : '만들기'}</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  sheet: {
    backgroundColor: '#141414',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '90%',
    paddingBottom: Platform.OS === 'ios' ? 34 : 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#2A2A2A',
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#E8E8E8',
  },
  closeBtn: {
    fontSize: 18,
    color: '#888',
  },
  body: {
    paddingHorizontal: 20,
  },
  field: {
    marginTop: 20,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#888',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  input: {
    backgroundColor: '#1A1A1A',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#2A2A2A',
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: '#E8E8E8',
    fontSize: 15,
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  charCount: {
    fontSize: 11,
    color: '#555',
    textAlign: 'right',
    marginTop: 4,
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 0,
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    gap: 8,
  },
  timeInput: {
    width: 60,
    height: 44,
    backgroundColor: '#1A1A1A',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#2A2A2A',
    color: '#E8E8E8',
    fontSize: 20,
    fontWeight: '600',
    textAlign: 'center',
  },
  timeSep: {
    fontSize: 22,
    color: '#888',
    fontWeight: '600',
  },
  spacer: {
    height: 20,
  },
  footer: {
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: 20,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#2A2A2A',
  },
  createBtn: {
    flex: 1,
    backgroundColor: '#C8A84B',
    borderRadius: 12,
    paddingVertical: 15,
    alignItems: 'center',
  },
  createBtnText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0A0A0A',
  },
  saveBtn: {
    flex: 1,
    backgroundColor: '#C8A84B',
    borderRadius: 12,
    paddingVertical: 15,
    alignItems: 'center',
  },
  saveBtnText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0A0A0A',
  },
  deleteBtn: {
    flex: 0,
    paddingHorizontal: 20,
    borderRadius: 12,
    paddingVertical: 15,
    alignItems: 'center',
    backgroundColor: '#2A1A1A',
    borderWidth: 1,
    borderColor: '#5A2A2A',
  },
  deleteBtnText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#E05252',
  },
  btnDisabled: {
    opacity: 0.5,
  },
});
