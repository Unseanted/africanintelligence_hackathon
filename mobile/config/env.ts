

// import Constants from 'expo-constants';

// const extra = Constants.expoConfig?.extra || {};

// export const API_URL = extra.apiUrl || 'https://africanintelligence-hackathon-backend.onrender.com';
// export const SOCKET_URL = extra.socketUrl || '';
// export const OPENAI_API_KEY = extra.openaiApiKey || ''

import Constants from 'expo-constants';

const extra = Constants.expoConfig?.extra || {};

export const API_URL = extra.apiUrl || 'https://your-default-url.com';
export const SOCKET_URL = extra.socketUrl || '';
export const OPENAI_API_KEY = extra.openaiApiKey || '';
