const STORAGE_KEY = 'bankTulang:v2';

const defaults = Object.freeze({
  version: 2,
  quizRaw: null,
  quizPercent: 0,
  quizCategory: null,
  quizInterpretation: null,
  calciumMg: 0,
  calciumItems: [],
  activitySessions: 0,
  activityItems: [],
  dailyCalciumTarget: 1000,
  weeklyActivityTarget: 5,
});

const subscribers = new Set();

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, Number(value) || 0));
}

function cleanText(value, maxLength = 120) {
  return String(value ?? '').replace(/[<>&]/g, '').trim().slice(0, maxLength);
}

function normalizeCalciumItems(items) {
  if (!Array.isArray(items)) return [];
  return items.filter((item) => item && typeof item === 'object').slice(0, 100).map((item, index) => ({
    id: cleanText(item.id, 80).replace(/[^a-zA-Z0-9_-]/g, '') || `calcium-${index}`,
    name: cleanText(item.name, 100) || 'Makanan',
    servings: clamp(item.servings, 0.5, 10),
    totalMg: Math.round(clamp(item.totalMg, 0, 5000)),
  }));
}

function normalizeActivityItems(items) {
  if (!Array.isArray(items)) return [];
  return items.filter((item) => item && typeof item === 'object').slice(0, 100).map((item, index) => ({
    id: cleanText(item.id, 80).replace(/[^a-zA-Z0-9_-]/g, '') || `activity-${index}`,
    type: cleanText(item.type, 100) || 'Aktivitas',
    duration: Math.round(clamp(item.duration, 1, 300)),
    loggedAt: cleanText(item.loggedAt, 40) || 'tersimpan',
  }));
}

function normalize(input = {}) {
  const state = { ...defaults, ...input };
  const calciumItems = normalizeCalciumItems(state.calciumItems);
  const activityItems = normalizeActivityItems(state.activityItems);
  return {
    ...state,
    version: 2,
    quizRaw: state.quizRaw === null ? null : clamp(state.quizRaw, 0, 12),
    quizPercent: clamp(state.quizPercent, 0, 100),
    quizCategory: state.quizCategory === null ? null : cleanText(state.quizCategory, 24),
    quizInterpretation: state.quizInterpretation === null ? null : cleanText(state.quizInterpretation, 280),
    calciumMg: clamp(calciumItems.reduce((sum, item) => sum + item.totalMg, 0), 0, 99999),
    calciumItems,
    activitySessions: activityItems.length,
    activityItems,
    dailyCalciumTarget: clamp(state.dailyCalciumTarget || 1000, 100, 3000),
    weeklyActivityTarget: clamp(state.weeklyActivityTarget || 5, 1, 14),
  };
}

function loadState() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? normalize(JSON.parse(saved)) : normalize();
  } catch {
    return normalize();
  }
}

let currentState = loadState();

function persist() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(currentState));
  } catch {
    // The app remains usable when browser storage is unavailable.
  }
}

function notify() {
  const snapshot = getState();
  subscribers.forEach((subscriber) => subscriber(snapshot));
}

export function getState() {
  return {
    ...currentState,
    calciumItems: currentState.calciumItems.map((item) => ({ ...item })),
    activityItems: currentState.activityItems.map((item) => ({ ...item })),
  };
}

export function patchState(partial) {
  currentState = normalize({ ...currentState, ...partial });
  persist();
  notify();
  return getState();
}

export function subscribe(subscriber) {
  subscribers.add(subscriber);
  subscriber(getState());
  return () => subscribers.delete(subscriber);
}

export function resetState() {
  currentState = normalize();
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Ignore storage errors and still reset in-memory state.
  }
  notify();
  return getState();
}
