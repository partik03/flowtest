import { parse, stringify} from "yaml";
import { readFileSync } from "fs";
import { YamlConfig, VariableContext } from "../types";

export default class YamlParser {

    private context: VariableContext;

    constructor() {
        this.context = {
            variables: {},
            timestamp: new Date().toISOString(),
            random: {
                string: (length = 10) => Math.random().toString(36).substring(2, 2 + length),
                number: (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min,
            },
        };
    }

    parse(filePath: string): YamlConfig {
        try {
            const fileContent = readFileSync(filePath, 'utf8');
            let parsed = parse(fileContent) as YamlConfig;

            if(parsed.variables && Object.keys(parsed.variables).length > 0) {
                this.context.variables = parsed.variables;
            }

            this.validateConfig(parsed);
            return this.substituteVariables(parsed);
        } catch (error) {
            throw new Error(`${error}`);
        }
    }

    stringify(config: YamlConfig): string {
        return stringify(config);
    }

    private validateConfig(config: YamlConfig): void {
        if (!config.name) {
            throw new Error('Config must have a name');
        }
        if(!config.tests || !config.tests?.length) throw new Error('Config must have at least one test case');

        config.tests.forEach((test, index) => {
            if(!test.name) throw new Error(`Test case ${index + 1} must have a name`);
            if(!test.request?.method || !test.request?.url) throw new Error(`Test case ${index + 1} must have a request method and url`);
            if(!test.expect?.statusCode) throw new Error(`Test case ${index + 1} must have an expected status code`);

            if(test.expect.statusCode < 100 || test.expect.statusCode >= 600) {
                throw new Error(`Invalid status code: ${test.expect.statusCode} for test case ${index + 1}`);
            }

            if(test.expect.headers) {
                Object.keys(test.expect.headers).forEach((key) => {
                    if(typeof test.expect.headers[key] !== 'string' && typeof test.expect.headers[key] !== 'object') {
                        throw new Error(`Invalid header value: ${test.expect.headers[key]} for test case ${index + 1}`);
                    }
                });
            }

            if(test.expect.body) {
                if(typeof test.expect.body !== 'string' && typeof test.expect.body !== 'object') {
                    throw new Error(`Invalid body value: ${test.expect.body} for test case ${index + 1}`);
                }
            }
        });
    }

    private substituteVariables<T>(obj: T): T {
        if (typeof obj === 'string') {
            return this.substituteString(obj) as T;
        }
        // Handle null/undefined
        if (obj === null || obj === undefined) {
            return obj;
        }
        if (Array.isArray(obj)) {
            return obj.map(item => this.substituteVariables(item)) as T;
        }

        // Handle objects
        if (typeof obj === 'object') {
            const result = {} as T;
            for (const [key, value] of Object.entries(obj)) {
                if (typeof value === 'string') {
                    result[key as keyof T] = this.substituteString(value) as any;
                } else if (typeof value === 'object' && value !== null) {
                    result[key as keyof T] = this.substituteVariables(value);
                } else {
                    result[key as keyof T] = value as any;
                }
            }
            return result
        }

        const result = {} as T;
        for (const [key, value] of Object.entries(obj)) {
            result[key as keyof T] = this.substituteVariables(value);
        }
        return result;
    }
    private substituteString(str: string): string {
        if (!str.includes('{{')) {
            return str;
        }
        return str.replace(/\{\{([^}]+)\}\}/g, (match, path) => {
            console.log('Found variable:', match, 'path:', path);
            
            // Handle random.string(length)
            if (path.startsWith('random.string')) {
                console.log("random.string", path);
                
                const lengthMatch = path.match(/random\.string\((\d+)\)/);
                const length = lengthMatch ? parseInt(lengthMatch[1]) : 10;
                return Math.random().toString(36).substring(2, length + 2);
            }
            
            // Handle random.number(min,max)
            if (path.startsWith('random.number')) {
                console.log("random.number", path);
                
                const numbersMatch = path.match(/random\.number\((\d+),(\d+)\)/);
                if (numbersMatch) {
                    const min = parseInt(numbersMatch[1]);
                    const max = parseInt(numbersMatch[2]);
                    return String(Math.floor(Math.random() * (max - min + 1)) + min);
                }
            }

            if (path.startsWith('saveAs:')) {
                // Handle saveAs variable - we'll implement this later
                return match;
            }

            const value = this.context.variables[path];
            if (value === undefined) {
                console.warn(`Variable ${path} not found`);
                return match;
            }
            return String(value);
        });
    }
}