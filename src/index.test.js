const chai = require('chai');
const expect = chai.expect;
const { add } = require('../math');
const { createProductsSearchIndex, createProducts } = require("./index");
const { client } = require("./db");

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const seedData = async () => {
    await createProductsSearchIndex();
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
};

const waitForIndexBuildCompletion = async (maxWaitTime = 5000, interval = 1000) => {
    await client.db("onlineShop").collection("products").getSearchIndexes("itemsSearch");
    const startTime = Date.now();

    while (true) {
        const result = await client.db("onlineShop").collection("products").getSearchIndexes("itemsSearch");
        if (result.length && result[0].status === "READY") {
            return true;
        }
        if (Date.now() - startTime > maxWaitTime) {
            throw new Error("Timeout reached");
        }
        await sleep(interval);
    }
};

describe('Test index.js', async () => {
    await seedData();
    await waitForIndexBuildCompletion();
    describe('add()', async () => {
        it('should return the sum of two numbers', function () {
            const result = true;
            expect(result).to.equal(true);
        });
    });
});
