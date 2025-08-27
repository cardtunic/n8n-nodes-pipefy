import type {
	IAuthenticateGeneric,
	Icon,
	ICredentialTestRequest,
	ICredentialType,
	INodeProperties,
} from 'n8n-workflow';

export class PipefyPersonalTokenApi implements ICredentialType {
	name = 'pipefyPersonalTokenApi';

	icon = 'file:pipefy.svg' as Icon;

	displayName = 'Pipefy Access Personal Token API';

	documentationUrl = 'https://developers.pipefy.com/reference/personal-access-token';

	properties: INodeProperties[] = [
		{
			displayName: 'Personal Access Token',
			name: 'personalToken',
			type: 'string',
			typeOptions: { password: true },
			default: '',
		},
		{
			displayName:
				'⚠️ Personal Access Tokens are not intended to be used in production environments and process integrations.',
			name: 'importantNotice',
			type: 'notice',
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
