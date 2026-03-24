import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Pressable,
} from 'react-native';
import { SHELTER_UPGRADES } from '@/constants/balance';
import { useShelterStore } from '@/stores/shelter-store';
import { useUserStore } from '@/stores/user-store';

interface UpgradePanelProps {
  onFacilityInstalled?: () => void;
}

export function UpgradePanel({ onFacilityInstalled }: UpgradePanelProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [installing, setInstalling] = useState<string | null>(null);

  const { shelter, installFacility, refreshAvailableUpgrades } = useShelterStore();
  const user = useUserStore((s) => s.user);

  const userLevel = user?.level ?? 1;
  const installedFacilities: string[] = shelter
    ? JSON.parse(shelter.installed_facilities)
    : [];

  const unlocked = SHELTER_UPGRADES.filter(
    (u) => u.level <= userLevel && !installedFacilities.includes(u.facility),
  );
  const installed = SHELTER_UPGRADES.filter((u) =>
    installedFacilities.includes(u.facility),
  );
  const locked = SHELTER_UPGRADES.filter(
    (u) => u.level > userLevel && !installedFacilities.includes(u.facility),
  );

  async function handleInstall(facilityId: string) {
    setInstalling(facilityId);
    try {
      await installFacility(facilityId);
      refreshAvailableUpgrades(userLevel);
      onFacilityInstalled?.();
    } finally {
      setInstalling(null);
    }
  }

  return (
    <View style={styles.wrapper}>
      {/* Toggle button */}
      <TouchableOpacity
        style={styles.toggleButton}
        onPress={() => setIsOpen((v) => !v)}
        activeOpacity={0.8}
      >
        <Text style={styles.toggleButtonText}>
          {isOpen ? '▼ 시설 관리 닫기' : '▲ 시설 관리'}
        </Text>
      </TouchableOpacity>

      {isOpen && (
        <View style={styles.panel}>
          <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
            {/* Unlocked but not installed */}
            {unlocked.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>설치 가능</Text>
                {unlocked.map((u) => (
                  <View key={u.facility} style={styles.row}>
                    <Text style={styles.facilityName}>{u.name}</Text>
                    <TouchableOpacity
                      style={[
                        styles.installBtn,
                        installing === u.facility && styles.installBtnDisabled,
                      ]}
                      onPress={() => handleInstall(u.facility)}
                      disabled={installing === u.facility}
                    >
                      <Text style={styles.installBtnText}>
                        {installing === u.facility ? '설치 중…' : '설치'}
                      </Text>
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            )}

            {/* Already installed */}
            {installed.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>설치됨</Text>
                {installed.map((u) => (
                  <View key={u.facility} style={styles.row}>
                    <Text style={styles.facilityName}>{u.name}</Text>
                    <Text style={styles.checkmark}>✓</Text>
                  </View>
                ))}
              </View>
            )}

            {/* Locked */}
            {locked.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>잠김</Text>
                {locked.map((u) => (
                  <View key={u.facility} style={[styles.row, styles.rowLocked]}>
                    <Text style={[styles.facilityName, styles.textLocked]}>
                      {u.name}
                    </Text>
                    <Text style={styles.lockLabel}>Lv.{u.level} 필요</Text>
                  </View>
                ))}
              </View>
            )}

            {unlocked.length === 0 && installed.length === 0 && locked.length === 0 && (
              <Text style={styles.emptyText}>설치 가능한 시설이 없습니다.</Text>
            )}
          </ScrollView>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  toggleButton: {
    backgroundColor: '#1A1A2E',
    borderTopWidth: 1,
    borderColor: '#333',
    paddingVertical: 12,
    alignItems: 'center',
  },
  toggleButtonText: {
    color: '#F4A825',
    fontWeight: '600',
    fontSize: 14,
  },
  panel: {
    backgroundColor: '#0F0F1A',
    borderTopWidth: 1,
    borderColor: '#222',
    maxHeight: 280,
  },
  scroll: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 16,
  },
  section: {
    marginBottom: 12,
  },
  sectionTitle: {
    color: '#888',
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 6,
    marginTop: 4,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: '#222',
  },
  rowLocked: {
    opacity: 0.5,
  },
  facilityName: {
    color: '#DDD',
    fontSize: 14,
    flex: 1,
  },
  textLocked: {
    color: '#777',
  },
  installBtn: {
    backgroundColor: '#F4A825',
    paddingHorizontal: 14,
    paddingVertical: 5,
    borderRadius: 6,
  },
  installBtnDisabled: {
    backgroundColor: '#7A5412',
  },
  installBtnText: {
    color: '#0A0A0A',
    fontWeight: '700',
    fontSize: 12,
  },
  checkmark: {
    color: '#4CAF50',
    fontSize: 18,
    fontWeight: '700',
  },
  lockLabel: {
    color: '#666',
    fontSize: 12,
  },
  emptyText: {
    color: '#666',
    textAlign: 'center',
    paddingVertical: 16,
    fontSize: 13,
  },
});
