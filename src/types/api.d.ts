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
    static check(domain: string): Promise<boolean>;
    /**
     * Create order the domain and tld.
     *
     * @param domain  Domain name without TLD
     * @param additionalTLD Additional TLDs
     * @returns Ordered domains
     */
    static createOrder(domain: string[], additionalTLD?: string[]): string[];
}
