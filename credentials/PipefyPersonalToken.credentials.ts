import type {
	IAuthenticateGeneric,
	ICredentialTestRequest,
	ICredentialType,
	INodeProperties,
} from 'n8n-workflow';

export class PipefyPersonalToken implements ICredentialType {
	name = 'pipefyPersonalToken';

	displayName = 'Pipefy Personal Token';

	documentationUrl = 'https://developers.pipefy.com/reference/personal-access-token';

	properties: INodeProperties[] = [
		{
			displayName: 'Personal Token',
			name: 'personalToken',
			type: 'string',
			typeOptions: { password: true },
			default: '',
		},
	];

	authenticate: IAuthenticateGeneric = {
		type: 'generic',
		properties: {
			headers: {
				Authorization: '=Bearer {{$credentials.personalToken}}',
			},
		},
	};

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
