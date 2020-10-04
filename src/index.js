#!/usr/bin/env node

import https from "https"
import readline from "readline"
import Enquirer from "enquirer"
import getStdin from "get-stdin"
import boxen from "boxen"
import chalk from "chalk"
import cliCursor from "cli-cursor"
import ncp from "copy-paste"
import commandLineArgs from "command-line-args"
import commandLineUsage from "command-line-usage"
import figures from "figures"
import ora from "ora"
import prettyerror from "pretty-error"
import terminalLink from "terminal-link"
import API from "./api.js"

// Call console beautify functions
prettyerror.start()
cliCursor.hide()

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
                summary: "Get the domain to search from the standard input. \n If the standard input does not find anything, you will be prompted with \n an argument or interactively."
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
                description: "No ping notification is output, only the result is output.",
                type: Boolean,
                defaultValue: false
            },
            {
                name: "no-box",
                alias: "Q",
                description: "Checker don't use boxes to display results. Only successful domains and line breaks are displayed. \n Use this with {bold --quiet}, it can be easily integrated with other programs.",
                type: Boolean,
                defaultValue: false
            },
            {
                name: "add-tld",
                alias: "t",
                description: "Enter additional top-level domains separated by spaces. If you use only the flag, show interactive prompt."
            },
            {
                name: "domain",
                alias: "d",
                description: "{underline TopDomainChecker prioritizes arguments over standard inputs}. \n If it missing, show the interactive prompt. \n Also, {bold --domain} is specified as the default argument and is not required."
            }
        ]
    },
    {
        content: `Project home: ${terminalLink(
            "GitHub",
            "https://github.com/P2P-Develop/TopDomainChecker"
        )}`
    }
])

const arguments_ = commandLineArgs([
    { name: "version", alias: "V", type: Boolean, defaultValue: false },
    { name: "verbose", alias: "v", type: Boolean, defaultValue: false },
    { name: "domain", alias: "d", type: String, multiple: true, defaultOption: true },
    { name: "help", alias: "h", type: Boolean, defaultOption: false },
    { name: "quiet", alias: "q", type: Boolean, defaultValue: false },
    { name: "no-box", alias: "Q", type: Boolean, defaultValue: false },
    { name: "add-tld", alias: "t" },
    { name: "dry-run", alias: "D", type: Boolean, defaultValue: false }
])

if (arguments_.version) {
    console.log("v3.0.0")
    process.exit(0)
}

if (arguments_.help) {
    // Show usages if has argument "--help"
    console.log(usage)
    process.exit(0)
}

if (arguments_.quiet && arguments_.verbose) {
    // quiet and verbose cannot be used at the same time
    console.warn(`${chalk.yellowBright.inverse.bold(`  ${figures.warning}  `)} ${chalk.bold("--quiet")} and ${chalk.bold("--verbose")} cannot be used at same time! Replaced with default value!`)
    arguments_.quiet = false
    arguments_.verbose = false
}

// Ping -> OK domains
const aliveDomain = []

// Check stdin (no input -> empty)
const stdin = await getStdin()

if (stdin)
    arguments_.domain = [ ...arguments_.domain, ...stdin.trim().split(" ") ] // If stdin has an input, merge domains

// If also not, show cursor and interactive prompt
if (!("domain" in arguments_)) {
    cliCursor.show()

    const domainAnswer = await Enquirer.prompt({
        type: "list",
        name: "domains",
        message: "Which domain names do you want to check (comma-separated)"
    })

    arguments_.domain = [...domainAnswer.domains]
}

const addTld = []

if (arguments_["add-tld"] === null) {
    cliCursor.show()

    const tldAnswer = await Enquirer.prompt({
        type: "list",
        name: "tlds",
        message: "Which top-level domains do you want to check (comma-separated)"
    })

    addTld.push(...tldAnswer.tlds)
}

const main = (tlds) => {
    cliCursor.hide()

    const order = []

    if (arguments_["dry-run"]) {
        arguments_.domain.forEach(d => tlds.map(tld => `${d}.${tld}`).forEach(uri => order.push(uri)))
        console.log(arguments_.verbose
            ? `${chalk.bold.blue(figures.info)} Checker will be check the operating status of ${chalk.blueBright(tlds.length)} top-level domains * ${arguments_.domain.length} domain names`
            : `${chalk.bold.blue(figures.info)} Checker will be check the operating status of ${chalk.blueBright(order.length)} domain${order.length > 1 ? "s" : ""}`)

        process.exit(0)
    }

    if (arguments_.verbose) {
        let domainCount = 1
        let tldCount = 0

        arguments_.domain.forEach((d) => {
            tlds.map(tld => `${d}.${tld}`).forEach((uri) => {
                order.push(uri)
                process.stdout.write(`\n${chalk.bold.magenta(figures.pointer)} Adding ${chalk.blueBright(++tldCount)} top-level domains to ${chalk.blueBright(domainCount)} domain names`)
                readline.moveCursor(process.stdout, 0, -1)
            })

            if (arguments_.domain.length > 1 && arguments_.domain.length !== domainCount) {
                process.stdout.write(`\n${chalk.bold.magenta(figures.pointer)} Adding ${chalk.blueBright(tldCount)} top-level domains to ${chalk.blueBright(++domainCount)} domain names`)
                readline.moveCursor(process.stdout, 0, -4)
            }

            readline.moveCursor(process.stdout, 0, 3)
        })
    } else if (!arguments_.quiet) {
        arguments_.domain.forEach(d => tlds.map(tld => `${d}.${tld}`).forEach((uri, i) => {
            order.push(uri)
            process.stdout.write(`\n${chalk.bold.magenta(figures.pointer)} Adding ${chalk.bold.blueBright(i + 1)} domains`)
            readline.moveCursor(process.stdout, 0, -1)
        }))

        console.log("\n\n")
    } else
        arguments_.domain.forEach(d => tlds.map(tld => `${d}.${tld}`).forEach(uri => order.push(uri)))

    Promise.all(order.map(async (domain) => {
        if (await API.check(domain)) {
            aliveDomain.push(domain)
            if (!arguments_.quiet) {
                process.stdout.write(`\n${chalk.greenBright.inverse(`  ${figures.tick}  `)}  ${chalk.bold.cyan(domain)} is ${chalk.greenBright("up")}` +
                    " ".repeat(process.stdout.columns - `\n${chalk.greenBright.inverse(`  ${figures.tick}  `)}  ${chalk.bold.cyan(domain)} is ${chalk.greenBright("up")}`.length))
                if (!arguments_.verbose)
                    readline.moveCursor(process.stdout, 0, -1)
                else
                    console.log()

                return
            }
        }

        if (!arguments_.quiet) {
            process.stdout.write(`\n${chalk.redBright.inverse(`  ${figures.cross}  `)}  ${chalk.bold.cyan(domain)} is ${chalk.redBright("down")}` +
                " ".repeat(process.stdout.columns - `\n${chalk.redBright.inverse(`  ${figures.cross}  `)}  ${chalk.bold.cyan(domain)} is ${chalk.redBright("down")}`.length))

            if (arguments_.verbose)
                console.log()
            else
                readline.moveCursor(process.stdout, 0, -1)
        }
    })).then(() => {
        if (!arguments_["no-box"])
            console.log(boxen(`${chalk.bold.underline("--- Result---")}\n\n${chalk.bold.blueBright(aliveDomain.join("\n"))}\n\n${arguments_.verbose ? `${chalk.bold.magentaBright(order.length)} ${chalk.bold("/")} ${chalk.bold.cyanBright(aliveDomain.length)}` : chalk.bold.cyanBright(aliveDomain.length)} ${chalk.greenBright(aliveDomain.length > 1 ? "domains alive" : "domain alive")}`, {
                padding: 1,
                borderColor: "yellow",
                margin: 2,
                align: "center",
                borderStyle: "round"
            }))
        else
            process.stdout.write(aliveDomain.join("\n"))
    })
}

let lockFlag = false

const spinner = arguments_.verbose ? ora("Fetching top-level domains information from IANA...") : undefined

if (spinner) spinner.start()

https.get("https://data.iana.org/TLD/tlds-alpha-by-domain.txt", (response) => {
    response.on("data", (chunk) => {
        if (!lockFlag) {
            if (spinner) spinner.succeed()

            main([
                ...(`${chunk}`
                    .toLowerCase()
                    .split(/\r\n|\n/)
                    .filter(tld => !tld.startsWith("#") || !tld)),
                ...addTld
            ])
        } else
            lockFlag = true
    })
}).on("error", (error) => {
    (async () => {
        console.error(error)
        console.log(`${chalk.redBright(figures.pointer)} ${chalk.bold("Please report this issue to")} ${terminalLink("Github Issues", "https://github.com/P2P-Develop/TopDomainChecker/issues")}`)

        const copyAnswer = await Enquirer.prompt({
            type: "confirm",
            name: "cp",
            message: "Copy stack-trace to clip board?"
        })

        if (copyAnswer.cp)
            ncp.copy(error)
    })()
})
