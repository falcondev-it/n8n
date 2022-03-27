import { IExecuteFunctions, ILoadOptionsFunctions, IPollFunctions, JsonObject, NodeApiError, NodeOperationError } from "n8n-workflow";
import { OptionsWithUri } from "request";

export async function portainerApiRequest(this: ILoadOptionsFunctions | IPollFunctions | IExecuteFunctions, method: string, resource: string, body: any = {}): Promise<any> { // tslint:disable-line:no-any

	const credentials = await this.getCredentials('portainer');

	if (credentials === undefined) {
		throw new NodeOperationError(this.getNode(), 'No credentials got returned!');

	}
	const BASE_URL = credentials.endpoint;

	const options: OptionsWithUri = {
		headers: {
			'Content-Type': 'application/json',
			'X-Api-Key': credentials.apiKey as string,
		},
		method,
		body,
		uri: `${BASE_URL}/${resource}`,
		json: true,
		useQuerystring: true,
	};

	try {
		return await this.helpers.request!(options);
	} catch (error) {
		throw new NodeApiError(this.getNode(), error as JsonObject);
	}
}
