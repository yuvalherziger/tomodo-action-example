import { client } from "./db.mjs";

export async function createProductsSearchIndex() {
    try {
        await client.db("onlineShop").collection("products").dropSearchIndex("itemsSearch");
    } catch (e) {
        console.log(e);
    }
    
    const definition = {
        mappings: {
            dynamic: false,
            fields: {
                department: [
                    { type: "string" },
                    { type: "stringFacet" }
                ],
                name: [
                    { type: "string" },
                ],
                unitType: [
                    { type: "token" },
                    { type: "stringFacet" }
                ],
                unitPrice: [
                    { type: "number" },
                ]
            }
        }
    };
    const searchIndex = {
        definition,
        type: "search",
        name: "itemsSearch"
    };
    const res = await client.db("onlineShop").collection("products").createSearchIndex(searchIndex);
}

export async function createProducts(products) {
    const res = await client.db("onlineShop").collection("products").insertMany(products);
    return res;
}

export async function getFilterFacets(products) {
    const pipeline = [{
        $searchMeta: {
            index: "itemsSearch",
            facet: {
                facets: {
                    departments: { type: "string", path: "department" },
                    unitTypes: { type: "string", path: "unitType" },
                }
            }

        }
    }];
    const cursor = client.db("onlineShop").collection("products").aggregate(pipeline);
    const res = [];
    for await (const doc of cursor) {
        res.push(doc);
    }
    return res;
}

export async function searchProductsByName(query) {
    const pipeline = [{
        $search: {
            index: "itemsSearch",
            text: {
                path: "name",
                query
            }
        }
    }];
    const cursor = client.db("onlineShop").collection("products").aggregate(pipeline);
    const res = [];
    for await (const doc of cursor) {
        res.push(doc);
    }
    return res;
}
