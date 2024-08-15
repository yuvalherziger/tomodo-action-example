const chai = require('chai');
const expect = chai.expect;
const { add } = require('../math');
const { createProductsSearchIndex, createProducts } = require("./index");


const seedData = async () => {
    await createProductsSearchIndex();
    await createProducts([

    ]);
};


describe('Test index.js', async () => {

    describe('add()', async () => {
        it('should return the sum of two numbers', function () {
            const result = add(2, 3);
            expect(result).to.equal(5);
        });

        it('should return a negative number when adding a negative number', async () => {
            const result = add(-2, 3);
            expect(result).to.equal(1);
        });
    });
});
