// Generate or retrieve persistent unique device ID for replay lock
export function getOrCreateDeviceId(): string {
  const STORAGE_KEY = 'logic_quiz_device_uuid';
  let deviceId = localStorage.getItem(STORAGE_KEY);
  if (!deviceId) {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
      deviceId = 'dev_' + crypto.randomUUID();
    } else {
      deviceId = 'dev_' + Date.now().toString(36) + '_' + Math.random().toString(36).substring(2, 10);
    }
    localStorage.setItem(STORAGE_KEY, deviceId);
  }
  return deviceId;
}
