"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; } function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }// src/cli/index.ts
var _interactivecommander = require('interactive-commander');

// src/parsers/yaml.ts
var _yaml = require('yaml');
var _fs = require('fs'); var _fs2 = _interopRequireDefault(_fs);
var YamlParser = class {
  
  constructor() {
    this.context = {
      variables: {},
      timestamp: (/* @__PURE__ */ new Date()).toISOString(),
      random: {
        string: (length = 10) => Math.random().toString(36).substring(2, 2 + length),
        number: (min, max) => Math.floor(Math.random() * (max - min + 1)) + min
      }
    };
  }
  parse(filePath) {
    try {
      const fileContent = _fs.readFileSync.call(void 0, filePath, "utf8");
      let parsed = _yaml.parse.call(void 0, fileContent);
      if (parsed.variables && Object.keys(parsed.variables).length > 0) {
        this.context.variables = parsed.variables;
      }
      this.validateConfig(parsed);
      return this.substituteVariables(parsed);
    } catch (error) {
      throw new Error(`${error}`);
    }
  }
  stringify(config) {
    return _yaml.stringify.call(void 0, config);
  }
  validateConfig(config) {
    if (!config.name) {
      throw new Error("Config must have a name");
    }
    if (!config.tests || !_optionalChain([config, 'access', _ => _.tests, 'optionalAccess', _2 => _2.length])) throw new Error("Config must have at least one test case");
    config.tests.forEach((test, index) => {
      if (!test.name) throw new Error(`Test case ${index + 1} must have a name`);
      if (!_optionalChain([test, 'access', _3 => _3.request, 'optionalAccess', _4 => _4.method]) || !_optionalChain([test, 'access', _5 => _5.request, 'optionalAccess', _6 => _6.url])) throw new Error(`Test case ${index + 1} must have a request method and url`);
      if (!_optionalChain([test, 'access', _7 => _7.expect, 'optionalAccess', _8 => _8.statusCode])) throw new Error(`Test case ${index + 1} must have an expected status code`);
      if (test.expect.statusCode < 100 || test.expect.statusCode >= 600) {
        throw new Error(`Invalid status code: ${test.expect.statusCode} for test case ${index + 1}`);
      }
      if (test.expect.headers) {
        Object.keys(test.expect.headers).forEach((key) => {
          if (typeof test.expect.headers[key] !== "string" && typeof test.expect.headers[key] !== "object") {
            throw new Error(`Invalid header value: ${test.expect.headers[key]} for test case ${index + 1}`);
          }
        });
      }
      if (test.expect.body) {
        if (typeof test.expect.body !== "string" && typeof test.expect.body !== "object") {
          throw new Error(`Invalid body value: ${test.expect.body} for test case ${index + 1}`);
        }
      }
    });
  }
  substituteVariables(obj) {
    if (typeof obj === "string") {
      return this.substituteString(obj);
    }
    if (obj === null || obj === void 0) {
      return obj;
    }
    if (Array.isArray(obj)) {
      return obj.map((item) => this.substituteVariables(item));
    }
    if (typeof obj === "object") {
      const result2 = {};
      for (const [key, value] of Object.entries(obj)) {
        if (typeof value === "string") {
          result2[key] = this.substituteString(value);
        } else if (typeof value === "object" && value !== null) {
          result2[key] = this.substituteVariables(value);
        } else {
          result2[key] = value;
        }
      }
      return result2;
    }
    const result = {};
    for (const [key, value] of Object.entries(obj)) {
      result[key] = this.substituteVariables(value);
    }
    return result;
  }
  substituteString(str) {
    if (!str.includes("{{")) {
      return str;
    }
    return str.replace(/\{\{([^}]+)\}\}/g, (match, path) => {
      console.log("Found variable:", match, "path:", path);
      if (path.startsWith("random.string")) {
        console.log("random.string", path);
        const lengthMatch = path.match(/random\.string\((\d+)\)/);
        const length = lengthMatch ? parseInt(lengthMatch[1]) : 10;
        return Math.random().toString(36).substring(2, length + 2);
      }
      if (path.startsWith("random.number")) {
        console.log("random.number", path);
        const numbersMatch = path.match(/random\.number\((\d+),(\d+)\)/);
        if (numbersMatch) {
          const min = parseInt(numbersMatch[1]);
          const max = parseInt(numbersMatch[2]);
          return String(Math.floor(Math.random() * (max - min + 1)) + min);
        }
      }
      if (path.startsWith("saveAs:")) {
        return match;
      }
      const value = this.context.variables[path];
      if (value === void 0) {
        console.warn(`Variable ${path} not found`);
        return match;
      }
      return String(value);
    });
  }
};

// src/cli/commands/run.ts



// src/http/client.ts
var _axios = require('axios'); var _axios2 = _interopRequireDefault(_axios);

// src/utils/response.ts


// src/utils/errors.ts
var APIFlowError = class extends Error {
  constructor(message) {
    super(message);
    this.name = "APIFlowError";
  }
};
var NetworkError = class extends APIFlowError {
  constructor(message) {
    super(message);
    this.name = "NetworkError";
  }
};
var TimeoutError = class extends APIFlowError {
  constructor(timeout) {
    super(`Request timed out after ${timeout}ms`);
    this.name = "TimeoutError";
  }
};
var ValidationError = class extends APIFlowError {
  constructor(message) {
    super(message);
    this.name = "ValidationError";
  }
};
var HTTPError = class extends APIFlowError {
  constructor(statusCode, statusText, response) {
    super(`HTTP Error ${statusCode}: ${statusText}`);
    this.statusCode = statusCode;
    this.statusText = statusText;
    this.response = response;
    this.name = "HTTPError";
  }
};
var RequestError = class extends APIFlowError {
  constructor(message, originalError) {
    super(message);
    this.originalError = originalError;
    this.name = "RequestError";
  }
};

// src/utils/response.ts
function handleSuccessResponse(response, startTime) {
  const duration = Date.now() - startTime;
  return {
    statusCode: response.status,
    statusText: response.statusText,
    statusMessage: response.statusText,
    headers: response.headers,
    body: response.data,
    timestamp: /* @__PURE__ */ new Date(),
    protoMajor: 1,
    protoMinor: 1,
    duration
  };
}
function handleErrorResponse(error, startTime) {
  const duration = Date.now() - startTime;
  if (error instanceof _axios.AxiosError) {
    if (error.code === "ECONNABORTED") {
      throw new TimeoutError(5e3);
    }
    if (error.code === "ECONNREFUSED" || error.code === "ENOTFOUND") {
      throw new NetworkError(`Network error: ${error.message}`);
    }
    if (error.response) {
      throw new HTTPError(
        error.response.status,
        error.response.statusText,
        error.response.data
      );
    }
    if (error.request) {
      throw new NetworkError("No response received from server");
    }
  }
  throw new RequestError(
    "An unexpected error occurred",
    error
  );
}

// src/utils/ui.ts
var _ora = require('ora'); var _ora2 = _interopRequireDefault(_ora);
var _progress = require('progress'); var _progress2 = _interopRequireDefault(_progress);
var testSpinner = _ora2.default.call(void 0, {
  text: "Running tests",
  color: "cyan"
});
var requestSpinner = _ora2.default.call(void 0, {
  text: "Executing request",
  color: "yellow"
});
function createTestProgressBar(total) {
  return new (0, _progress2.default)("Running tests [:bar] :current/:total :percent :etas", {
    complete: "\u2588",
    incomplete: " ",
    width: 30,
    total
  });
}

// src/http/client.ts
async function executeRequest(test, baseUrl) {
  const startTime = Date.now();
  if (!test.request.method || !test.request.url) {
    throw new ValidationError("Request method and URL are required");
  }
  const config = {
    method: test.request.method,
    url: `${baseUrl}${test.request.url}`,
    headers: test.request.header,
    data: test.request.body,
    timeout: 5e3,
    // Default timeout
    validateStatus: (status) => status >= 200 && status < 600
    // Accept all status codes
  };
  try {
    requestSpinner.start(`\u{1F680} Executing ${test.name}`);
    requestSpinner.text = `${config.method} ${config.url}`;
    if (config.headers) {
      console.log("Headers:", config.headers);
    }
    if (config.data) {
      console.log("Body:", config.data);
    }
    const response = await _axios2.default.call(void 0, config);
    const duration = Date.now() - startTime;
    requestSpinner.succeed(`Completed ${test.name} in ${duration}ms`);
    console.log(`Status: ${response.status}`);
    console.log("Response:", JSON.stringify(response.data, null, 2));
    return handleSuccessResponse(response, startTime);
  } catch (error) {
    requestSpinner.fail(`Failed ${test.name}`);
    return handleErrorResponse(error, startTime);
  }
}

// src/core/runner.ts
async function runTests(config) {
  try {
    testSpinner.start("Loading test configuration");
    testSpinner.succeed("Configuration loaded");
    const progressBar = createTestProgressBar(config.tests.length);
    let passed = 0;
    let failed = 0;
    for (const test of config.tests) {
      try {
        console.log(`
\u{1F9EA} Running test: ${test.name}`);
        const result = await executeRequest(test, config.baseUrl || "");
        progressBar.tick();
        console.log(`
\u2705 Test "${test.name}" completed`);
        console.log(`Duration: ${result.duration}ms`);
        passed++;
      } catch (error) {
        progressBar.tick();
        failed++;
        if (error instanceof HTTPError) {
          console.error(`
\u274C Test "${test.name}" failed with HTTP error:`);
          console.error(`Status: ${error.statusCode}`);
          console.error(`Message: ${error.statusText}`);
          if (error.response) {
            console.error("Response:", error.response);
          }
        } else if (error instanceof NetworkError) {
          console.error(`
\u274C Test "${test.name}" failed with network error:`);
          console.error(error.message);
        } else if (error instanceof TimeoutError) {
          console.error(`
\u274C Test "${test.name}" failed with timeout:`);
          console.error(error.message);
        } else if (error instanceof ValidationError) {
          console.error(`
\u274C Test "${test.name}" failed validation:`);
          console.error(error.message);
        } else {
          console.error(`
\u274C Test "${test.name}" failed with unexpected error:`);
          console.error(error);
        }
      }
    }
    console.log("\n\u{1F4CA} Test Summary:");
    console.log(`Total: ${config.tests.length}`);
    console.log(`Passed: ${passed}`);
    console.log(`Failed: ${failed}`);
  } catch (error) {
    testSpinner.fail("Test execution failed");
    if (error instanceof APIFlowError) {
      console.error("Test execution failed:", error.message);
    } else {
      console.error("Unexpected error during test execution:", error);
    }
    throw error;
  }
}

// src/cli/commands/run.ts
var yamlParser = new YamlParser();
var run_default = new (0, _interactivecommander.InteractiveCommand)().command("run").description("Run API tests").argument("[file]", "Path to the YAML file containing the test configuration").action(async (filePath) => {
  if (!filePath) {
    console.error("No file path provided");
    return;
  }
  if (!filePath.endsWith(".yaml") && !filePath.endsWith(".yml")) {
    console.error("Invalid file type. Please provide a YAML file.");
    return;
  }
  if (!_fs2.default.existsSync(filePath)) {
    console.error(`File not found: ${filePath}`);
    return;
  }
  try {
    const config = yamlParser.parse(filePath);
    testSpinner.succeed("Configuration loaded");
    console.log(`
\uFFFD\uFFFD Running tests from: ${filePath}`);
    await runTests(config);
  } catch (error) {
    console.error(`Error parsing YAML file: ${error}`);
    return;
  }
});

// src/cli/index.ts
var cli_default = new (0, _interactivecommander.InteractiveCommand)().name("apiflow").description("Code-first API testing framework").version("1.0.0").helpOption("-h, --help", "Show help").addCommand(run_default);


exports.default = cli_default;

module.exports = exports.default;
//# sourceMappingURL=cli.cjs.map