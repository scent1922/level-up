# Level-Up MVP Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a cross-platform habit management app with gamification (XP/levels/points) and a 2D pixel-art isometric shelter view.

**Architecture:** React Native + Expo app with local-first SQLite storage, Zustand state management, and react-native-skia for 2D shelter rendering. File-based routing via expo-router with 5-tab navigation. All game balance constants isolated for easy tuning.

**Tech Stack:** Expo SDK 53+ / TypeScript / Zustand / expo-sqlite / @shopify/react-native-skia / expo-notifications / expo-router / react-native-reanimated

**Important:** `@shopify/react-native-skia`는 네이티브 모듈이므로 Expo Go에서 동작하지 않습니다. 반드시 Development Build(`npx expo run:ios` 또는 EAS Build)를 사용하세요.

**PRD:** [/Users/choiyeonsoon/level-up/PRD.md](/Users/choiyeonsoon/level-up/PRD.md)

---

## Task 1: Expo 프로젝트 초기화

**Files:**
- Create: `app/_layout.tsx`
- Create: `app/(tabs)/_layout.tsx`
- Create: `app/(tabs)/index.tsx` (쉘터 홈 placeholder)
- Create: `app/(tabs)/quests.tsx` (placeholder)
- Create: `app/(tabs)/history.tsx` (placeholder)
- Create: `app/(tabs)/shop.tsx` (placeholder)
- Create: `app/(tabs)/settings.tsx` (placeholder)
- Create: `app.json` (Expo config)
- Create: `tsconfig.json`

- [ ] **Step 1: Expo 프로젝트 생성**

```bash
cd /Users/choiyeonsoon
npx create-expo-app@latest level-up-app --template tabs
```

> Note: 기존 level-up 디렉토리에는 PRD와 docs가 있으므로, 임시로 level-up-app으로 생성 후 내용을 level-up에 머지합니다.

- [ ] **Step 2: 생성된 프로젝트 파일을 level-up 디렉토리로 이동**

PRD.md와 docs/를 보존하면서 Expo 프로젝트 파일을 level-up/에 통합합니다.

```bash
# level-up-app의 내용을 level-up으로 복사 (PRD.md, docs/ 보존)
cp -rn /Users/choiyeonsoon/level-up-app/* /Users/choiyeonsoon/level-up/
cp -rn /Users/choiyeonsoon/level-up-app/.* /Users/choiyeonsoon/level-up/ 2>/dev/null || true
rm -rf /Users/choiyeonsoon/level-up-app
```

- [ ] **Step 3: 핵심 의존성 설치**

```bash
cd /Users/choiyeonsoon/level-up
npx expo install expo-sqlite expo-notifications @shopify/react-native-skia react-native-reanimated zustand uuid
npm install --save-dev @types/uuid
```

- [ ] **Step 4: 5개 탭 네비게이션 구성**

`app/(tabs)/_layout.tsx`에 5개 탭 (쉘터/퀘스트/기록/상점/설정) 설정.
각 탭 파일에 placeholder 화면 구현.

- [ ] **Step 5: Development Build 설정 및 앱 실행 확인**

`@shopify/react-native-skia`는 네이티브 모듈이므로 Expo Go가 아닌 Development Build 필요.

```bash
cd /Users/choiyeonsoon/level-up
npx expo prebuild
npx expo run:ios
```

iOS 시뮬레이터에서 5개 탭 네비게이션이 정상 동작하는지 확인.
(Android: `npx expo run:android`)

- [ ] **Step 6: 커밋**

```bash
git add -A
git commit -m "feat: initialize Expo project with 5-tab navigation"
```

---

## Task 2: 타입 정의 & 밸런스 상수

**Files:**
- Create: `types/index.ts` — 전역 타입 (User, Quest, QuestLog, ShelterState, AvatarState, ShopItem, PointTransaction)
- Create: `constants/balance.ts` — XP/레벨/포인트 밸런스 상수
- Create: `constants/presets.ts` — 쉘터/아바타 프리셋 정의

- [ ] **Step 1: 전역 타입 정의 작성**

`types/index.ts` — PRD 섹션 4.2의 데이터 모델을 TypeScript 타입으로 변환.

```typescript
// 핵심 타입들:
export type FrequencyType = 'daily' | 'specific_days' | 'every_n_days' | 'n_per_week';
export type ShopItemType = 'shelter_skin' | 'avatar_outfit' | 'avatar_accessory' | 'facility_skin';
export type PointReason = 'daily_complete' | 'level_up' | 'streak' | 'purchase' | 'revival';
export type DecayStage = 0 | 1 | 2 | 3; // 정상/열화시작/심각/파괴

export interface User { ... }
export interface Quest { ... }
export interface QuestLog { ... }
export interface ShelterState { ... }
export interface AvatarState { ... }
export interface ShopItem { ... }
export interface PointTransaction { ... }
```

- [ ] **Step 2: 밸런스 상수 작성**

`constants/balance.ts` — PRD 섹션 3.3~3.4의 밸런스 수치를 상수로 분리.

```typescript
// XP
export const BASE_XP_PER_QUEST = 20;
export const DAILY_COMPLETE_BONUS_XP = 30;
export const STREAK_7_MULTIPLIER = 1.5;
export const STREAK_30_MULTIPLIER = 2.0;

// 레벨별 필요 XP
export const XP_TIERS = [
  { minLevel: 1, maxLevel: 10, xpPerLevel: 100 },
  { minLevel: 11, maxLevel: 25, xpPerLevel: 200 },
  { minLevel: 26, maxLevel: 50, xpPerLevel: 350 },
  { minLevel: 51, maxLevel: Infinity, xpPerLevel: 500 },
];

// 포인트
export const POINTS_DAILY_COMPLETE = 50;
export const POINTS_LEVEL_UP = 100;
export const POINTS_STREAK_7 = 200;
export const REVIVAL_COST = 500; // 구제 시스템 비용

// 방치/열화
export const DECAY_WARNING_DAYS = 7;
export const DECAY_DANGER_DAYS = 10;
export const DECAY_DESTROY_DAYS = 14;

// 쉘터 확장 레벨
export const SHELTER_UPGRADES = [
  { level: 5, facility: 'generator', name: '발전기' },
  { level: 10, facility: 'water_purifier', name: '정수 장치' },
  // ... PRD 섹션 3.5의 전체 로드맵
];
```

- [ ] **Step 3: 프리셋 정의 작성**

`constants/presets.ts` — 쉘터 4종 + 아바타 4종 프리셋 메타데이터.

```typescript
export const SHELTER_PRESETS = [
  { id: 'city', name: '도시 벙커', description: '폐허가 된 도시 지하...', assetKey: 'shelter_city' },
  { id: 'coast', name: '해안 벙커', description: '절벽 아래 해안 동굴...', assetKey: 'shelter_coast' },
  { id: 'forest', name: '산림 벙커', description: '산 속 지하...', assetKey: 'shelter_forest' },
  { id: 'desert', name: '사막 벙커', description: '오아시스 인근...', assetKey: 'shelter_desert' },
];

export const AVATAR_PRESETS = [
  { id: 'survivor_a', name: '생존자 A', assetKey: 'avatar_a' },
  // ... 4종
];
```

- [ ] **Step 4: 커밋**

```bash
git add types/ constants/
git commit -m "feat: add type definitions and balance constants"
```

---

## Task 3: SQLite 데이터베이스 레이어

**Files:**
- Create: `db/schema.ts` — 테이블 생성 SQL
- Create: `db/database.ts` — DB 초기화 및 연결 관리
- Create: `db/queries/user-queries.ts` — User CRUD
- Create: `db/queries/quest-queries.ts` — Quest CRUD
- Create: `db/queries/quest-log-queries.ts` — QuestLog CRUD
- Create: `db/queries/shelter-queries.ts` — ShelterState CRUD
- Create: `db/queries/avatar-queries.ts` — AvatarState CRUD
- Create: `db/queries/shop-queries.ts` — ShopItem 조회, PointTransaction CRUD

- [ ] **Step 1: DB 스키마 정의**

`db/schema.ts` — PRD 4.2의 6개 테이블 CREATE TABLE 문 작성.
expo-sqlite의 `SQLiteDatabase` 타입 사용.

- [ ] **Step 2: DB 초기화 모듈 작성**

`db/database.ts` — 싱글톤 DB 인스턴스 생성, 마이그레이션 실행, ShopItem 시드 데이터 삽입.

```typescript
import * as SQLite from 'expo-sqlite';

let db: SQLite.SQLiteDatabase | null = null;

export async function getDatabase(): Promise<SQLite.SQLiteDatabase> {
  if (!db) {
    db = await SQLite.openDatabaseAsync('levelup.db');
    await runMigrations(db);
    await seedShopItems(db);
  }
  return db;
}
```

- [ ] **Step 3: 각 테이블별 쿼리 모듈 작성**

테이블별로 분리된 쿼리 파일 작성. 각 파일은 해당 테이블의 CRUD 함수만 포함.
- `user-queries.ts`: createUser, getUser, updateUserXP, updateUserPoints, updateUserStreak 등
- `quest-queries.ts`: createQuest, getQuests, getActiveQuests, getTodayQuests, updateQuest, deleteQuest
- `quest-log-queries.ts`: logQuestCompletion, getQuestLogsForDate, getQuestLogsByRange
- `shelter-queries.ts`: createShelterState, getShelterState, updateExpansion, updateDecay, applySkin
- `avatar-queries.ts`: createAvatarState, getAvatarState, equipItem
- `shop-queries.ts`: getShopItems, getShopItemsByType, createPointTransaction, getPointHistory

- [ ] **Step 4: 앱 시작 시 DB 초기화 연결**

`app/_layout.tsx`에서 앱 로드 시 `getDatabase()` 호출하여 DB 초기화.
SplashScreen을 활용하여 DB 준비 완료까지 대기.

- [ ] **Step 5: 커밋**

```bash
git add db/
git commit -m "feat: add SQLite database layer with schema and queries"
```

---

## Task 4: Zustand 상태 관리

**Files:**
- Create: `stores/user-store.ts` — 유저 상태 (레벨, XP, 포인트, 스트릭)
- Create: `stores/quest-store.ts` — 퀘스트 목록 및 CRUD 액션
- Create: `stores/shelter-store.ts` — 쉘터/아바타 상태 및 커스터마이징

- [ ] **Step 1: user-store 작성**

```typescript
import { create } from 'zustand';

interface UserStore {
  user: User | null;
  isOnboarded: boolean;
  loadUser: () => Promise<void>;
  addXP: (amount: number) => Promise<void>;
  addPoints: (amount: number, reason: PointReason) => Promise<void>;
  spendPoints: (amount: number, reason: PointReason) => Promise<boolean>;
  updateStreak: () => Promise<void>;
  resetUser: () => Promise<void>; // 쉘터 파괴 시
}
```

각 액션은 Zustand 상태 업데이트 + SQLite 동기화를 함께 수행.

- [ ] **Step 2: quest-store 작성**

```typescript
interface QuestStore {
  quests: Quest[];
  todayQuests: Quest[];
  loadQuests: () => Promise<void>;
  createQuest: (quest: Omit<Quest, 'id' | 'user_id' | 'created_at'>) => Promise<void>;
  completeQuest: (questId: string) => Promise<void>; // XP/포인트 연동
  updateQuest: (questId: string, updates: Partial<Quest>) => Promise<void>;
  deleteQuest: (questId: string) => Promise<void>;
  checkDailyComplete: () => Promise<boolean>;
}
```

`completeQuest`는 QuestLog 기록 + XP 추가 + 데일리 보너스 체크 + 스트릭 업데이트를 한 번에 처리.

- [ ] **Step 3: shelter-store 작성**

```typescript
interface ShelterStore {
  shelter: ShelterState | null;
  avatar: AvatarState | null;
  loadShelter: () => Promise<void>;
  checkDecay: () => Promise<void>; // 방치 상태 계산
  installFacility: (facilityId: string) => Promise<void>;
  applySkin: (targetId: string, skinId: string) => Promise<void>;
  equipAvatarItem: (itemId: string) => Promise<void>;
  destroyShelter: () => Promise<void>;
  reviveShelter: () => Promise<boolean>; // 포인트 소비 후 부활
}
```

- [ ] **Step 4: 커밋**

```bash
git add stores/
git commit -m "feat: add Zustand stores for user, quest, and shelter state"
```

---

## Task 5: 게임 로직 서비스

**Files:**
- Create: `services/xp-service.ts` — XP 계산, 레벨업 판정, 스트릭 배율
- Create: `services/point-service.ts` — 포인트 적립 조건 판정, 사용 처리
- Create: `services/decay-service.ts` — 방치 감지, 열화 단계 계산, 파괴 판정
- Create: `services/quest-scheduler.ts` — "오늘 해야 할 퀘스트" 판정 로직

- [ ] **Step 1: xp-service 작성**

순수 함수로 구현 (DB 의존성 없음, 테스트 용이):

```typescript
export function calculateXPForQuest(baseXP: number, streakCount: number): number { ... }
export function getXPRequiredForLevel(level: number): number { ... }
export function checkLevelUp(currentLevel: number, currentXP: number): { leveledUp: boolean; newLevel: number; remainingXP: number } { ... }
export function getStreakMultiplier(streakCount: number): number { ... }
```

- [ ] **Step 2: point-service 작성**

```typescript
export function calculateDailyCompleteReward(): number { ... }
export function calculateLevelUpReward(): number { ... }
export function calculateStreakReward(streakCount: number): number { ... }
export function getRevivalCost(consecutiveRevivals: number): number { ... }
```

- [ ] **Step 3: decay-service 작성**

```typescript
export function calculateDecayStage(lastCompletedAt: Date, now: Date): DecayStage { ... }
export function getDaysUntilDestruction(lastCompletedAt: Date, now: Date): number { ... }
export function shouldShowWarningNotification(decayStage: DecayStage): boolean { ... }
```

- [ ] **Step 4: quest-scheduler 작성**

반복 주기에 따라 "오늘 이 퀘스트를 해야 하는지" 판정:

```typescript
export function isQuestDueToday(quest: Quest, today: Date, weeklyCompletions?: number): boolean { ... }
// frequency_type별 분기:
// - daily: 항상 true
// - specific_days: 오늘 요일이 포함되어 있는지
// - every_n_days: 생성일로부터 N일 간격 확인
// - n_per_week: weeklyCompletions < N인지 (호출자가 이번 주 완료 횟수를 QuestLog에서 조회하여 전달)
```

- [ ] **Step 5: 서비스 단위 테스트 작성**

```bash
npm install --save-dev jest @types/jest ts-jest
```

`__tests__/services/` 디렉토리에 각 서비스의 핵심 로직 테스트:
- XP 계산 정확성
- 레벨업 경계값 테스트
- 스트릭 배율 확인
- 방치 일수별 열화 단계
- 퀘스트 스케줄링 각 타입별

- [ ] **Step 6: 테스트 실행 확인**

```bash
npx jest --verbose
```

모든 테스트 통과 확인.

- [ ] **Step 7: 커밋**

```bash
git add services/ __tests__/
git commit -m "feat: add game logic services with unit tests (XP, points, decay, scheduler)"
```

---

## Task 6: 온보딩 플로우 UI

**Files:**
- Create: `app/onboarding/index.tsx` — 온보딩 진입점
- Create: `app/onboarding/shelter-select.tsx` — 쉘터 선택 화면
- Create: `app/onboarding/avatar-select.tsx` — 아바타 선택 화면
- Create: `app/onboarding/first-quest.tsx` — 첫 퀘스트 생성 가이드
- Create: `components/onboarding/PresetCard.tsx` — 쉘터/아바타 프리셋 카드
- Modify: `app/_layout.tsx` — 온보딩 완료 여부에 따른 라우팅 분기

- [ ] **Step 1: 온보딩 라우팅 설정**

`app/_layout.tsx`에서 `isOnboarded` 상태를 확인하여:
- false → `app/onboarding/` 라우트로 리다이렉트
- true → `app/(tabs)/` 라우트 표시

- [ ] **Step 2: PresetCard 공통 컴포넌트 작성**

쉘터와 아바타 선택 화면에서 공유하는 카드 컴포넌트.
프리셋 이름, 설명, 썸네일(MVP에서는 placeholder 색상 박스), 선택 상태 표시.

- [ ] **Step 3: 쉘터 선택 화면 구현**

4개 쉘터 프리셋을 2×2 그리드로 표시. 선택 시 하이라이트. "다음" 버튼.

- [ ] **Step 4: 아바타 선택 화면 구현**

4개 아바타 프리셋을 표시. 선택 시 하이라이트. "다음" 버튼.

- [ ] **Step 5: 첫 퀘스트 생성 화면 구현**

간소화된 퀘스트 생성 폼:
- 퀘스트 이름 입력
- 반복 주기 선택 (매일이 기본)
- 알림 시간 선택
- "시작하기" 버튼 → User/ShelterState/AvatarState/Quest 생성 후 메인 화면 이동

- [ ] **Step 6: 푸시 알림 권한 요청**

첫 퀘스트 생성 시 `expo-notifications`의 `requestPermissionsAsync()` 호출.

- [ ] **Step 7: 커밋**

```bash
git add app/onboarding/ components/onboarding/
git commit -m "feat: add onboarding flow (shelter/avatar select, first quest)"
```

---

## Task 7: 퀘스트 탭 UI

**Files:**
- Modify: `app/(tabs)/quests.tsx` — 퀘스트 메인 화면
- Create: `components/quest/QuestList.tsx` — 퀘스트 리스트 (오늘/전체 탭)
- Create: `components/quest/QuestItem.tsx` — 개별 퀘스트 행 (체크 버튼 포함)
- Create: `components/quest/QuestFormModal.tsx` — 퀘스트 생성/수정 모달
- Create: `components/quest/FrequencyPicker.tsx` — 반복 주기 선택기

- [ ] **Step 1: QuestItem 컴포넌트 작성**

퀘스트 이름, 반복 주기 뱃지, 완료 체크 버튼을 한 행에 표시.
체크 시 XP 적립 애니메이션 ("+20 XP" 텍스트 페이드 업).

- [ ] **Step 2: QuestList 컴포넌트 작성**

FlatList 기반. 상단에 "오늘" / "전체" 세그먼트 탭.
- 오늘 탭: `quest-scheduler`의 `isQuestDueToday()`로 필터링
- 전체 탭: 활성 퀘스트 전체

빈 상태 UI: "아직 퀘스트가 없습니다. 새 퀘스트를 만들어보세요!"

- [ ] **Step 3: FrequencyPicker 컴포넌트 작성**

4가지 반복 주기 옵션:
- 매일 (기본값)
- 특정 요일 → 요일 체크박스 그룹 표시
- N일마다 → 숫자 입력
- 주 N회 → 숫자 입력 (1~7)

- [ ] **Step 4: QuestFormModal 작성**

바텀 시트 모달 형태. 생성/수정 겸용.
- 퀘스트 이름 (필수)
- 설명 (선택)
- 반복 주기 (FrequencyPicker)
- 알림 시간 (TimePicker)
- 알림 on/off 토글
- 저장/삭제 버튼

- [ ] **Step 5: 퀘스트 메인 화면 조합**

`app/(tabs)/quests.tsx`에서:
- QuestList 표시
- FAB (FloatingActionButton) → QuestFormModal 열기
- 퀘스트 아이템 탭 → 수정 모달 열기

- [ ] **Step 6: 퀘스트 완료 시 스트릭/포인트 연동 확인**

퀘스트 완료 → quest-store.completeQuest() → XP 추가 + 데일리 체크 + 스트릭 업데이트가 연쇄적으로 동작하는지 확인.

- [ ] **Step 7: 커밋**

```bash
git add app/(tabs)/quests.tsx components/quest/
git commit -m "feat: add quest tab with CRUD, frequency picker, and completion flow"
```

---

## Task 8: 기록 탭 UI

**Files:**
- Modify: `app/(tabs)/history.tsx` — 기록 메인 화면
- Create: `components/history/CalendarView.tsx` — 캘린더 뷰 (완료/미완료 마커)
- Create: `components/history/StreakBanner.tsx` — 현재 스트릭 표시
- Create: `components/history/WeeklyStats.tsx` — 주간/월간 통계

- [ ] **Step 1: CalendarView 작성**

월간 캘린더 그리드. 각 날짜에:
- 전체 퀘스트 완료: 초록 원
- 일부 완료: 노란 원
- 미완료: 빈 칸 또는 빨간 점
- 미래 날짜: 비활성

`react-native-calendars` 또는 직접 구현 (의존성 최소화를 위해 직접 구현 권장).

- [ ] **Step 2: StreakBanner 작성**

현재 연속 스트릭 일수와 불꽃 아이콘. 7일/30일 마일스톤 표시.

- [ ] **Step 3: WeeklyStats 작성**

이번 주 퀘스트 완료율 바 차트 (요일별).
이번 달 총 완료 퀘스트 수, 획득 XP/포인트 요약.

- [ ] **Step 4: 기록 화면 조합**

상단: StreakBanner
중앙: CalendarView (스와이프로 월 이동)
하단: WeeklyStats

- [ ] **Step 5: 커밋**

```bash
git add app/(tabs)/history.tsx components/history/
git commit -m "feat: add history tab with calendar view, streak banner, and stats"
```

---

## Task 9: 푸시 알림 서비스

**Files:**
- Create: `services/notification-service.ts` — 알림 스케줄링, 취소, 관리

- [ ] **Step 1: notification-service 작성**

```typescript
import * as Notifications from 'expo-notifications';

// 퀘스트 리마인더 (NTF-01)
export async function scheduleQuestReminder(quest: Quest): Promise<string> { ... }
export async function cancelQuestReminder(notificationId: string): Promise<void> { ... }
// 데일리 요약 (NTF-02)
export async function scheduleDailySummary(hour: number, minute: number): Promise<void> { ... }
// 쉘터 위험 경고 (NTF-03)
export async function scheduleShelterWarning(daysLeft: number): Promise<void> { ... }
// 레벨업/보상 알림 (NTF-04)
export async function sendLevelUpNotification(newLevel: number): Promise<void> { ... }
export async function sendStreakMilestoneNotification(streakDays: number): Promise<void> { ... }
export async function cancelAllNotifications(): Promise<void> { ... }
```

반복 주기별 스케줄링:
- daily → `Notifications.scheduleNotificationAsync({ trigger: { type: 'daily', hour, minute } })`
- specific_days → 요일별 개별 스케줄
- every_n_days → `timeInterval` 기반
- n_per_week → 매일 알림 후 앱 내에서 완료 횟수 체크

- [ ] **Step 2: 퀘스트 CRUD와 알림 연동**

quest-store의 createQuest/updateQuest/deleteQuest에서 알림 자동 등록/갱신/취소.

- [ ] **Step 3: 레벨업/스트릭 알림 연동 (NTF-04)**

user-store의 `addXP()` 내부에서 레벨업 발생 시 `sendLevelUpNotification(newLevel)` 호출.
quest-store의 `completeQuest()` 내부에서 스트릭 마일스톤(7일/30일) 달성 시 `sendStreakMilestoneNotification(streakDays)` 호출.

- [ ] **Step 4: 방치 경고 알림 연동**

앱 포그라운드 진입 시 decay-service로 열화 상태 체크 → 필요 시 경고 알림 스케줄.

- [ ] **Step 5: 커밋**

```bash
git add services/notification-service.ts
git commit -m "feat: add push notification service with quest reminders, level-up alerts, and shelter warnings"
```

---

## Task 10: 쉘터 메인 뷰 (2D 렌더링)

**Files:**
- Create: `engine/shelter-renderer.ts` — Skia Canvas 기반 아이소메트릭 쉘터 렌더러
- Create: `engine/sprite-manager.ts` — 스프라이트 시트 로드/프레임 추출
- Create: `engine/avatar-engine.ts` — 아바타 랜덤 이동 AI + 상호작용 모션
- Create: `engine/isometric-utils.ts` — 아이소메트릭 좌표 변환 유틸
- Create: `components/shelter/ShelterCanvas.tsx` — 쉘터 뷰 React 컴포넌트
- Create: `components/shelter/StatusBar.tsx` — 레벨/XP바, 포인트 잔액 오버레이
- Create: `components/shelter/UpgradePanel.tsx` — 쉘터 확장/시설 설치 UI (SHL-04, SHL-05)
- Modify: `app/(tabs)/index.tsx` — 쉘터 홈 화면 조합

> **Note:** MVP 에셋이 아직 준비되지 않은 상태에서는 placeholder 도형(색상 사각형)으로 구현합니다.
> 에셋 제작(Task 12) 후 실제 스프라이트로 교체합니다.

- [ ] **Step 1: isometric-utils 작성**

```typescript
// 2D 그리드 좌표 → 아이소메트릭 스크린 좌표 변환
export function gridToIso(gridX: number, gridY: number, tileWidth: number, tileHeight: number): { x: number; y: number } { ... }
export function isoToGrid(screenX: number, screenY: number, tileWidth: number, tileHeight: number): { gridX: number; gridY: number } { ... }
```

- [ ] **Step 2: sprite-manager 작성**

스프라이트 시트에서 특정 프레임을 추출하는 유틸.
`require()`로 번들된 에셋 이미지를 로드하고, 프레임 좌표를 계산.

```typescript
export interface SpriteSheet {
  image: SkImage;
  frameWidth: number;
  frameHeight: number;
  columns: number;
}

export function getFrameRect(sheet: SpriteSheet, frameIndex: number): SkRect { ... }
```

- [ ] **Step 3: shelter-renderer 작성**

Skia Canvas에 쉘터를 그리는 렌더러:
- 바닥 타일 (아이소메트릭 그리드)
- 벽 (쉘터 프리셋별 스타일)
- 시설 오브젝트 (설치된 시설만)
- 열화 오버레이 (DecayStage에 따라)

```typescript
export function renderShelter(
  canvas: SkCanvas,
  shelterState: ShelterState,
  sprites: Map<string, SpriteSheet>,
  frameCount: number // 애니메이션 프레임
): void { ... }
```

- [ ] **Step 4: avatar-engine 작성**

아바타의 자동 이동 로직:
- 쉘터 그리드 내 랜덤 목표 지점 선택
- A* 또는 단순 직선 이동
- 목표 도달 → 3~8초 대기 → 새 목표 선택
- 시설 오브젝트 근처 도달 시 상호작용 모션 트리거 (30% 확률)

```typescript
export class AvatarEngine {
  private position: { x: number; y: number };
  private target: { x: number; y: number } | null;
  private state: 'idle' | 'walking' | 'interacting';
  private direction: 'up' | 'down' | 'left' | 'right';

  update(deltaTime: number, shelterGrid: boolean[][], facilities: Facility[]): void { ... }
  getDrawState(): { position, state, direction, currentFrame } { ... }
}
```

- [ ] **Step 5: ShelterCanvas 컴포넌트 작성**

`@shopify/react-native-skia`의 `<Canvas>` 컴포넌트를 사용.
`useFrameCallback`으로 매 프레임 렌더링.
shelter-renderer + avatar-engine을 조합하여 전체 씬 렌더링.

- [ ] **Step 6: StatusBar 오버레이 작성**

쉘터 뷰 상단에 반투명 오버레이:
- 레벨 숫자 + XP 프로그레스 바
- 포인트 잔액 (코인 아이콘 + 숫자)

- [ ] **Step 7: UpgradePanel 작성 (SHL-04, SHL-05)**

쉘터 홈에서 접근 가능한 업그레이드 패널 (바텀 시트):
- 현재 레벨에서 설치 가능한 시설 목록 (SHELTER_UPGRADES 기반)
- 각 시설: 이름, 아이콘, 필요 레벨, "설치" 버튼
- 이미 설치된 시설은 체크마크 표시
- 쉘터 확장 가능 시 "확장하기" 버튼
- 레벨 미달 시설은 잠금 아이콘 + 필요 레벨 표시

설치 시 shelter-store.installFacility() 호출 → ShelterCanvas에 즉시 반영.

- [ ] **Step 8: 레벨업 → 쉘터 해금 트리거 연결**

user-store의 `addXP()` 내부에서 레벨업 발생 시:
1. `SHELTER_UPGRADES`에서 새 레벨에 해당하는 해금 요소 확인
2. 해금 가능한 시설/확장이 있으면 shelter-store에 알림
3. 레벨업 축하 + "새 시설 설치 가능!" 토스트 메시지 표시

```typescript
// user-store.addXP() 내부
const levelUpResult = checkLevelUp(user.level, user.xp + amount);
if (levelUpResult.leveledUp) {
  const newUnlocks = SHELTER_UPGRADES.filter(u => u.level === levelUpResult.newLevel);
  if (newUnlocks.length > 0) {
    // 토스트: "레벨 ${newLevel} 달성! ${newUnlocks[0].name} 설치 가능!"
  }
}
```

- [ ] **Step 9: 쉘터 홈 화면 조합**

`app/(tabs)/index.tsx`에서:
- ShelterCanvas (전체 화면)
- StatusBar (상단 오버레이)
- 쉘터 업그레이드 버튼 → UpgradePanel 열기
- 쉘터 꾸미기 버튼 (하단)

- [ ] **Step 10: 커밋**

```bash
git add engine/ components/shelter/ app/(tabs)/index.tsx
git commit -m "feat: add shelter view with isometric renderer and avatar engine"
```

---

## Task 11: 상점 & 커스터마이징 UI

**Files:**
- Modify: `app/(tabs)/shop.tsx` — 상점 메인 화면
- Create: `components/shop/ShopItemCard.tsx` — 상점 아이템 카드
- Create: `components/shop/ShopItemList.tsx` — 아이템 리스트 (탭별)
- Create: `components/shop/PurchaseConfirmModal.tsx` — 구매 확인 모달

- [ ] **Step 1: ShopItemCard 작성**

아이템 썸네일, 이름, 가격(포인트), 구매/장착 상태 표시.
레벨 미달 시 잠금 아이콘 + 필요 레벨 표시.

- [ ] **Step 2: ShopItemList 작성**

상단에 "쉘터" / "아바타" 세그먼트 탭.
FlatList 그리드 (2열) 레이아웃.

- [ ] **Step 3: PurchaseConfirmModal 작성**

아이템 미리보기, 가격, 현재 포인트 잔액, "구매" 버튼.
포인트 부족 시 비활성 + "포인트가 부족합니다" 메시지.

- [ ] **Step 4: 상점 화면 조합 및 구매 플로우 연결**

구매 → shelter-store/user-store 업데이트 → ShelterCanvas에 반영.

- [ ] **Step 5: 커밋**

```bash
git add app/(tabs)/shop.tsx components/shop/
git commit -m "feat: add shop tab with item browsing and purchase flow"
```

---

## Task 12: 에셋 제작 (AI 이미지 생성)

**Files:**
- Create: `assets/shelters/` — 쉘터 스프라이트 시트 (4종 × 3확장)
- Create: `assets/avatars/` — 아바타 스프라이트 시트 (4종 × 4모션)
- Create: `assets/facilities/` — 시설 오브젝트 스프라이트 (8종)
- Create: `assets/items/` — 상점 아이템 에셋 (20종)
- Create: `assets/ui/` — UI 아이콘, 배경
- Create: `assets/asset-manifest.ts` — 에셋 키 → require() 매핑

> **Note:** 이 태스크는 코드 구현이 아닌 에셋 제작입니다.
> AI 이미지 생성 도구를 사용하여 일관된 픽셀아트 스타일로 에셋을 제작합니다.

- [ ] **Step 1: 스타일 가이드 확정**

픽셀아트 스타일 레퍼런스 결정:
- 타일 크기: 64×64px (아이소메트릭)
- 팔레트: 제한된 색상 팔레트 (테마별 16~24색)
- 윤곽선: 1px 검은 윤곽
- 쉐이딩: 2~3단계 명암

- [ ] **Step 2: 쉘터 베이스 에셋 제작 (4종 × 3확장)**

각 테마별로:
- 확장 1단계 (방 1개, Lv1~14)
- 확장 2단계 (방 2개, Lv15~29)
- 확장 3단계 (방 3개, Lv30+)

총 12장의 쉘터 베이스 이미지.

- [ ] **Step 3: 시설 오브젝트 에셋 제작 (8종)**

발전기, 정수기, 재배시설, 간이침대, 침대(강화), 스크린, 스피커, 작업대.
각 64×64px 또는 128×64px (큰 시설).

- [ ] **Step 4: 아바타 스프라이트 시트 제작 (4종)**

각 아바타별 스프라이트 시트:
- idle (2프레임)
- walk_down, walk_up, walk_left, walk_right (각 4프레임)
- sleep (2프레임)
- interact (3프레임)

총 프레임: ~19프레임/아바타 → 4아바타 = 76프레임

- [ ] **Step 5: 상점 아이템 에셋 제작 (20종)**

쉘터 스킨 10종 + 아바타 아이템 10종.
각 아이템의 상점 썸네일(64×64) + 적용 시 스프라이트.

- [ ] **Step 6: 열화 오버레이 에셋 제작 (3단계)**

- 정상: 오버레이 없음
- 열화: 먼지/거미줄 오버레이, 조명 어두워짐
- 심각: 균열/물 샘/전등 깜빡임 오버레이

- [ ] **Step 7: UI 에셋 제작**

탭 아이콘 (5개), 포인트 코인 아이콘, XP 아이콘, 스트릭 불꽃 아이콘.
앱 아이콘 및 스플래시 스크린.

- [ ] **Step 8: asset-manifest 작성 및 엔진 연결**

`assets/asset-manifest.ts`에서 모든 에셋을 `require()`로 매핑.
placeholder 도형을 실제 에셋으로 교체.

- [ ] **Step 9: 커밋**

```bash
git add assets/
git commit -m "feat: add pixel art assets for shelters, avatars, facilities, and shop items"
```

---

## Task 13: 방치 시스템 & 설정 탭

**Files:**
- Modify: `app/(tabs)/settings.tsx` — 설정 화면
- Create: `components/settings/NotificationSettings.tsx` — 알림 설정
- Create: `components/shelter/DecayOverlay.tsx` — 열화 비주얼 오버레이
- Create: `components/shelter/DestructionScene.tsx` — 쉘터 파괴 연출
- Create: `components/shelter/RevivalModal.tsx` — 부활 확인 모달

- [ ] **Step 1: DecayOverlay 작성**

ShelterCanvas 위에 렌더링되는 열화 이펙트:
- Stage 0: 없음
- Stage 1: 반투명 먼지 파티클, 약간 어둡게
- Stage 2: 진한 먼지, 균열 이미지, 깜빡이는 조명

- [ ] **Step 2: DestructionScene 작성**

전체 화면 파괴 연출 (모달 또는 별도 화면):
- 쉘터 무너지는 애니메이션
- "쉘터가 파괴되었습니다" 메시지
- "새로운 쉘터 시작하기" 버튼 → 온보딩 재시작

- [ ] **Step 3: RevivalModal 작성**

파괴 직전 (Stage 2 → 14일 경과) 표시:
- "쉘터를 살릴 수 있습니다!"
- 필요 포인트 표시
- "부활 (500P)" / "포기하기" 버튼

- [ ] **Step 4: 앱 포그라운드 진입 시 열화 체크 연결**

`app/_layout.tsx`에서 `AppState` 리스너로 포그라운드 전환 감지.
→ `shelter-store.checkDecay()` 호출
→ 파괴 시점 도달 시 DestructionScene 표시 또는 RevivalModal 표시.

- [ ] **Step 5: NotificationSettings 작성**

설정 화면의 알림 섹션:
- 퀘스트 리마인더 on/off
- 데일리 요약 on/off + 시간 설정
- 쉘터 위험 경고 on/off
- 레벨업/보상 알림 on/off

- [ ] **Step 6: 설정 화면 완성**

알림 설정 + 앱 정보 (버전, 라이선스) 표시.

- [ ] **Step 7: 커밋**

```bash
git add app/(tabs)/settings.tsx components/settings/ components/shelter/DecayOverlay.tsx components/shelter/DestructionScene.tsx components/shelter/RevivalModal.tsx
git commit -m "feat: add decay system, destruction scene, revival modal, and settings"
```

---

## Task 14: 통합 테스트 & 플로우 검증

- [ ] **Step 1: 전체 온보딩 플로우 테스트**

앱 최초 실행 → 쉘터 선택 → 아바타 선택 → 첫 퀘스트 생성 → 메인 화면 도달.

- [ ] **Step 2: 퀘스트 완료 → XP/레벨/포인트 연쇄 테스트**

퀘스트 완료 → XP 증가 → 레벨업 시 포인트 적립 → 상점에서 포인트 사용 → 쉘터 반영.

- [ ] **Step 3: 스트릭 시스템 테스트**

연속 완료 → 스트릭 카운트 증가 → 배율 적용 → 기록 탭 반영.

- [ ] **Step 4: 방치 → 열화 → 파괴 → 재시작 테스트**

시간 조작(테스트 모드)으로 7일/10일/14일 경과 시뮬레이션.
열화 비주얼 → 경고 알림 → 파괴 연출 → 온보딩 재시작 확인.

- [ ] **Step 5: 구제 시스템 테스트**

14일 도달 전 부활 → 포인트 차감 → 열화 리셋 → 쉘터 유지 확인.

- [ ] **Step 6: 최종 버그 수정 및 UI 폴리싱**

발견된 버그 수정, 빈 상태 UI, 로딩 상태, 에러 처리 보강.

- [ ] **Step 7: 커밋**

```bash
git add -A
git commit -m "test: integration tests and bug fixes for full MVP flow"
```

---

## Task 15: 빌드 설정 & 초기 커밋 정리

- [ ] **Step 1: app.json / eas.json 최종 설정**

앱 이름, 번들 ID, 버전, 아이콘, 스플래시 스크린 설정.
EAS Build 프로필 (development, preview, production) 설정.

```json
// eas.json
{
  "build": {
    "development": { "developmentClient": true },
    "preview": { "distribution": "internal" },
    "production": {}
  }
}
```

- [ ] **Step 2: .gitignore 정리**

```
node_modules/
.expo/
dist/
*.jks
*.p12
*.key
*.mobileprovision
*.orig.*
web-build/
```

- [ ] **Step 3: README.md 작성**

프로젝트 설명, 기술 스택, 로컬 개발 방법, 빌드 명령어.

- [ ] **Step 4: 최종 커밋 및 Push**

```bash
git add -A
git commit -m "chore: finalize build config and project documentation"
git push origin main
```

---

## 구현 순서 요약

```
Task 1  → Expo 프로젝트 초기화 (기반)
Task 2  → 타입 & 상수 (데이터 모델)
Task 3  → SQLite DB 레이어 (영속화)
Task 4  → Zustand 스토어 (상태 관리)
Task 5  → 게임 로직 서비스 (핵심 엔진)
Task 6  → 온보딩 UI
Task 7  → 퀘스트 탭 UI
Task 8  → 기록 탭 UI
Task 9  → 푸시 알림
Task 10 → 쉘터 뷰 (2D 렌더링) ← 가장 복잡
Task 11 → 상점 UI
Task 12 → 에셋 제작 (AI 이미지) ← Task 10과 병렬 가능
Task 13 → 방치 시스템 & 설정
Task 14 → 통합 테스트
Task 15 → 빌드 설정 & 마무리
```

**병렬 가능 그룹:**
- Task 5 (게임 로직) ↔ Task 6 (온보딩 UI) — 서로 독립
- Task 7 (퀘스트) ↔ Task 8 (기록) — UI만 다름
- Task 10 (쉘터 렌더링) ↔ Task 12 (에셋 제작) — placeholder로 선 구현 후 에셋 교체
