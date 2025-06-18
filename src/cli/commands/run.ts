import YamlParser from "../../parsers/yaml";
import { InteractiveCommand, InteractiveOption } from "interactive-commander";
import fs from 'fs';


const yamlParser = new YamlParser();


export default new InteractiveCommand()
.command('run')
.description('Run API tests')
.argument('[file]', 'Path to the YAML file containing the test configuration')
.action(async (filePath: string) => {
    if(!filePath) {
        console.error('No file path provided');
        return;
    }
    if(!filePath.endsWith('.yaml') && !filePath.endsWith('.yml')) {
        console.error('Invalid file type. Please provide a YAML file.');
        return;
    }
    if(!fs.existsSync(filePath)) {
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
    
    
})

