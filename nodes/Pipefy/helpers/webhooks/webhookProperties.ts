import { INodeProperties } from 'n8n-workflow';

export default {
	name: {
		displayName: 'Name',
		name: 'name',
		type: 'string',
		default: '',
		required: true,
	} as INodeProperties,

	url: {
		displayName: 'URL',
		name: 'url',
		type: 'string',
		default: '',
		required: true,
		validateType: 'url',
		placeholder: 'https://example.com/webhook',
	} as INodeProperties,

	authToken: [
		{
			displayName: 'Authorization Token',
			name: 'authorizationToken',
			type: 'string',
			default: '',
			typeOptions: {
				password: true,
			},
			hint: "This will sended in every request in the 'X-Pipefy-Signature' header",
		},
		{
			displayName:
				'💡 Recommendation: Generate a random string that cannot be guessed, with something like crypto.randomUUID(), save it in a secret manager and use it here.',
			name: 'authorizationTokenNotice',
			type: 'notice',
			default: '',
		},
	] as INodeProperties[],

	additionalFields: (withFilters?: boolean) =>
		({
			displayName: 'Additional Fields',
			name: 'additionalFields',
			type: 'collection',
			placeholder: 'Add Field',
			default: {},
			options: [
				{
					displayName: 'Notification Email',
					name: 'notificationEmail',
					type: 'string',
					default: '',
					placeholder: 'email@example.com',
					hint: "The webhook's notification email",
				},
				{
					displayName: 'Custom Headers',
					name: 'customHeaders',
					type: 'json',
					default: '',
					hint: 'Define custom headers that will be sent in every webhook request',
				},
				...(withFilters
					? [
							{
								displayName: 'Filters',
								name: 'filters',
								type: 'json',
								default: '',
								hint: "ℹ️ INFO: When filters are setted only the first configured event will be used in the create request, this a Pipefy's API limitation. Check the docs for more details https://developers.pipefy.com/graphql.",
							},
						]
					: []),
			],
		}) as INodeProperties,
};
