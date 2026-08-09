const STORAGE_KEY = 'macao_applications';

export function generateRefNumber() {
  const year = new Date().getFullYear();
  const randomNo = Math.floor(100000 + Math.random() * 900000);
  return `${year}-${randomNo}`;
}

export function getApplications() {
  const data = localStorage.getItem(STORAGE_KEY);
  if (!data) return [];
  try {
    const list = JSON.parse(data);
    // Filter out mock test data if present
    return list.filter(app => app.referenceNo !== '2026-123456' && app.referenceNo !== '2026-789012' && app.referenceNo !== '2026-555888' && app.id !== 'REF123456');
  } catch (e) {
    return [];
  }
}

export function saveApplications(apps) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(apps));
}

export function getApplicationById(id) {
  const apps = getApplications();
  return apps.find((app) => app.id === id || app.referenceNo === id);
}

export function addApplication(newApp) {
  const apps = getApplications();
  const refNo = newApp.referenceNo || generateRefNumber();
  const appToAdd = {
    ...newApp,
    id: refNo,
    referenceNo: refNo,
    submissionDate: newApp.submissionDate || new Date().toISOString().split('T')[0]
  };
  const updatedApps = [appToAdd, ...apps];
  saveApplications(updatedApps);
  return appToAdd;
}

export function updateApplication(id, updatedFields) {
  const apps = getApplications();
  const index = apps.findIndex((app) => app.id === id || app.referenceNo === id);
  if (index !== -1) {
    apps[index] = { ...apps[index], ...updatedFields };
    saveApplications(apps);
    return apps[index];
  }
  return null;
}

export function deleteApplication(id) {
  const apps = getApplications();
  const filtered = apps.filter((app) => app.id !== id && app.referenceNo !== id);
  saveApplications(filtered);
  return filtered;
}
