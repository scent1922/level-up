import { create } from 'zustand';
import { getDatabase } from '@/db/database';
import {
  createShelterState,
  getShelterState,
  updateDecayStage,
  installFacility as dbInstallFacility,
  applySkin as dbApplySkin,
  deleteShelterState,
} from '@/db/queries/shelter-queries';
import {
  createAvatarState,
  getAvatarState,
  equipItem,
  deleteAvatarState,
} from '@/db/queries/avatar-queries';
import { deactivateAllQuests } from '@/db/queries/quest-queries';
import { deleteQuestLogsByUser } from '@/db/queries/quest-log-queries';
import { useUserStore } from '@/stores/user-store';
import type { ShelterState, AvatarState, DecayStage } from '@/types';
import {
  SHELTER_UPGRADES,
  DECAY_WARNING_DAYS,
  DECAY_DANGER_DAYS,
  DECAY_DESTROY_DAYS,
  REVIVAL_COST,
} from '@/constants/balance';

interface ShelterStore {
  shelter: ShelterState | null;
  avatar: AvatarState | null;
  availableUpgrades: typeof SHELTER_UPGRADES[number][];
  loadShelter: () => Promise<void>;
  createShelter: (presetId: string) => Promise<void>;
  createAvatar: (presetId: string) => Promise<void>;
  checkDecay: () => Promise<void>;
  installFacility: (facilityId: string) => Promise<void>;
  applySkin: (targetId: string, skinId: string) => Promise<void>;
  equipAvatarItem: (itemId: string) => Promise<void>;
  destroyShelter: () => Promise<void>;
  reviveShelter: () => Promise<boolean>;
  refreshAvailableUpgrades: (userLevel: number) => void;
}

function daysBetween(dateA: Date, dateB: Date): number {
  const msPerDay = 1000 * 60 * 60 * 24;
  return Math.floor((dateB.getTime() - dateA.getTime()) / msPerDay);
}

function calcDecayStage(lastQuestCompletedAt: string | null): DecayStage {
  if (!lastQuestCompletedAt) return 0;

  const last = new Date(lastQuestCompletedAt);
  const now = new Date();
  const days = daysBetween(last, now);

  if (days >= DECAY_DESTROY_DAYS) return 3;
  if (days >= DECAY_DANGER_DAYS) return 2;
  if (days >= DECAY_WARNING_DAYS) return 1;
  return 0;
}

export const useShelterStore = create<ShelterStore>((set, get) => ({
  shelter: null,
  avatar: null,
  availableUpgrades: [],

  loadShelter: async () => {
    const user = useUserStore.getState().user;
    if (!user) return;

    const db = await getDatabase();
    const shelter = await getShelterState(db, user.id);
    const avatar = await getAvatarState(db, user.id);
    set({ shelter, avatar });

    if (shelter) {
      get().refreshAvailableUpgrades(user.level);
    }
  },

  createShelter: async (presetId: string) => {
    const user = useUserStore.getState().user;
    if (!user) return;

    const db = await getDatabase();
    const id = `shelter_${Date.now()}`;
    const shelter = await createShelterState(db, {
      id,
      user_id: user.id,
      preset_id: presetId,
      expansion_level: 1,
      installed_facilities: JSON.stringify([]),
      applied_skins: JSON.stringify({}),
      decay_stage: 0,
    });
    set({ shelter });
    get().refreshAvailableUpgrades(user.level);
  },

  createAvatar: async (presetId: string) => {
    const user = useUserStore.getState().user;
    if (!user) return;

    const db = await getDatabase();
    const id = `avatar_${Date.now()}`;
    const avatar = await createAvatarState(db, {
      id,
      user_id: user.id,
      preset_id: presetId,
      equipped_items: JSON.stringify([]),
    });
    set({ avatar });
  },

  checkDecay: async () => {
    const { shelter } = get();
    if (!shelter) return;

    const user = useUserStore.getState().user;
    if (!user) return;

    const newStage = calcDecayStage(user.last_quest_completed_at);
    if (newStage === shelter.decay_stage) return;

    const db = await getDatabase();
    await updateDecayStage(db, shelter.id, newStage);
    set({ shelter: { ...shelter, decay_stage: newStage } });
  },

  installFacility: async (facilityId: string) => {
    const { shelter } = get();
    if (!shelter) return;

    const db = await getDatabase();
    await dbInstallFacility(db, shelter.id, facilityId);

    const facilities: string[] = JSON.parse(shelter.installed_facilities);
    if (!facilities.includes(facilityId)) {
      facilities.push(facilityId);
    }
    const updated = { ...shelter, installed_facilities: JSON.stringify(facilities) };
    set({ shelter: updated });
  },

  applySkin: async (targetId: string, skinId: string) => {
    const { shelter } = get();
    if (!shelter) return;

    const db = await getDatabase();
    await dbApplySkin(db, shelter.id, targetId, skinId);

    const skins: Record<string, string> = JSON.parse(shelter.applied_skins);
    skins[targetId] = skinId;
    set({ shelter: { ...shelter, applied_skins: JSON.stringify(skins) } });
  },

  equipAvatarItem: async (itemId: string) => {
    const { avatar } = get();
    if (!avatar) return;

    const db = await getDatabase();
    await equipItem(db, avatar.id, itemId);

    const items: string[] = JSON.parse(avatar.equipped_items);
    if (!items.includes(itemId)) {
      items.push(itemId);
    }
    set({ avatar: { ...avatar, equipped_items: JSON.stringify(items) } });
  },

  destroyShelter: async () => {
    const user = useUserStore.getState().user;
    if (!user) return;

    const db = await getDatabase();
    await deleteShelterState(db, user.id);
    await deleteAvatarState(db, user.id);
    await deactivateAllQuests(db, user.id);
    await deleteQuestLogsByUser(db, user.id);

    set({ shelter: null, avatar: null, availableUpgrades: [] });

    // Reset user → triggers re-onboarding
    await useUserStore.getState().resetUser();
  },

  reviveShelter: async () => {
    const { shelter } = get();
    if (!shelter) return false;

    const userStore = useUserStore.getState();
    const spent = await userStore.spendPoints(REVIVAL_COST, 'revival');
    if (!spent) return false;

    const db = await getDatabase();
    await updateDecayStage(db, shelter.id, 0);
    set({ shelter: { ...shelter, decay_stage: 0 } });
    return true;
  },

  refreshAvailableUpgrades: (userLevel: number) => {
    const { shelter } = get();
    const installedFacilities: string[] = shelter
      ? JSON.parse(shelter.installed_facilities)
      : [];

    const available = SHELTER_UPGRADES.filter(
      (u) => u.level <= userLevel && !installedFacilities.includes(u.facility)
    );
    set({ availableUpgrades: available });
  },
}));
