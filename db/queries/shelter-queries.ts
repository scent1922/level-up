import type { SQLiteDatabase } from 'expo-sqlite';
import type { ShelterState, DecayStage } from '@/types';

export async function createShelterState(
  db: SQLiteDatabase,
  params: ShelterState
): Promise<ShelterState> {
  await db.runAsync(
    `INSERT INTO shelter_states (id, user_id, preset_id, expansion_level, installed_facilities, applied_skins, decay_stage)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [
      params.id,
      params.user_id,
      params.preset_id,
      params.expansion_level,
      params.installed_facilities,
      params.applied_skins,
      params.decay_stage,
    ]
  );
  const state = await getShelterState(db, params.user_id);
  if (!state) throw new Error('Failed to create shelter state');
  return state;
}

export async function getShelterState(
  db: SQLiteDatabase,
  userId: string
): Promise<ShelterState | null> {
  const row = await db.getFirstAsync<ShelterState>(
    'SELECT * FROM shelter_states WHERE user_id = ?',
    [userId]
  );
  return row ?? null;
}

export async function updateExpansionLevel(
  db: SQLiteDatabase,
  shelterId: string,
  level: number
): Promise<void> {
  await db.runAsync(
    'UPDATE shelter_states SET expansion_level = ? WHERE id = ?',
    [level, shelterId]
  );
}

export async function installFacility(
  db: SQLiteDatabase,
  shelterId: string,
  facilityId: string
): Promise<void> {
  const row = await db.getFirstAsync<{ installed_facilities: string }>(
    'SELECT installed_facilities FROM shelter_states WHERE id = ?',
    [shelterId]
  );
  if (!row) throw new Error('Shelter state not found');

  const facilities: string[] = JSON.parse(row.installed_facilities);
  if (!facilities.includes(facilityId)) {
    facilities.push(facilityId);
  }

  await db.runAsync(
    'UPDATE shelter_states SET installed_facilities = ? WHERE id = ?',
    [JSON.stringify(facilities), shelterId]
  );
}

export async function updateDecayStage(
  db: SQLiteDatabase,
  shelterId: string,
  stage: DecayStage
): Promise<void> {
  await db.runAsync(
    'UPDATE shelter_states SET decay_stage = ? WHERE id = ?',
    [stage, shelterId]
  );
}

export async function applySkin(
  db: SQLiteDatabase,
  shelterId: string,
  target: string,
  skinId: string
): Promise<void> {
  const row = await db.getFirstAsync<{ applied_skins: string }>(
    'SELECT applied_skins FROM shelter_states WHERE id = ?',
    [shelterId]
  );
  if (!row) throw new Error('Shelter state not found');

  const skins: Record<string, string> = JSON.parse(row.applied_skins);
  skins[target] = skinId;

  await db.runAsync(
    'UPDATE shelter_states SET applied_skins = ? WHERE id = ?',
    [JSON.stringify(skins), shelterId]
  );
}

export async function deleteShelterState(
  db: SQLiteDatabase,
  userId: string
): Promise<void> {
  await db.runAsync('DELETE FROM shelter_states WHERE user_id = ?', [userId]);
}
