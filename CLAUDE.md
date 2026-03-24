# Level-Up — Project Instructions

## Project Overview
습관 관리 × 쉘터 육성 게이미피케이션 모바일 앱 (React Native + Expo)

## Tech Stack
- React Native + Expo SDK 53+
- TypeScript
- Zustand (state management)
- expo-sqlite (local database)
- expo-notifications (push notifications)
- react-native-reanimated (animations)
- expo-router (file-based routing)

## Development
- `npx expo start` — Start dev server
- `npx expo run:ios` — Run on iOS simulator (Development Build required)
- `npx expo run:android` — Run on Android emulator
- `npx jest --verbose` — Run unit tests
- `npx tsc --noEmit` — TypeScript check

## Architecture
- `app/` — expo-router pages (tabs + onboarding)
- `components/` — React components by feature
- `engine/` — 2D rendering engine (isometric utils, avatar AI, shelter renderer)
- `stores/` — Zustand stores (user, quest, shelter)
- `services/` — Pure game logic (XP, points, decay, scheduler, notifications)
- `db/` — SQLite schema, database init, query modules
- `types/` — TypeScript type definitions
- `constants/` — Game balance constants, presets

## Key Conventions
- All data is local (SQLite), no server
- Dark theme throughout (#0A0A0A bg, #C8A84B gold accent)
- Post-apocalyptic aesthetic, sharp corners, pixel-art style
- Game balance constants in constants/balance.ts — change here to tune
- Stores sync to SQLite on every action
- Pure services in services/ — no side effects, easy to test
