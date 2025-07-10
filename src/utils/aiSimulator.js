// Required env: VITE_API_URL
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:7000/api";

// Knowledge base for different topics
const knowledgeBase = {
  react: {
    hooks: {
      useState: {
        description: "A Hook that lets you add state to functional components.",
        examples: [
          {
            code: "const [count, setCount] = useState(0);",
            explanation: "Basic counter state",
          },
          {
            code: "const [user, setUser] = useState({ name: '', age: 0 });",
            explanation: "Object state with multiple properties",
          },
          {
            code: `function Counter() {
  const [count, setCount] = useState(0);
  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={() => setCount(count + 1)}>Increment</button>
    </div>
  );
}`,
            explanation: "Complete counter component example",
          },
        ],
        bestPractices: [
          "Always use the setter function to update state",
          "Don't mutate state directly",
          "Use multiple useState calls for different pieces of state",
          "Consider using useReducer for complex state logic",
          "Initialize state with a function for expensive computations",
        ],
        commonMistakes: [
          "Mutating state directly instead of using setter",
          "Forgetting to include all dependencies in useEffect",
          "Using stale state in event handlers",
        ],
      },
      useEffect: {
        description:
          "A Hook that lets you perform side effects in functional components.",
        examples: [
          {
            code: `useEffect(() => {
  document.title = \`Count: \${count}\`;
}, [count]);`,
            explanation: "Update document title when count changes",
          },
          {
            code: `useEffect(() => {
  const subscription = data.subscribe();
  return () => subscription.unsubscribe();
}, []);`,
            explanation: "Cleanup subscription on unmount",
          },
          {
            code: `function DataFetcher() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch('https://api.example.com/data');
        const json = await response.json();
        setData(json);
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  if (loading) return <div>Loading...</div>;
  return <div>{JSON.stringify(data)}</div>;
}`,
            explanation: "Complete data fetching example",
          },
        ],
        bestPractices: [
          "Always include dependencies in the dependency array",
          "Use cleanup functions to prevent memory leaks",
          "Be careful with infinite loops",
          "Split effects by purpose",
          "Use multiple effects for different concerns",
        ],
        commonMistakes: [
          "Missing dependencies in the dependency array",
          "Forgetting cleanup functions",
          "Infinite re-render loops",
        ],
      },
      useContext: {
        description:
          "A Hook that lets you subscribe to React context without introducing nesting.",
        examples: [
          {
            code: `const ThemeContext = React.createContext('light');

function App() {
  return (
    <ThemeContext.Provider value="dark">
      <ThemedButton />
    </ThemeContext.Provider>
  );
}

function ThemedButton() {
  const theme = useContext(ThemeContext);
  return <button className={theme}>Themed Button</button>;
}`,
            explanation: "Basic theme context example",
          },
          {
            code: `const UserContext = React.createContext({
  user: null,
  login: () => {},
  logout: () => {}
});

function UserProvider({ children }) {
  const [user, setUser] = useState(null);

  const login = (userData) => setUser(userData);
  const logout = () => setUser(null);

  return (
    <UserContext.Provider value={{ user, login, logout }}>
      {children}
    </UserContext.Provider>
  );
}`,
            explanation: "Complete user context with methods",
          },
        ],
        bestPractices: [
          "Create context with a meaningful default value",
          "Use context for global state that doesn't change often",
          "Consider performance implications",
          "Split contexts by domain",
          "Use context with useReducer for complex state",
        ],
        commonMistakes: [
          "Creating context inside components",
          "Overusing context for everything",
          "Not providing default values",
        ],
      },
    },
    patterns: {
      "custom-hooks": {
        description:
          "Custom hooks are a way to reuse stateful logic between components.",
        examples: [
          {
            code: `function useWindowSize() {
  const [size, setSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight
  });

  useEffect(() => {
    const handleResize = () => {
      setSize({
        width: window.innerWidth,
        height: window.innerHeight
      });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return size;
}`,
            explanation: "Window size hook with cleanup",
          },
          {
            code: `function useLocalStorage(key, initialValue) {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(error);
      return initialValue;
    }
  });

  const setValue = (value) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error(error);
    }
  };

  return [storedValue, setValue];
}`,
            explanation: "Local storage hook with error handling",
          },
        ],
        bestPractices: [
          "Start hook names with 'use'",
          "Keep hooks focused on a single responsibility",
          "Share logic, not state",
          "Handle errors gracefully",
          "Provide clear documentation",
        ],
        commonMistakes: [
          "Not following the 'use' prefix convention",
          "Creating hooks with too many responsibilities",
          "Not handling edge cases",
        ],
      },
    },
  },
  javascript: {
    async: {
      description: "Asynchronous programming in JavaScript",
      concepts: [
        "Promises",
        "async/await",
        "Event Loop",
        "Microtasks and Macrotasks",
      ],
      examples: [
        {
          code: `async function fetchUserData(userId) {
  try {
    const response = await fetch(\`https://api.example.com/users/\${userId}\`);
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching user:', error);
    throw error;
  }
}`,
          explanation: "Async/await with error handling",
        },
        {
          code: `function fetchWithTimeout(url, timeout = 5000) {
  return Promise.race([
    fetch(url),
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Timeout')), timeout)
    )
  ]);
}`,
          explanation: "Promise with timeout",
        },
      ],
      bestPractices: [
        "Always handle errors in async code",
        "Use Promise.all for parallel requests",
        "Consider using AbortController for cancellable requests",
        "Be aware of the event loop",
        "Use async/await for better readability",
      ],
      commonMistakes: [
        "Not handling promise rejections",
        "Forgetting to await promises",
        "Blocking the event loop",
      ],
    },
  },
};

// Response templates with code highlighting
const responseTemplates = {
  explanation: [
    "Let me explain {topic} in detail. {content}",
    "Here's a comprehensive explanation of {topic}: {content}",
    "I'll break down {topic} for you: {content}",
  ],
  example: [
    "Here's an example of {topic}: {content}",
    "Let me show you how to use {topic}: {content}",
    "Here's a practical example of {topic}: {content}",
  ],
  bestPractice: [
    "When working with {topic}, remember these best practices: {content}",
    "Here are some important best practices for {topic}: {content}",
    "To use {topic} effectively, follow these guidelines: {content}",
  ],
  commonMistake: [
    "Here are some common mistakes to avoid when using {topic}: {content}",
    "Watch out for these common pitfalls with {topic}: {content}",
    "These are frequent mistakes developers make with {topic}: {content}",
  ],
  error: [
    "I understand you're asking about {topic}. Let me help you with that.",
    "That's an interesting question about {topic}. Here's what you need to know.",
    "Let me address your question about {topic}.",
  ],
};

class AISimulator {
  constructor() {
    this.context = {
      currentTopic: null,
      previousQuestions: [],
      userLevel: "intermediate",
      lastResponseType: null,
    };
  }

  // Extract keywords from user message
  extractKeywords(message) {
    const keywords = {
      topic: null,
      type: null,
    };

    // Check for topic keywords
    if (message.toLowerCase().includes("useState")) {
      keywords.topic = "useState";
    } else if (message.toLowerCase().includes("useEffect")) {
      keywords.topic = "useEffect";
    } else if (message.toLowerCase().includes("useContext")) {
      keywords.topic = "useContext";
    } else if (message.toLowerCase().includes("custom hook")) {
      keywords.topic = "custom-hooks";
    } else if (
      message.toLowerCase().includes("async") ||
      message.toLowerCase().includes("promise")
    ) {
      keywords.topic = "async";
    }

    // Check for question type
    if (
      message.toLowerCase().includes("explain") ||
      message.toLowerCase().includes("what is")
    ) {
      keywords.type = "explanation";
    } else if (
      message.toLowerCase().includes("example") ||
      message.toLowerCase().includes("show me")
    ) {
      keywords.type = "example";
    } else if (
      message.toLowerCase().includes("best practice") ||
      message.toLowerCase().includes("how to")
    ) {
      keywords.type = "bestPractice";
    } else if (
      message.toLowerCase().includes("mistake") ||
      message.toLowerCase().includes("error")
    ) {
      keywords.type = "commonMistake";
    }

    return keywords;
  }

  // Generate a response based on the message
  generateResponse(message) {
    const keywords = this.extractKeywords(message);
    let response = "";

    // Update context
    this.context.previousQuestions.push(message);
    if (keywords.topic) {
      this.context.currentTopic = keywords.topic;
    }
    this.context.lastResponseType = keywords.type;

    // Generate response based on keywords
    if (keywords.topic && keywords.type) {
      const topicData = this.getTopicData(keywords.topic);
      if (topicData) {
        const template = this.getRandomTemplate(keywords.type);
        response = this.formatResponse(
          template,
          keywords.topic,
          topicData[keywords.type]
        );
      }
    }

    // If no specific response was generated, provide a general response
    if (!response) {
      response = this.generateGeneralResponse(message);
    }

    // Add follow-up suggestions
    response += this.generateFollowUp(keywords);

    return response;
  }

  // Get topic data from knowledge base
  getTopicData(topic) {
    if (topic.includes("use")) {
      return knowledgeBase.react.hooks[topic];
    } else if (topic === "custom-hooks") {
      return knowledgeBase.react.patterns["custom-hooks"];
    } else if (topic === "async") {
      return knowledgeBase.javascript.async;
    }
    return null;
  }

  // Get a random template for the response type
  getRandomTemplate(type) {
    const templates = responseTemplates[type] || responseTemplates.error;
    return templates[Math.floor(Math.random() * templates.length)];
  }

  // Format the response using the template
  formatResponse(template, topic, content) {
    if (Array.isArray(content)) {
      if (content[0] && typeof content[0] === "object" && content[0].code) {
        // Format code examples with explanations
        content = content
          .map(
            (item) =>
              `\`\`\`javascript\n${item.code}\n\`\`\`\n${item.explanation}`
          )
          .join("\n\n");
      } else {
        content = content.join("\n• ");
      }
    }
    return template.replace("{topic}", topic).replace("{content}", content);
  }

  // Generate a general response when no specific topic is detected
  generateGeneralResponse(message) {
    const generalResponses = [
      "I understand you're asking about React development. Could you please be more specific about which aspect you'd like to learn about?",
      "That's an interesting question. To help you better, could you specify which React concept you're interested in?",
      "I'd be happy to help you with React development. What specific topic would you like to explore?",
    ];
    return generalResponses[
      Math.floor(Math.random() * generalResponses.length)
    ];
  }

  // Generate follow-up suggestions
  generateFollowUp(keywords) {
    if (!keywords.topic) return "";

    const followUps = [
      "\n\nWould you like to see some examples?",
      "\n\nWould you like to know about best practices?",
      "\n\nWould you like to learn about common mistakes to avoid?",
      "\n\nWould you like to see a complete implementation?",
    ];

    return followUps[Math.floor(Math.random() * followUps.length)];
  }

  // Simulate typing delay
  async simulateTyping(message) {
    const words = message.split(" ");
    const delay = Math.random() * 100 + 50; // Random delay between 50-150ms per word
    return new Promise((resolve) => setTimeout(resolve, words.length * delay));
  }
}

export const aiSimulator = new AISimulator();
