const { exec } = require("child_process");
const path = require("path");

// Configuration
const TEST_CONFIG = {
  testFile: path.join(__dirname, "leaderboard.test.js"),
  timeout: 30000, // 30 seconds timeout
  env: {
    NODE_ENV: "test",
    TEST_PORT: "3001",
  },
};

// Run tests
console.log("Starting Leaderboard Tests...");
console.log("===========================");

// Use npx to run the locally installed Jest
const testProcess = exec(
  `npx jest ${TEST_CONFIG.testFile} --verbose --detectOpenHandles --forceExit`,
  {
    env: {
      ...process.env,
      ...TEST_CONFIG.env,
    },
    timeout: TEST_CONFIG.timeout,
  }
);

// Handle test output
testProcess.stdout.on("data", (data) => {
  console.log(data.toString());
});

testProcess.stderr.on("data", (data) => {
  console.error(data.toString());
});

// Handle test completion
testProcess.on("close", (code) => {
  console.log("\nTest Execution Summary:");
  console.log("=======================");
  console.log(`Exit Code: ${code}`);
  console.log(`Timeout: ${TEST_CONFIG.timeout}ms`);
  console.log(`Environment: ${TEST_CONFIG.env.NODE_ENV}`);

  if (code === 0) {
    console.log("\n✅ All tests passed successfully!");
  } else {
    console.log(
      "\n❌ Some tests failed. Please check the output above for details."
    );
  }

  process.exit(code);
});

// Handle errors
testProcess.on("error", (error) => {
  console.error("Test execution error:", error);
  process.exit(1);
});
