import {
	IDataObject,
	IExecuteFunctions,
	IHttpRequestOptions,
	ILoadOptionsFunctions,
	IPollFunctions,
	JsonObject,
	NodeApiError,
} from 'n8n-workflow';

export async function graphQlRequest({
	ctx,
	query,
	variables,
}: {
	ctx: IExecuteFunctions | ILoadOptionsFunctions | IPollFunctions;
	query: string;
	variables?: Record<string, unknown>;
}) {
	const options: IHttpRequestOptions = {
		method: 'POST',
		baseURL: 'https://api.pipefy.com',
		url: '/graphql',
		json: true,
		body: {
			query,
			variables,
		},
	};

	let response: IDataObject;

	try {
		response = await ctx.helpers.httpRequestWithAuthentication.call(
			ctx,
			'pipefyPersonalToken',
			options,
		);
	} catch (error) {
		throw new NodeApiError(ctx.getNode(), error as JsonObject);
	}

	if ('errors' in response) {
		const {
			message,
			extensions: { code: description },
		} = (response.errors as { message: string; extensions: { code: string } }[])[0];

		throw new NodeApiError(ctx.getNode(), { message, description });
	}

	return response.data as IDataObject;
}
