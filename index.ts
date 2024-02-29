import * as dotenv from "dotenv";
import * as prompts from "prompts";
import { exit } from "node:process";
import { access, constants, copyFile, readFile, readdir, rename, writeFile } from "node:fs/promises";
import { mkdir } from "node:fs";
import { execSync } from "node:child_process";
import { parse } from "jsonc-parser";

dotenv.config();

const path = process.env.WORKSPACE_PATH;

if (path === undefined) {
    console.error("WORKSPACE_PATH is not defined.");
    exit(1);
}

readdir(path, { withFileTypes : true })
    .then((dirents) => {
        return dirents.filter(d => d.isDirectory() && !d.name.startsWith("."))
            .map(d => ({ title: d.name, value: d.name }));
    })
    .then((choices: prompts.Choice[]) => {
        // プロジェクトの選択
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

        // Dependencies の追加
        return readFile("./template/package.json", "utf8")
            .then((data) => {
                const { dependencies, devDependencies }: { dependencies: string[], devDependencies: string[] } = parse(data);
                execSync(`cd ${ projectPath } && yarn add ${ dependencies.join(" ") } && yarn add -D ${ devDependencies.join(" ") }`, { stdio: "inherit" });
                return projectPath;
            });
    })
    .then((projectPath: string) => {
        // ディレクトリの作成
        return readFile("./template/directory.json", "utf8")
            .then((data) => {
                const directories: string[] = parse(data);
                directories.forEach((directory) => {
                    mkdir(`${ projectPath }/${ directory }`, { recursive: true }, (err) => {
                        if (err) console.error(`${ directory } の作成に失敗しました。`);
                        else console.log(`created: ${ projectPath }/${ directory }`);
                    });
                });
                return projectPath; 
            });
    })
    .then((projectPath: string) => {
        // tsconfigへの項目追加
        return readFile("./template/tsconfig.json", "utf8")
            .then((data) => {
                const template = parse(data);
                return readFile(`${ projectPath }/tsconfig.json`, "utf8")
                    .then((data) => {
                        const tsconfig = parse(data);
                        return copyFile(`${ projectPath }/tsconfig.json`, `${ projectPath }/tsconfig.json.bak`)
                            .then(() => {
                                return writeFile(`${ projectPath }/tsconfig.json`, JSON.stringify(Object.assign(tsconfig, template), null, 2));
                            });
                    });
            })
            .then(() => {
                // 既存ファイルの移動
                return readFile("./template/move.json", "utf8")
                    .then((data) => {
                        const templates: { source: string; destination: string; }[] = parse(data);
                        templates.forEach((template) => {
                            return access(`${ projectPath }/${ template.source }`, constants.F_OK)
                                .then(() => {
                                    return rename(`${ projectPath }/${ template.source }`, `${ projectPath }/${ template.destination }`)
                                })
                                .then(() => {
                                    console.log(`moved: ${ template.source } ---> ${ template.destination }`);
                                })
                                .catch((err) => {
                                    if (err.code === "ENOENT") {
                                        console.log(`not found: ${ template.source }`)
                                    }
                                    if (err.code === "EPERM") {
                                        console.log(`permission denied: ${ template.source }`)
                                    }
                                });
                        });
                        return projectPath; 
                    });
            })
            .then(() => {
                // テンプレートのコピー
                return readFile("./template/copy.json", "utf8")
                    .then((data) => {
                        const templates: { source: string; destination: string; }[] = parse(data);
                        templates.forEach((template) => {
                            return copyFile(template.source, `${ projectPath }/${ template.destination }`)
                                .then(() => {
                                    console.log(`copied: ${ projectPath }/${ template.destination }`);
                                });
                        });
                        return projectPath; 
                    });
            });
    });