import TLDCheck from "../src/api";

describe("Order validation", () => {
    test("Order creation with additional top-level domains", async () => {
        const expected = await TLDCheck.createOrder([ "potato1682" ], [ "onion" ]);

        expect(expected).toEqual(expect.arrayContaining([ "potato1682.onion" ]));
    });

    test("Order creation with no duplicate top-level domains", async () => {
        const expected = await TLDCheck.createOrder([ "potato1682" ], [ "com" ]);

        expect(expected.length).toBe(new Set(expected).size);
    });

    test("Early return with blank value", async () => {
        const expected = [ ...(await TLDCheck.createOrder([ "" ])), ...(await TLDCheck.createOrder([])) ];

        expect(expected).toStrictEqual([]);
    });

    test("Reject and throw an error with invalid domains and top-level domains", async () => {
        await expect(TLDCheck.createOrder([ "." ], [ " " ])).rejects.toThrow("Invalid domain and top-level domain value.");
        await expect(TLDCheck.createOrder([ ".", " " ], [ " " ])).rejects.toThrow("Invalid domains and top-level domain value.");
        await expect(TLDCheck.createOrder([ "." ], [ " ", "." ])).rejects.toThrow("Invalid domain and top-level domains value.");
        await expect(TLDCheck.createOrder([ " ", "." ], [ ".", " " ])).rejects.toThrow("Invalid domains and top-level domains value.");
    });
});

describe("Server alive validation in each protocol", () => {
    test("Server alive validation in ICMP echo request", async () => {
        const expected = await TLDCheck.check("google.com");
        const expectInstanced = await new TLDCheck().check("google.com");

        expect(expected);
        expect(expectInstanced);
    });

    test("Server alive validation fails in ICMP echo request", async () => {
        const expected = await TLDCheck.check("v38j57g9827fv98v79287htxc782ig87w6hdvb3k50979v8672y8h6t76f24tg3k039vb830h987j68732d6h18x5.com");
        const expectedInstanced = await new TLDCheck().check("v38j57g9827fv98v79287htxc782ig87w6hdvb3k50979v8672y8h6t76f24tg3k039vb830h987j68732d6h18x5.com");

        expect(expected).toBeFalsy();
        await expect(expectedInstanced).toBeFalsy();
    });

    test("Server alive validation in HTTP", async () => {
        const expected = await TLDCheck.check("p2p-dev.team", "http");
        const expectInstanced = await new TLDCheck("http").check("bing.com");

        expect(expected);
        expect(expectInstanced);
    });

    test("Server alive validation fails in HTTP", async () => {
        await expect(TLDCheck.check("potato1682.ml/that/is/unavailable/link", "http")).rejects.toThrow("HTTP Request Failed.");
        await expect(new TLDCheck("http").check("potato1682.ml/that/is/unavailable/link")).rejects.toThrow("HTTP Request Failed.");
        await expect(TLDCheck.check("v38j57g9827fv98v79287htxc782ig87w6hdvb3k50979v8672y8h6t76f24tg3k039vb830h987j68732d6h18x5.com", "http")).rejects.toThrow();
        await expect(new TLDCheck("http").check("v38j57g9827fv98v79287htxc782ig87w6hdvb3k50979v8672y8h6t76f24tg3k039vb830h987j68732d6h18x5.com")).rejects.toThrow();
    });

    test("Server alive validation in HTTPS", async () => {
        const expected = await TLDCheck.check("p2p-dev.team", "https");
        const expectInstanced = await new TLDCheck("https").check("bing.com");

        expect(expected);
        expect(expectInstanced);
    });

    test("Server alive validation fails in HTTPS", async () => {
        await expect(TLDCheck.check("potato1682.ml/that/is/unavailable/link", "https")).rejects.toThrow("HTTPS Request Failed.");
        await expect(new TLDCheck("https").check("potato1682.ml/that/is/unavailable/link")).rejects.toThrow("HTTPS Request Failed.");
        await expect(TLDCheck.check("v38j57g9827fv98v79287htxc782ig87w6hdvb3k50979v8672y8h6t76f24tg3k039vb830h987j68732d6h18x5.com", "https")).rejects.toThrow();
        await expect(new TLDCheck("https").check("v38j57g9827fv98v79287htxc782ig87w6hdvb3k50979v8672y8h6t76f24tg3k039vb830h987j68732d6h18x5.com")).rejects.toThrow();
    });
});
