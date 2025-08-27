import axios, { AxiosRequestConfig } from 'axios';
import type {
	Icon,
	ICredentialDataDecryptedObject,
	ICredentialTestRequest,
	ICredentialType,
	IHttpRequestOptions,
	INodeProperties,
} from 'n8n-workflow';

export class PipefyServiceAccountApi implements ICredentialType {
	name = 'pipefyServiceAccountApi';

	icon = 'file:pipefy.svg' as Icon;

	displayName = 'Pipefy Service Account API';

	documentationUrl = 'https://developers.pipefy.com/reference/service-accounts';

	properties: INodeProperties[] = [
		{
			displayName: 'Client ID',
			name: 'clientId',
			type: 'string',
			default: '',
		},
		{
			displayName: 'Client secret',
			name: 'clientSecret',
			type: 'string',
			typeOptions: {
				password: true,
			},
			default: '',
		},
	];

	async authenticate(
		credentials: ICredentialDataDecryptedObject,
		requestOptions: IHttpRequestOptions,
	) {
		const config: AxiosRequestConfig = {
			url: 'https://app.pipefy.com/oauth/token',
			method: 'POST',
			data: {
				grant_type: 'client_credentials',
				client_id: credentials.clientId,
				client_secret: credentials.clientSecret,
			},
			headers: {
				'Content-Type': 'application/json',
			},
		};

		const response = await axios(config);

		const { access_token } = response.data as { access_token: string };

		const requestOptionsWithAuth: IHttpRequestOptions = {
			...requestOptions,
			headers: {
				...requestOptions.headers,
				Authorization: `Bearer ${access_token}`,
			},
		};

		return requestOptionsWithAuth;
	}

	test: ICredentialTestRequest = {
		request: {
			baseURL: 'https://api.pipefy.com',
			url: '/graphql',
			method: 'POST',

			json: true,

			body: {
				query: `{ me { id name email username } }`,
			},
		},
	};
}
