import { expect } from 'chai';
import { createProductsSearchIndex, createProducts, getFilterFacets, searchProductsByName } from "./index.mjs";
import { client } from "./db.mjs";

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

const seedData = async () => {
    await client.db("onlineShop").collection("products").drop();
    await createProducts([{
        department: "vegetables",
        name: "Cucumber",
        unitType: "kg",
        unitPrice: 10
    }, {
        department: "vegetables",
        name: "Tomato",
        unitType: "kg",
        unitPrice: 9.5
    }, {
        department: "fruit",
        name: "Banana",
        unitType: "unit",
        unitPrice: 2
    }, {
        department: "fruit",
        name: "Apple",
        unitType: "kg",
        unitPrice: 12
    }]);
    await createProductsSearchIndex();
};

const waitForIndexBuildCompletion = async (maxWaitTime = 5000, interval = 1000) => {
    const startTime = Date.now();
    while (true) {
        const result = await client.db("onlineShop").collection("products").listSearchIndexes().toArray();

        const indexes = result.filter(ix => ix.name === "itemsSearch");
        const index = indexes?.[0];
        if (index.status === "READY") {
            return true;
        }
        if (Date.now() - startTime > maxWaitTime) {
            throw new Error("Timeout reached");
        }
        await sleep(interval);
    }
};

describe('Test index.js', function () {
    before(async function () {
        await seedData();
        await waitForIndexBuildCompletion();
    });

    after(async function () {
        await client.close();
    });

    describe('getFilterFacets()', function () {
        let result;
        before(async function () {
            result = await getFilterFacets();
        });

        it('should return the expected facet buckets', function (done) {
            const { unitTypes, departments } = result?.[0].facet;
            expect(unitTypes.buckets.length).to.equal(2);
            expect(departments.buckets.length).to.equal(2);
            done();
        });
    });

    describe('searchProductsByName()', function () {
        let result;
        before(async function () {
            result = await searchProductsByName("apPlE");
        });

        it('should return the expected product', function (done) {
            expect(result.length).to.equal(1);
            expect(result?.[0].name).to.equal("Apple");
            done();
        });
    });
});
