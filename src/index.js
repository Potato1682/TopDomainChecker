import boxen from "boxen"
import chalk from "chalk"
import cliCursor from "cli-cursor"
import commandLineArgs from "command-line-args"
import commandLineUsage from "command-line-usage"
import figures from "figures"
import fs from "fs"
import https from "https"
import inquirer from "inquirer"
import ping from "ping"
import prettyerror from "pretty-error"
import terminalLink from "terminal-link"

// Call functions
prettyerror.start()
cliCursor.hide()

// Command usages and arguments
const usage = commandLineUsage([{
    header: "TopDomainChecker",
    content: "Brute-force the top-level domain with {italic parallel}."
},
{
    header: "Main Values",
    content: [{
        name: "{bold [stdin]}",
        summary: "Get the domain to search from the standard input. \n If the standard input does not find anything, you will be prompted with \n an argument or interactively."
    },
    {
        name: "{bold [domain]}",
        summary: "{underline TopDomainChecker prioritizes arguments over standard inputs}. \n If it missing, show the interactive prompt."
    }
    ]
},
{
    header: "Misc Options",
    optionList: [{
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
        type: Boolean
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
    }
    ]
},
{
    content: `Project home: ${terminalLink(
        "GitHub",
        "https://github.com/P2P-Develop/TopDomainChecker")}`
}
])

const args = commandLineArgs([
    { name: "verbose", alias: "v", type: Boolean },
    { name: "domain", type: String, multiple: true, defaultOption: true },
    { name: "help", alias: "h", type: Boolean },
    { name: "quiet", alias: "q", type: Boolean, defaultValue: false },
    { name: "no-box", alias: "Q", type: Boolean, defaultValue: false }
])
if (args.help) {
    // Show usages if has argument "--help"
    console.log(usage)
    process.exit(0)
}

// Ping -> OK domains
const aliveDomain = []

// Check stdin (no input -> undefined)
const input = () => {
    try {
        return fs.readFileSync(process.stdin.fd, "utf-8")
    } catch (e) {
        return undefined
    }
}

const stdin = input() // To immutable
if (stdin !== undefined)
    args.domain = [...args.domain, ...stdin.trim().split(" ")] // If stdin has an input, merge domains

// If also not, show cursor and interactive prompt
if (!("domain" in args)) {
    cliCursor.show()
    const tmp = await inquirer.prompt({
        type: "input",
        name: "domain",
        message: "Which domain do you want to check (can split the spaces):"
    }).then(ans => ans)
    cliCursor.hide()
    args.domain = [...tmp.domain.split(" ")]
}

// Ping
const gets = (domains) => {
    domains.forEach((domain) => {
        ping.promise.probe(domain, undefined)
            .then((res) => {
                if (res.alive) {
                    aliveDomain.push(domain)
                    if (!args.quiet)
                        console.log(
                            `${chalk.greenBright.inverse(
                                `  ${figures.tick}  `
                            )}  ${chalk.bold.cyan(domain)} is ${chalk.greenBright(
                                "up"
                            )}`
                        )
                    return Promise.resolve()
                }

                if (!args.quiet)
                    console.log(
                        `${chalk.redBright.inverse(
                            `  ${figures.cross}  `
                        )}  ${chalk.bold.cyan(domain)} is ${chalk.redBright(
                            "down"
                        )}`
                    )

                return Promise.resolve()
            })
    })
}

const main = (tlds) => {
    const order = []

    args.domain.forEach((d) => {
        tlds.map((tld) => `${d}.${tld}`).forEach((uri) => order.push(uri))
    })

    if (!args.quiet)
        console.log(`\n${chalk.bold.magenta(figures.pointer)} Processing ${chalk.bold.blueBright(order.length)} domains`)

    try {
        gets(order)
    } finally {
        setTimeout(() => {
            if (!args["no-box"])
                console.log(boxen(`${chalk.bold.underline("--- Result---")}\n\n${chalk.bold.blueBright(aliveDomain.join("\n"))}`, { padding: 1, borderColor: "yellow", margin: 2, align: "center" }))
            else
                console.log(aliveDomain.join("\n"))
        }, 10000)
    }
}

let flag = false

https
    .get("https://data.iana.org/TLD/tlds-alpha-by-domain.txt", (res) => {
        res.on("data", (chunk) => {
            if (!flag) {
                main(
                    `${chunk}`
                        .toLowerCase()
                        .split(/\r\n|\n/)
                        .filter((tld) => !tld.startsWith("#") || tld === "")
                )
            } else flag = true
        })
    })
    .on("error", e => {
        console.error(e)
    })