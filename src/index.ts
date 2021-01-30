import path from "path";
import readline from "readline";
import boxen from "boxen";
import chalk from "chalk";
import cliCursor from "cli-cursor";
import cliTruncate from "cli-truncate";
import commandLineArgs from "command-line-args";
import commandLineUsage from "command-line-usage";
import ncp from "copy-paste";
import Enquirer from "enquirer";
import figures from "figures";
import getStdin from "get-stdin";
import ora from "ora";
import prettyError from "pretty-error";
import terminalLink from "terminal-link";
import i18n, { __ } from "i18n";
import __package from "../package.json";

import TLDCheck from "./api";

// Call beautify functions
prettyError.start();
cliCursor.hide();
i18n.configure({
    locales: [ "en", "ja" ],
    directory: path.join(__dirname, "locales"),
    defaultLocale: Intl.DateTimeFormat().resolvedOptions().locale === "ja-JP" ? "ja" : "en"
});

// Command usages and arguments
const usage_ = commandLineUsage([{
        header: "TopDomainChecker",
        content: __("Brute-force the top-level domain with {italic parallel}.")
    }, {
        header: __("Usage"),
        content: "$ tldcheck -[vVhqDp] [-t <Additional top-level domains...>] [-d] <Domains...>"
    }, {
        header: __("Main Values"),
        content: [{
            name: "{bold [stdin]}",
            summary:
            __("Get the domain to search from the standard input. \n If the standard input does not find anything, you will be prompted with \n an argument or interactively.")
        }]
    }, {
        header: __("Misc Options"),
        optionList: [{
            name: "version",
            alias: "V",
            description:
            __("Show checker version."),
            type: Boolean,
            defaultValue: false
        }, {
            name: "verbose",
            alias: "v",
            description:
            __("Enable verbose logging."),
            type: Boolean,
            defaultValue: false
        }, {
            name: "help",
            alias: "h",
            description:
            __("Print this usage guide."),
            type: Boolean,
            defaultValue: false
        }, {
            name: "dry-run",
            alias: "D",
            description:
            __("Show how many domains to check."),
            type: Boolean,
            defaultValue: false
        }, {
            name: "protocol",
            alias: "p",
            description:
            __("The protocol used for checking. If you use only the flag, show interactive prompt.")
        }, {
            name: "quiet",
            alias: "q",
            description:
            __("No notification is output, only the result is output."),
            type: Boolean,
            defaultValue: false
        }, {
            name: "no-box",
            alias: "Q",
            description:
            __("Checker don't use boxes to display results. Only successful domains and line breaks are displayed. \n Use this with {bold --quiet}, it can be easily integrated with other programs."),
            type: Boolean,
            defaultValue: false
        }, {
            name: "add-tld",
            alias: "t",
            description:
            __("Enter additional top-level domains separated by spaces. If you use only the flag, show interactive prompt.")
        }, {
            name: "domain",
            alias: "d",
            description:
            __("{underline TopDomainChecker prioritizes arguments over standard inputs}. \n If it missing, show the interactive prompt. \n Also, {bold --domain} is specified as the default argument and is not required.")
        }]
    }, {
        content: `${__("Project home:")} ${terminalLink(
            "GitHub",
            "https://github.com/P2P-Develop/TopDomainChecker"
        )}`
    }]), arguments_ = commandLineArgs([
        { name: "version", alias: "V", type: Boolean, defaultValue: false },
        { name: "verbose", alias: "v", type: Boolean, defaultValue: false },
        {
            name: "domain",
            alias: "d",
            type: String,
            multiple: true,
            defaultOption: true,
            defaultValue: ""
        },
        { name: "help", alias: "h", type: Boolean, defaultValue: false },
        { name: "quiet", alias: "q", type: Boolean, defaultValue: false },
        { name: "no-box", alias: "Q", type: Boolean, defaultValue: false },
        { name: "add-tld", alias: "t", type: String, multiple: true },
        { name: "protocol", alias: "p", type: String, defaultValue: "ping" },
        { name: "dry-run", alias: "D", type: Boolean, defaultValue: false }
    ]) as {
    version: boolean,
    verbose: boolean,
    domain: string[],
    help: boolean,
    quiet: boolean,
    "no-box": boolean,
    "add-tld": string[],
    protocol: "ping" | "http" | "https" | null,
    "dry-run": boolean
};

if (arguments_.version) {
    console.log(`v${__package.version}`);
    process.exit(0);
}

if (arguments_.help) {
    // Show usages if has argument "--help"
    console.log(usage_);
    process.exit(0);
}

if (!arguments_["dry-run"] && arguments_.quiet && arguments_.verbose) {
    // quiet and verbose cannot be used at the same time without --dry-run
    console.warn(`${chalk.yellowBright.inverse.bold(`  ${figures.warning}  `)} ${chalk.bold("--quiet")} ${__("and")} ${chalk.bold("--verbose")} ${__("cannot be used at same time! Replaced with default value!")}`);
    arguments_.quiet = false;
    arguments_.verbose = false;
}

// Ping -> OK domains
const aliveDomain: string[] = [];
const addTld = [ "co.jp", "or.jp", "ne.jp", "ac.jp", "ad.jp", "ed.jp", "go.jp", "gr.jp", "lg.jp" ];

(async () => {
    // Check stdin (no input -> empty)
    const stdin = await getStdin();

    if (stdin !== "") {
        arguments_.domain = [ ...arguments_.domain === null ? [] : arguments_.domain, ...stdin.trim().split(" ") ];
    } // If stdin has an input, merge domains

    // If also not, show cursor and interactive prompt
    if (!("" in arguments_.domain)) {
        cliCursor.show();

        const domainAnswer = await Enquirer.prompt({
            type: "list",
            name: "domains",
            message: __("What domain names do you want to check (comma-separated)")
        }) as { domains: string[] };

        arguments_.domain = [ ...domainAnswer.domains ];
    }

    if ("add-tld" in arguments_ && arguments_["add-tld"] === []) {
        cliCursor.show();

        const tldAnswer = await Enquirer.prompt({
            type: "list",
            name: "topLevelDomains",
            message: __("What top-level domains do you want to check (comma-separated)")
        }) as { topLevelDomains: string[] };

        addTld.push(...tldAnswer.topLevelDomains);
    }

    if (arguments_.protocol === null) {
        cliCursor.show();

        const protocolAnswer = await Enquirer.prompt({
            type: "select",
            name: "protocol",
            message: __("Which protocol do you use"),
            choices: [ "Ping", "HTTP", "HTTPS" ]
        }) as { protocol: "Ping" | "HTTP" | "HTTPS" };

        arguments_.protocol = protocolAnswer.protocol.toLowerCase() as "ping" | "http" | "https";
    }

    cliCursor.hide();

    let orderedDomains: string[];

    const spinner = arguments_.verbose ? ora(__("Fetching top-level domains information from IANA...")) : undefined;

    if (spinner) {
        spinner.start();
    }

    if (!arguments_.quiet) {
        try {
            orderedDomains = await TLDCheck.createOrder(arguments_.domain, addTld);

            if (spinner) {
                spinner.succeed(`${__("Fetching top-level domains information from IANA...")}${chalk.greenBright(__("Success"))}`);
            }
        } catch (error) {
            if (spinner) {
                spinner.fail(`${__("Fetching top-level domains information from IANA...")}${chalk.redBright(__("Failed"))}`);
            }

            console.error(error);
            console.log(`${chalk.redBright(figures.pointer)} ${chalk.bold(__("Please report this issue to"))} ${terminalLink("Github Issues", "https://github.com/P2P-Develop/TopDomainChecker/issues")}.`);

            const copyAnswer = await Enquirer.prompt({
                type: "confirm",
                name: "cp",
                message: __("Copy the stack-trace to clip board?")
            }) as { cp: boolean };

            if (copyAnswer.cp) {
                ncp.copy(error);
            }

            process.exit(1);
        }
    } else {
        orderedDomains = await TLDCheck.createOrder(arguments_.domain, addTld);
    }

    cliCursor.hide();

    if (arguments_["dry-run"]) {
        if (arguments_.quiet) {
            console.log(arguments_.verbose
                ? `${(await TLDCheck.fetchTLDs()).length} * ${arguments_.domain.length}`
                : `${orderedDomains.length}`);

            process.exit(0);
        }

        console.log(arguments_.verbose
            ? `${chalk.bold.blue(figures.info)} ${__("Checker will be check the operating status of")} ${chalk.blueBright((await TLDCheck.fetchTLDs()).length)} ${__("top-level domains in")} ${chalk.blueBright(arguments_.domain.length)} ${__(`domain name${arguments_.domain.length > 1 ? "s" : ""}`)}`
            : `${chalk.bold.blue(figures.info)} ${__("Checker will be check the operating status of")} ${chalk.blueBright(orderedDomains.length)} ${__("domains")}`);

        process.exit(0);
    }

    const resultFunction = () => {
        if (!arguments_["no-box"]) {
            console.log(boxen(`${chalk.bold.underline(__("--- Result---"))}\n\n${chalk.bold.blueBright(aliveDomain.join("\n"))}\n\n${arguments_.verbose ? `${chalk.bold.cyanBright(aliveDomain.length)} ${chalk.bold("/")} ${chalk.bold.magentaBright(orderedDomains.length)}` : chalk.bold.cyanBright(aliveDomain.length)} ${chalk.greenBright(aliveDomain.length > 1 ? __("domains alive") : __("domain alive"))}`, {
                padding: 1,
                borderColor: "yellow",
                margin: 2,
                align: "center",
                borderStyle: "round"
            }));
        } else {
            process.stdout.write(aliveDomain.join("\n"));
        }
    };

    process.on("SIGINT", () => {
        resultFunction();
        process.exit();
    });

    const printDomain = (domain: string) => {
        console.log();
        readline.clearLine(process.stdout, 0);
        process.stdout.write(cliTruncate(`${chalk.redBright.inverse(`  ${figures.cross}  `)}  ${chalk.bold.cyan(domain)} ${__("is")} ${chalk.redBright(__("down"))}`, process.stdout.columns));

        if (arguments_.verbose) {
            console.log();
        } else {
            readline.moveCursor(process.stdout, 0, -1);
            readline.cursorTo(process.stdout, 0);
        }
    };

    await Promise.all(orderedDomains.map(async (domain) => {
        try {
            if (await TLDCheck.check(domain, arguments_.protocol ?? "ping")) {
                aliveDomain.push(domain);
                if (!arguments_.quiet) {
                    printDomain(domain);

                    return;
                }
            }
        } catch {
            if (!arguments_.quiet) {
                printDomain(domain);
            }
        }
    }));

    resultFunction();
})().then();
