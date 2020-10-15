"use strict"

import https from "https"
import ping from "ping"

/**
 * TopDomainChecker API Class.
 */
export default class TLDCheck {
    /**
     * Check single domain.
     * This required await.
     *
     * @param domain {string} The domain
     * @returns {Promise<boolean>} Pinging promise
     */
    static async check(domain) {
        const response = await ping.promise.probe(domain)
        return response.alive
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
