export function loadData(key, fallbackValue) {
  try {
    const savedData = localStorage.getItem(key);
    return savedData ? JSON.parse(savedData) : fallbackValue;
  } catch (error) {
    console.error(`Could not load ${key}:`, error);
    return fallbackValue;
  }
}

export function saveData(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(`Could not save ${key}:`, error);
  }
}