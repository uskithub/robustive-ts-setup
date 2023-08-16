import * as dotenv from "dotenv";
import * as prompts from "prompts";
import * as readline from "node:readline/promises";
import { exit, stdin as input, stdout as output } from "node:process";
import { readFile, readdir } from "node:fs/promises";
import { mkdir } from "node:fs";

dotenv.config();

const rl = readline.createInterface({ input, output });

const path = process.env.WORKSPACE_PATH;

if (path === undefined) {
    exit(1);
}

readdir(path, { withFileTypes : true })
    .then((dirents) => {
        return dirents.filter(d => d.isDirectory() && !d.name.startsWith("."))
            .map(d => ({ title: d.name, value: d.name }));
    })
    .then((choices: prompts.Choice[]) => {
        const questions = [
            {
                type: "select"
                , name: "project"
                , message: "Select a project:"
                , choices
            }
        ] as prompts.PromptObject[];
        return prompts(questions);  
    })
    .then((answers: prompts.Answers<string>) => {
        const projectPath = `${ path }/${ answers.project }`;
        
        // package.json
        readFile(`${ projectPath }/package.json`, "utf8")
            .then((data) => {
                const packageJson = JSON.parse(data);
                console.log("packageJson", packageJson);
            });
        
        // ディレクトリの作成
        mkdir(`${ projectPath }/src/client`, { recursive: true }, (err) => {
            if (err) { throw err; }
            console.log('testディレクトリが作成されました');
        });
        mkdir(`${ projectPath }/src/server`, { recursive: true }, (err) => {
            if (err) { throw err; }
            console.log('testディレクトリが作成されました');
        });
        mkdir(`${ projectPath }/src/shared`, { recursive: true }, (err) => {
            if (err) { throw err; }
            console.log('testディレクトリが作成されました');
        });
    })
    .finally(() => rl.close());