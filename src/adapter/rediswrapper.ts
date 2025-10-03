import { GET_INDEX, JSON_HEADERS, PING_REDIS, SEARCH_JSON, substitute, SUMMARIZE } from "../constants";

interface IndexableObject<T = string> {
    [key: string]: T;
}

function isSubset<T>(subset: T[], superset: T[]): boolean {
    return subset.every(item => superset.includes(item));
}

export default class RedisWrapper {

    private indexName: string;
    private embeddingFields: string[];
    private resultFields: string[];
    private maxResultsPerField: number = 3;
    private maxResultsTotal: number = 5;


    private static _instance: RedisWrapper;


    private constructor(indexName: string, embeddingFields: string[], resultFields: string[]) {
        this.indexName = indexName;
        this.embeddingFields = embeddingFields;
        this.resultFields = resultFields;
    }


    private static async ping(connection: any) {
        const request = new Request(PING_REDIS,
            {
                method: 'POST',
                headers: JSON_HEADERS,
                body: JSON.stringify(connection)
            });
        const res = await fetch(request);
        if (!res.ok) {
            throw Error('Unable to connect to flask webserver')
        }
    }


    private static async checkIndexExists(indexName: string) {
        const url = substitute(GET_INDEX, { name: indexName });
        const request = new Request(url);
        const res = await fetch(request);

        if (res.ok) {
            return await res.json();
        } else {
            throw Error('Index doesn\'t exist');
        }
    }

    private static matchFields(currentDetails: any, connectionDetails: any) {
        const availableFields = (currentDetails.fields as IndexableObject[]).map(_ => _.alias);
        const savedFields = Object.entries(connectionDetails.indexData.selectedSemanticFields as IndexableObject<boolean>).filter(_ => _[1]).map(_ => _[0]);
        if (!isSubset(savedFields, availableFields))
            throw Error("saved fields are missing.")
    }

    public static async verify(connectionDetails: any) {

        try {
            await this.ping(connectionDetails.connection)
            const currentDetails = await this.checkIndexExists(connectionDetails.indexName);
            this.matchFields(currentDetails, connectionDetails);
            const indexedFields = Object.entries(connectionDetails.indexData.selectedSemanticFields as IndexableObject<boolean>).filter(_ => _[1]).map(_ => _[0]);
            const resultFields = Object.entries(connectionDetails.indexData.resultFields as IndexableObject<boolean>).filter(_ => _[1]).map(_ => _[0]);
            this._instance = new RedisWrapper(connectionDetails.indexName, indexedFields, resultFields);
        } catch (error) {
            throw new Error("setup failed..." + error);
        }

    }

    public static async search(query: string, summarize: boolean) {

        const url = new URL(summarize ? SUMMARIZE : SEARCH_JSON);
        const payload = {
            query,
            indexName: this._instance.indexName,
            vectorFields: this._instance.embeddingFields,
            resultFields: this._instance.resultFields
        }

        const request = new Request(url, {
            method: 'POST',
            headers: JSON_HEADERS,
            body: JSON.stringify(payload)
        });


        const res = await fetch(request);
        if (res.ok) {
            const json: any = await res.json();
            return json.results;
        } else {
            throw Error("failed to search");
        }

    }

}