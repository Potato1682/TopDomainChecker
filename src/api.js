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
}
