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

    test("Server alive validation in HTTP", async () => {
        const expected = await TLDCheck.check("p2p-dev.team", "http");
        const expectInstanced = await new TLDCheck("http").check("p2p-dev.team");

        expect(expected);
        expect(expectInstanced);
    });

    test("Server alive validation in HTTPS", async () => {
        const expected = await TLDCheck.check("p2p-dev.team", "https");
        const expectInstanced = await new TLDCheck("https").check("p2p-dev.team");

        expect(expected);
        expect(expectInstanced);
    });
});
