import https from "https";
import {promise} from "ping";

/**
 * TopDomainChecker API.
 */
export default class TLDCheck {
    /**
     * Check single domain.
     * This requires await.
     *
     * @param domain The domain
     * @returns Pinging promise
     */
    static async check(domain: string): Promise<boolean> {
        const response = await promise.probe(domain);

        return response.alive;
    }

    /**
     * Create order the domain and tld.
     *
     * @param domain  Domain name without TLD
     * @param additionalTLD Additional TLDs
     * @returns Ordered domains
     */
    static createOrder(
        domain: string[],
        additionalTLD: string[] = [""]
    ): string[] {
        const order: string[] = [];
        let TLD: string[] = [];

        let lockFlag = false;

        https
            .get(
                "https://data.iana.org/TLD/tlds-alpha-by-domain.txt",
                (response) => {
                    response.on("data", (chunk) => {
                        if (!lockFlag) {
                            TLD = [
                                ...`${chunk}`
                                    .toLowerCase()
                                    .split(/\r\n|\n/)
                                    .filter(tld => !tld.startsWith("#") || !tld),
                                ...additionalTLD
                            ];
                        } else {
                            lockFlag = true;
                        }
                    });
                }
            )
            .on("error", (error) => {
                throw error;
            });

        domain.forEach(d => TLD.map(t => `${d}.${t}`).forEach(uri => order.push(uri)));

        return order;
    }
}
