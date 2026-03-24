import React from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { useShelterStore } from '@/stores/shelter-store';
import { useUserStore } from '@/stores/user-store';
import { REVIVAL_COST } from '@/constants/balance';

interface RevivalModalProps {
  visible: boolean;
  daysRemaining: number;
  onDismiss: () => void;
  onRevived: () => void;
}

export default function RevivalModal({
  visible,
  daysRemaining,
  onDismiss,
  onRevived,
}: RevivalModalProps) {
  const reviveShelter = useShelterStore((state) => state.reviveShelter);
  const user = useUserStore((state) => state.user);

  const currentPoints = user?.points ?? 0;
  const canAfford = currentPoints >= REVIVAL_COST;

  const handleRevive = async () => {
    const success = await reviveShelter();
    if (success) {
      onRevived();
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
    >
      <View style={styles.backdrop}>
        <View style={styles.modalContainer}>
          <Text style={styles.header}>쉘터를 살릴 수 있습니다!</Text>

          <View style={styles.warningBadge}>
            <Text style={styles.warningText}>⚠ 남은 시간: {daysRemaining}일</Text>
          </View>

          <Text style={styles.description}>
            지금 부활시키지 않으면 쉘터가 영구적으로 파괴됩니다.
          </Text>

          <View style={styles.costRow}>
            <Text style={styles.costLabel}>필요 포인트</Text>
            <Text style={styles.costValue}>{REVIVAL_COST} P</Text>
          </View>

          <View style={styles.balanceRow}>
            <Text style={styles.balanceLabel}>현재 잔액</Text>
            <Text style={[styles.balanceValue, !canAfford && styles.balanceInsufficient]}>
              {currentPoints} P
            </Text>
          </View>

          {!canAfford && (
            <Text style={styles.insufficientText}>포인트가 부족합니다.</Text>
          )}

          <TouchableOpacity
            style={[styles.reviveButton, !canAfford && styles.reviveButtonDisabled]}
            onPress={handleRevive}
            disabled={!canAfford}
          >
            <Text style={styles.reviveButtonText}>부활 ({REVIVAL_COST}P)</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.dismissButton} onPress={onDismiss}>
            <Text style={styles.dismissButtonText}>포기하기</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  modalContainer: {
    backgroundColor: '#1a1a1a',
    borderRadius: 16,
    padding: 24,
    width: '100%',
    borderWidth: 1,
    borderColor: '#333',
  },
  header: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 16,
  },
  warningBadge: {
    backgroundColor: '#3d1a00',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    alignSelf: 'center',
    marginBottom: 16,
  },
  warningText: {
    color: '#ff8c00',
    fontSize: 15,
    fontWeight: '600',
  },
  description: {
    color: '#999',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 20,
  },
  costRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  costLabel: {
    color: '#aaa',
    fontSize: 15,
  },
  costValue: {
    color: '#ffd700',
    fontSize: 15,
    fontWeight: '700',
  },
  balanceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  balanceLabel: {
    color: '#aaa',
    fontSize: 15,
  },
  balanceValue: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
  balanceInsufficient: {
    color: '#ff4444',
  },
  insufficientText: {
    color: '#ff4444',
    fontSize: 13,
    textAlign: 'center',
    marginBottom: 8,
  },
  reviveButton: {
    backgroundColor: '#c8a200',
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 12,
  },
  reviveButtonDisabled: {
    backgroundColor: '#444',
  },
  reviveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  dismissButton: {
    backgroundColor: '#2a2a2a',
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#444',
  },
  dismissButtonText: {
    color: '#888',
    fontSize: 15,
  },
});
