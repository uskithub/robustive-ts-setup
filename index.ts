import * as prompts from "prompts";
import * as readline from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";
import { readdir } from "node:fs/promises";

prompts({
    type: "number"
    , name: "value" 
    , message: "Select a project:"
    , validate: (value: number) => value < 18 ? `Nightclub is 18+ only` : true
})
    .then((value: prompts.Answers<"value">) => {
        console.log(value);
    });
  

// const rl = readline.createInterface({ input, output });

// readdir("/Users/yusuke/Workspaces/", { withFileTypes : true })
//     .then((dirents) => {
//         dirents.forEach((dirent) => {
//             if (!dirent.isDirectory || dirent.name.startsWith(".")) return;
//             console.log(dirent.name);
//         });
//     });

// rl.question("Choose a project to setup?\n")
//     .then((answer) => {
//         console.log(`Thank you for your valuable feedback: ${answer}`);

//     })
//     .finally(() => rl.close());
