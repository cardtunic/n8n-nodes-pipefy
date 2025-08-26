import { IExecuteFunctions, NodeOperationError } from 'n8n-workflow';

export default function getWebhookParams(this: IExecuteFunctions, itemIndex: number) {
	const name = this.getNodeParameter('name', itemIndex) as string;
	const url = this.getNodeParameter('url', itemIndex) as string;
	const authorizationToken = this.getNodeParameter('authorizationToken', itemIndex) as
		| string
		| undefined;

	const events = this.getNodeParameter('events', itemIndex) as string[];

	let { notificationEmail, customHeaders, filters } = this.getNodeParameter(
		'additionalFields',
		itemIndex,
	) as {
		notificationEmail?: string;
		customHeaders?: string;
		filters?: string;
	};

	let headers: Record<string, string> = {};

	if (customHeaders) {
		try {
			headers = JSON.parse(customHeaders);
		} catch (e) {
			throw new NodeOperationError(this.getNode(), { message: "Invalid JSON in 'Custom headers'" });
		}
	}

	if (filters) {
		try {
			filters = JSON.parse(filters);
		} catch (e) {
			throw new NodeOperationError(this.getNode(), { message: "Invalid JSON in 'Filters'" });
		}
	}

	if (authorizationToken) headers = { ...headers, 'X-Pipefy-Signature': authorizationToken };

	const headersString = Object.keys(headers).length > 0 ? JSON.stringify(headers) : undefined;

	return {
		name,
		url,
		events,
		email: notificationEmail,
		headers: headersString,
		filters: filters as Record<string, unknown> | undefined,
	};
}
