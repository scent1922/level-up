import * as Notifications from 'expo-notifications';

// Configure notification handler (call once at app init)
export function configureNotifications(): void {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
      shouldShowBanner: true,
      shouldShowList: true,
    }),
  });
}

// Request permission
export async function requestNotificationPermission(): Promise<boolean> {
  const { status } = await Notifications.requestPermissionsAsync();
  return status === 'granted';
}

// NTF-01: Quest reminders
export async function scheduleQuestReminder(
  questId: string,
  questName: string,
  hour: number,
  minute: number,
  frequencyType: string
): Promise<string> {
  const identifier = await Notifications.scheduleNotificationAsync({
    content: {
      title: '퀘스트 알림',
      body: `"${questName}" 퀘스트를 완료할 시간입니다!`,
      data: { questId, frequencyType },
      sound: true,
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour,
      minute,
    },
  });
  return identifier;
}

export async function cancelQuestReminder(notificationId: string): Promise<void> {
  await Notifications.cancelScheduledNotificationAsync(notificationId);
}

// NTF-02: Daily summary
export async function scheduleDailySummary(hour: number, minute: number): Promise<string> {
  const identifier = await Notifications.scheduleNotificationAsync({
    content: {
      title: '오늘의 퀘스트',
      body: '오늘의 퀘스트를 확인해보세요!',
      sound: true,
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour,
      minute,
    },
  });
  return identifier;
}

// NTF-03: Shelter danger warning
export async function scheduleShelterWarning(daysLeft: number): Promise<string> {
  const identifier = await Notifications.scheduleNotificationAsync({
    content: {
      title: '쉘터 위험 경고!',
      body: `쉘터가 위험합니다! ${daysLeft}일 후 파괴됩니다`,
      sound: true,
    },
    trigger: null, // immediate notification
  });
  return identifier;
}

// NTF-04: Level up notification
export async function sendLevelUpNotification(newLevel: number): Promise<void> {
  await Notifications.scheduleNotificationAsync({
    content: {
      title: '레벨 업!',
      body: `레벨 ${newLevel} 달성! 새로운 기능이 해금되었습니다`,
      sound: true,
    },
    trigger: null, // immediate
  });
}

export async function sendStreakMilestoneNotification(streakDays: number): Promise<void> {
  await Notifications.scheduleNotificationAsync({
    content: {
      title: '연속 달성!',
      body: `연속 ${streakDays}일 달성! XP 보너스가 적용됩니다`,
      sound: true,
    },
    trigger: null, // immediate
  });
}

// Cancel all
export async function cancelAllNotifications(): Promise<void> {
  await Notifications.cancelAllScheduledNotificationsAsync();
}
