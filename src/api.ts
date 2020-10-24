import { promise } from "ping";
import got from "got";

/**
 * The TopDomainChecker API.
 */
export default class TLDCheck {
    /**
     * Checking protocol property.
     */
    protocol: "ping" | "http" | "https";

    /**
     * Constructor.
     * We recommend using static methods.
     *
     * @param protocol Checking protocol.
     */
    constructor(protocol: "ping" | "http" | "https" = "ping") {
        this.protocol = protocol;
    }

    /**
     * Check single domain in non-static class.
     * This requires await.
     *
     * @param domain The domain.
     *
     * @returns Pinging promise.
     */
    async check(domain: string): Promise<boolean> {
        return await TLDCheck.check(domain, this.protocol);
    }

    /**
     * Check single domain.
     * This requires await.
     *
     * @param domain The domain.
     * @param protocol Checking protocol.
     *
     * @returns Pinging promise.
     */
    static async check(domain: string, protocol: "ping" | "http" | "https" = "ping"): Promise<boolean> {
        switch (protocol) {
        case "ping":
            return (await promise.probe(domain)).alive;

        case "http":
            try {
                await got(`http://${domain}`);

                return true;
            } catch (error) {
                return Promise.reject(error);
            }

        case "https":
            try {
                await got(`https://${domain}`);

                return true;
            } catch (error) {
                return Promise.reject(error);
            }

        default:
            return Promise.reject(new Error("Invalid arguments"));
        }
    }

    /**
     * Create order the domain and tld.
     * This requires await.
     *
     * @param domain  Domain name without the top-level domain.
     * @param additionalTLD Additional top-level domains.
     *
     * @returns Ordered domains promise.
     */
    static async createOrder(
        domain: string[],
        additionalTLD: string[] = [""]
    ): Promise<string[]> {
        if (domain.join("").trim().length === 0) {
            return [];
        }

        if (domain.some(value => value.startsWith(".") || value.startsWith(" ")) ||
            additionalTLD.some(value => value.startsWith(".") || value.startsWith(" "))) {
            return Promise.reject(new Error(`Invalid domain${domain.length > 1 ? "s" : ""}${additionalTLD.join("") !== "" ? ` and top-level domain${additionalTLD.length > 1 ? "s" : ""}` : ""} value.`));
        }

        const order: string[] = [];
        let topLevelDomains: string[] = [];

        const response = await got("https://data.iana.org/TLD/tlds-alpha-by-domain.txt");

        topLevelDomains = [
            ...(response.body
                .toLowerCase()
                .split(/\r\n|\n/)
                .filter(tld => !tld.startsWith("#") || !tld)),
            ...additionalTLD
        ];

        domain.forEach(d => topLevelDomains.map(t => `${d}.${t}`).forEach(uri => order.push(uri)));

        return [...new Set(order)];
    }
}
