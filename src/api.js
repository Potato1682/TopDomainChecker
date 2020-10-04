import https from "https"
import ping from "ping"

export default class API {
    /**
     *
     * @param domain {string}
     * @returns {Promise<boolean>}
     */
    static check(domain) {
        return ping.promise.probe(domain).then(response => response.alive)
    }

    /**
     * Create order the domain and tld.
     * @param domain {string[]} Domain name without TLD
     * @param additionalTLD {string[]} Additional TLDs
     * @returns {string[]} Ordered domains
     */
    static createOrder(domain, additionalTLD = [""]) {
        let order = []
        let TLD = []

        let lockFlag = false

        https.get("https://data.iana.org/TLD/tlds-alpha-by-domain.txt", (response) => {
            response.on("data", (chunk) => {
                if (!lockFlag)
                    TLD = [
                        ...(`${chunk}`
                            .toLowerCase()
                            .split(/\r\n|\n/)
                            .filter(tld => !tld.startsWith("#") || !tld)),
                        ...additionalTLD
                    ]
                else
                    lockFlag = true
            })
        }).on("error", (error) => {
            throw error
        })

        domain.forEach(d => TLD.map(t => `${d}.${t}`).forEach(uri => order.push(uri)))

        return order
    }
}
