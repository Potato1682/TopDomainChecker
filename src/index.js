import https from "https"
import readline from "readline"
import getStdin from "get-stdin"
import boxen from "boxen"
import chalk from "chalk"
import cliCursor from "cli-cursor"
import ncp from "copy-paste"
import commandLineArgs from "command-line-args"
import commandLineUsage from "command-line-usage"
import figures from "figures"
import inquirer from "inquirer"
import ping from "ping"
import prettyerror from "pretty-error"
import terminalLink from "terminal-link"

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
                alias: "d",
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
    { name: "add-tld", alias: "t" }
])

if (arguments_.version) {
    console.log("v2.0.0")
    process.exit()
}

if (arguments_.help) {
    // Show usages if has argument "--help"
    console.log(usage)
    process.exit()
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
let stdin;

(async () => stdin = await getStdin())()

if (stdin)
    arguments_.domain = [ ...arguments_.domain, ...stdin.trim().split(" ") ]
// If stdin has an input, merge domains

// If also not, show cursor and interactive prompt
if (!("domain" in arguments_)) {
    cliCursor.show()
    const domainAnswer = (async () => await inquirer.prompt({
        type: "input",
        name: "domain",
        message: "Which domain do you want to check (can split the spaces):"
    }))().then(ans => ans)

    cliCursor.hide()
    arguments_.domain = [...domainAnswer.domain.split(" ")]
}

const addTld = []

if (arguments_["add-tld"] === null) {
    cliCursor.show()
    const tldAnswer = (async () => await inquirer.prompt({
        type: "input",
        name: "tlds",
        message: "Which top-level domain do you want to check (can split the spaces):"
    }))().then(answer => answer)

    cliCursor.hide()
    addTld.push(...tldAnswer.tlds.split(" "))
}

// Ping
const gets = (domains) => {
    domains.forEach((domain) => {
        ping.promise.probe(domain)
            .then((response) => {
                if (response.alive) {
                    aliveDomain.push(domain)
                    if (!arguments_.quiet) {
                        process.stdout.write(`\n${chalk.greenBright.inverse(`  ${figures.tick}  `)}  ${chalk.bold.cyan(domain)} is ${chalk.greenBright("up")}` +
                            " ".repeat(process.stdout.columns - `\n${chalk.greenBright.inverse(`  ${figures.tick}  `)}  ${chalk.bold.cyan(domain)} is ${chalk.greenBright("up")}`.length))
                        if (!arguments_.verbose)
                            readline.moveCursor(process.stdout, 0, -1)
                        else
                            console.log()

                    }

                    return Promise.resolve()
                }

                if (!arguments_.quiet) {
                    process.stdout.write(`\n${chalk.redBright.inverse(`  ${figures.cross}  `)}  ${chalk.bold.cyan(domain)} is ${chalk.redBright("down")}` +
                        " ".repeat(process.stdout.columns - `\n${chalk.redBright.inverse(`  ${figures.cross}  `)}  ${chalk.bold.cyan(domain)} is ${chalk.redBright("down")}`.length))

                    if (!arguments_.verbose)
                        readline.moveCursor(process.stdout, 0, -1)
                    else
                        console.log()

                }

                return Promise.resolve()
            })
    })
}

const main = (tlds) => {
    const order = []

    console.log()
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
        arguments_.domain.forEach(d => (tld => tlds.map(`${d}.${tld}`)).forEach(uri => order.push(uri)))

    gets(order)

    setTimeout(() => {
        if (!arguments_["no-box"])
            console.log(boxen(`${chalk.bold.underline("--- Result---")}\n\n${chalk.bold.blueBright(aliveDomain.join("\n"))}\n\n${chalk.bold.cyanBright(aliveDomain.length)} ${chalk.greenBright(aliveDomain.length > 1 ? "domains alive" : "domain alive")}`, {
                padding: 1,
                borderColor: "yellow",
                margin: 2,
                align: "center"
            }))
        else
            console.log(aliveDomain.join("\n"))

    }, 10000)
}

let lockFlag = false

if (arguments_.verbose) console.log(`\n${chalk.greenBright(figures.pointer)} Fetching top-level domains information from IANA...`)

https.get("https://data.iana.org/TLD/tlds-alpha-by-domain.txt", (response) => {
    response.on("data", (chunk) => {
        if (!lockFlag)
            main([
                ...(`${chunk}`
                    .toLowerCase()
                    .split(/\r\n|\n/)
                    .filter(tld => !tld.startsWith("#") || !tld)),
                ...addTld
            ])
        else
            lockFlag = true
    })
}).on("error", (error) => {
    console.error(error)
    console.log(`${chalk.redBright(figures.pointer)} ${chalk.bold("Please report this issue to")} ${terminalLink("Github Issues", "https://github.com/P2P-Develop/TopDomainChecker/issues")}`)

    const copyAnswer = (async () => await inquirer.prompt({
        type: "confirm",
        name: "copy",
        message: "Copy stack-trace to clip board?"
    }))().then(answer => answer)

    if (copyAnswer)
        ncp.copy(error)
})
