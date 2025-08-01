export default {
    expo: {
      name: 'YourApp',
      slug: 'your-app',
      // ... other expo config
      extra: {
        openaiApiKey: process.env.OPENAI_API_KEY || '',
        apiUrl: process.env.API_URL || 'https://africanintelligence-hackathon-backend.onrender.com',
        socketUrl: process.env.SOCKET_URL || '',
      },
    },
  };