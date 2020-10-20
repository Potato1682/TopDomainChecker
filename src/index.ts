import https from "https"
import readline from "readline"
import Enquirer from "enquirer"
import getStdin from "get-stdin"
import boxen, { BorderStyle } from "boxen"
import chalk from "chalk"
import * as cliCursor from "cli-cursor"
import ncp from "copy-paste"
import commandLineArgs from "command-line-args"
import commandLineUsage from "command-line-usage"
import figures from "figures"
import ora from "ora"
import prettyError from "pretty-error"
import terminalLink from "terminal-link"
import TLDCheck from "./api"

prettyError.start();
cliCursor.hide();

// Command usages and arguments
const usage = commandLineUsage([
    {
        header: "TopDomainChecker",
        content: "Brute-force the top-level domain with {italic parallel}."
    },
    {
        header: "Main Values",
        content: [
            {
                name: "{bold [stdin]}",
                summary:
                    "Get the domain to search from the standard input. \n If the standard input does not find anything, you will be prompted with \n an argument or interactively."
            }
        ]
    },
    {
        header: "Misc Options",
        optionList: [
            {
                name: "version",
                alias: "V",
                description: "Show checker version.",
                type: Boolean,
                defaultValue: false
            },
            {
                name: "verbose",
                alias: "v",
                description: "Enable verbose logging.",
                type: Boolean,
                defaultValue: false
            },
            {
                name: "help",
                alias: "h",
                description: "Print this usage guide.",
                type: Boolean,
                defaultValue: false
            },
            {
                name: "dry-run",
                alias: "D",
                description: "Show how many domains to check.",
                type: Boolean,
                defaultValue: false
            },
            {
                name: "quiet",
                alias: "q",
                description:
                    "No ping notification is output, only the result is output.",
                type: Boolean,
                defaultValue: false
            },
            {
                name: "no-box",
                alias: "Q",
                description:
                    "Checker don't use boxes to display results. Only successful domains and line breaks are displayed. \n Use this with {bold --quiet}, it can be easily integrated with other programs.",
                type: Boolean,
                defaultValue: false
            },
            {
                name: "add-tld",
                alias: "t",
                description:
                    "Enter additional top-level domains separated by spaces. If you use only the flag, show interactive prompt."
            },
            {
                name: "domain",
                alias: "d",
                description:
                    "{underline TopDomainChecker prioritizes arguments over standard inputs}. \n If it missing, show the interactive prompt. \n Also, {bold --domain} is specified as the default argument and is not required."
            }
        ]
    },
    {
        content: `Project home: ${terminalLink(
            "GitHub",
            "https://github.com/P2P-Develop/TopDomainChecker"
        )}`
    }
]);

// Arguments cast interface
type arguments = {
    version: boolean,
    verbose: boolean,
    domain: string[],
    help: boolean,
    quiet: boolean,
    "no-box": boolean,
    "add-tld": string[],
    "dry-run": boolean
}

const arguments_ = commandLineArgs([
    { name: "version", alias: "V", type: Boolean, defaultValue: false },
    { name: "verbose", alias: "v", type: Boolean, defaultValue: false },
    {
        name: "domain",
        alias: "d",
        type: String,
        multiple: true,
        defaultOption: true,
        defaultValue: [""]
    },
    { name: "help", alias: "h", type: Boolean, defaultValue: false },
    { name: "quiet", alias: "q", type: Boolean, defaultValue: false },
    { name: "no-box", alias: "Q", type: Boolean, defaultValue: false },
    { name: "add-tld", alias: "t", type: String, defaultValue: [""], multiple: true },
    { name: "dry-run", alias: "D", type: Boolean, defaultValue: false }
]) as arguments;

if (arguments_.version) {
    console.log("v3.1.1");
    console.log(arguments_);
    process.exit(0);
}

if (arguments_.help) {
    // Show usages if has argument "--help"
    console.log(usage);
    process.exit(0);
}

if (!arguments_["dry-run"] && arguments_.quiet && arguments_.verbose) {
    // quiet and verbose cannot be used at the same time without --dry-run
    console.warn(`${chalk.yellowBright.inverse.bold(`  ${figures.warning}  `)} ${chalk.bold("--quiet")} and ${chalk.bold("--verbose")} cannot be used at same time! Replaced with default value!`);
    [ arguments_.quiet, arguments_.verbose ] = [ false, false ];
}

const addTld = [ "co.jp", "or,jp", "ne.jp", "ac.jp", "ad.jp", "ed.jp", "go.jp", "gr.jp", "lg.jp" ];

const requestGet = () => {
    let lockFlag = false;

    const spinner = arguments_.verbose ? ora("Fetching top-level domains information from IANA...") : undefined;

    if (spinner) {
        spinner.start();
    }

    https.get("https://data.iana.org/TLD/tlds-alpha-by-domain.txt", (response) => {
        response.on("data", (chunk) => {
            if (!lockFlag) {
                if (spinner) {
                    spinner.succeed(`Fetching top-level domains information from IANA...${chalk.greenBright("Success")}`);
                }

                main([
                    ...(`${chunk}`
                        .toLowerCase()
                        .split(/\r\n|\n|\r/)
                        .filter(tld => !tld.startsWith("#") || !tld)),
                    ...addTld
                ]);
            } else {
                lockFlag = true;
            }
        });
    }).on("error", (error) => {
        (async () => {
            if (spinner) {
                spinner.fail(`Fetching top-level domains information from IANA...${chalk.redBright("Failed")}`);
            }

            console.error(error);
            console.log(`${chalk.redBright(figures.pointer)} ${chalk.bold("Please report this issue to")} ${terminalLink("Github Issues", "https://github.com/P2P-Develop/TopDomainChecker/issues")}`);

            let copyAnswer = { cp: false };

            copyAnswer = await Enquirer.prompt({
                type: "confirm",
                name: "cp",
                message: "Copy stack-trace to clip board?"
            });

            if (copyAnswer.cp) {
                ncp.copy(error);
            }
        })();
    });
};

// Ping -> OK domains
const aliveDomain = [""];

// Check stdin (no input -> empty)
let stdin = "";

(async () => {
    stdin = await getStdin();
})();

if (stdin !== "") {
    arguments_.domain = [ ...arguments_.domain ?? [], ...stdin.trim().split(" ") ];
} // If stdin has an input, merge domains

(async () => {
    // If also not, show cursor and interactive prompt
    if (!("" in arguments_.domain)) {

        cliCursor.show();

        let domainAnswer = { domains: [""] };

        domainAnswer = await Enquirer.prompt({
            type: "list",
            name: "domains",
            message: "Which domain names do you want to check (comma-separated)"
        });

        arguments_.domain = [...domainAnswer.domains];
    }

    if (arguments_["add-tld"] === null) {
        cliCursor.show();

        let tldAnswer = { tlds: [""] };

        tldAnswer = await Enquirer.prompt({
            type: "list",
            name: "tlds",
            message: "Which top-level domains do you want to check (comma-separated)"
        });

        addTld.push(...tldAnswer.tlds);
    }

    requestGet();

})();

const main = (tlds: string[]) => {
    cliCursor.hide();

    const order: string[] = [];

    if (arguments_["dry-run"]) {
        arguments_.domain.forEach((d: string) => tlds.map(tld => `${d}.${tld}`).forEach(uri => order.push(uri)));

        if (arguments_.quiet) {
            console.log(arguments_.verbose
                ? `${tlds.length} * ${arguments_.domain.length}`
                : `${order.length}`);

            process.exit(0);
        }

        console.log(arguments_.verbose
            ? `${chalk.bold.blue(figures.info)} Checker will be check the operating status of ${chalk.blueBright(tlds.length)} top-level domains in ${chalk.blueBright(arguments_.domain.length)} domain name${arguments_.domain.length > 1 ? "s" : ""}`
            : `${chalk.bold.blue(figures.info)} Checker will be check the operating status of ${chalk.blueBright(order.length)} domain${order.length > 1 ? "s" : ""}`);

        process.exit(0);
    }

    if (arguments_.verbose) {
        let domainCount = 1;
        let tldCount = 0;

        arguments_.domain.forEach((d: string) => {
            tlds.map(tld => `${d}.${tld}`).forEach((uri) => {
                order.push(uri);
                process.stdout.write(`\n${chalk.bold.magenta(figures.pointer)} Adding ${chalk.blueBright(++tldCount)} top-level domains to ${chalk.blueBright(domainCount)} domain names`);
                readline.moveCursor(process.stdout, 0, -1);
            });

            if (arguments_.domain.length > 1 && arguments_.domain.length !== domainCount) {
                process.stdout.write(`\n${chalk.bold.magenta(figures.pointer)} Adding ${chalk.blueBright(tldCount)} top-level domains to ${chalk.blueBright(++domainCount)} domain names`);
                readline.moveCursor(process.stdout, 0, -4);
            }

            readline.moveCursor(process.stdout, 0, 3);
        });
    } else if (!arguments_.quiet) {
        let count = 0;

        arguments_.domain.forEach((d: string) => tlds.map(tld => `${d}.${tld}`).forEach((uri) => {
            order.push(uri);
            process.stdout.write(`\n${chalk.bold.magenta(figures.pointer)} Adding ${chalk.bold.blueBright(++count)} domains`);
            readline.moveCursor(process.stdout, 0, -1);
        }));

        console.log("\n\n");
    } else {
        arguments_.domain.forEach((d: string) => tlds.map(tld => `${d}.${tld}`).forEach(uri => order.push(uri)));
    }

    Promise.all(order.map(async (domain) => {
        if (await TLDCheck.check(domain)) {
            aliveDomain.push(domain);
            if (!arguments_.quiet) {
                process.stdout.write(`\n${chalk.greenBright.inverse(`  ${figures.tick}  `)}  ${chalk.bold.cyan(domain)} is ${chalk.greenBright("up")}` +
                    " ".repeat(process.stdout.columns - `\n${chalk.greenBright.inverse(`  ${figures.tick}  `)}  ${chalk.bold.cyan(domain)} is ${chalk.greenBright("up")}`.length));
                if (!arguments_.verbose) {
                    readline.moveCursor(process.stdout, 0, -1);
                } else {
                    console.log();
                }

                return;
            }
        }

        if (!arguments_.quiet) {
            process.stdout.write(`\n${chalk.redBright.inverse(`  ${figures.cross}  `)}  ${chalk.bold.cyan(domain)} is ${chalk.redBright("down")}` +
                " ".repeat(process.stdout.columns - `\n${chalk.redBright.inverse(`  ${figures.cross}  `)}  ${chalk.bold.cyan(domain)} is ${chalk.redBright("down")}`.length));

            if (arguments_.verbose) {
                console.log();
            } else {
                readline.moveCursor(process.stdout, 0, -1);
            }
        }
    })).then(() => {
        if (!arguments_["no-box"]) {
            console.log(boxen(`${chalk.bold.underline("--- Result---")}\n\n${chalk.bold.blueBright(aliveDomain.join("\n"))}\n\n${arguments_.verbose ? `${chalk.bold.magentaBright(order.length)} ${chalk.bold("/")} ${chalk.bold.cyanBright(aliveDomain.length)}` : chalk.bold.cyanBright(aliveDomain.length)} ${chalk.greenBright(aliveDomain.length > 1 ? "domains alive" : "domain alive")}`, {
                padding: 1,
                borderColor: "yellow",
                margin: 2,
                align: "center",
                borderStyle: BorderStyle.Round
            }));
        } else {
            process.stdout.write(aliveDomain.join("\n"));
        }
    });
}
