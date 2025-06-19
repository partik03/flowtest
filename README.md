# API Testing Framework

A modern, TypeScript-based API testing framework that allows you to write and execute API tests in a simple, declarative way.

## Features

- YAML-based test definitions
- TypeScript support
- Rich assertion library
- Request/response logging
- Variable interpolation
- Multiple output formats (Console, JSON)
- CLI interface

## Project Structure

```
src/
├── cli/                 # CLI interface
│   ├── index.ts         # Main CLI entry point
│   └── commands/        # CLI command handlers
├── core/                # Core test execution engine
├── parsers/             # File parsers
├── http/                # HTTP client wrapper
├── assertions/          # Assertion engine
├── reporters/           # Output formatters
├── utils/               # Shared utilities
└── types/               # TypeScript definitions
```

## Setup

1. Install dependencies:
```bash
npm install
```

2. Build the project:
```bash
npm run build
```

## Development

```bash
# Run tests
npm test

# Lint code
npm run lint

# Format code
npm run format
```

## License

Apache