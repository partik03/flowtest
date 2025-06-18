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
      if (test.expect.header) {
        Object.keys(test.expect.header).forEach((key) => {
          if (typeof test.expect.header[key] !== "string" && typeof test.expect.header[key] !== "object") {
            throw new Error(`Invalid header value: ${test.expect.header[key]} for test case ${index + 1}`);
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
        const lengthMatch = path.match(/random\.string\((\d+)\)/);
        const length = lengthMatch ? parseInt(lengthMatch[1]) : 10;
        return Math.random().toString(36).substring(2, length + 2);
      }
      if (path.startsWith("random.number")) {
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
    console.log(config.tests);
    console.log(`Running tests from ${filePath}`);
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