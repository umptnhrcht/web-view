import { GET_INDEX, JSON_HEADERS, PING_REDIS, substitute } from "../constants";

interface IndexableObject<T = string> {
	[key: string]: T;
}

function isSubset<T>(subset: T[], superset: T[]): boolean {
	return subset.every(item => superset.includes(item));
}

export default class RedisWrapper {

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
		} catch (error) {
			throw new Error("setup failed..." + error);
		}

	}
}