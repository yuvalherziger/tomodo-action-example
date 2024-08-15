import { MongoClient }  from "mongodb";

const mongoDbUri = process.env.MONGODB_URI;

const appName = process.env["APP_NAME"] || "local-dev";

export const client = new MongoClient(mongoDbUri, { appName });
