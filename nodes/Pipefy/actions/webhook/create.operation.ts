import { IDisplayOptions, INodeProperties, updateDisplayOptions } from 'n8n-workflow';

const properties: INodeProperties[] = [
	{
		displayName: 'Webhook Name',
		name: 'name',
		type: 'string',
		default: '',
		required: true,
	},
	{
		displayName: 'Webhook URL',
		name: 'url',
		type: 'string',
		default: '',
		required: true,
		validateType: 'url',
		placeholder: 'https://example.com/webhook',
	},
	{
		displayName: 'Webhook Type',
		name: 'type',
		type: 'options',
		default: null,
		options: [
			{
				name: 'Org',
				value: 'org',
				description: 'Only specific organization level events',
			},
			{
				name: 'Pipe',
				value: 'pipe',
				description: 'Only specific pipe level events',
			},
		],
		required: true,
	},
	{
		displayName: 'Webhook Header Signature',
		name: 'signature',
		type: 'string',
		default: '',
		typeOptions: {
			password: true,
		},
		required: false,
	},
	{
		displayName: 'Org ID',
		name: 'orgId',
		type: 'options',
		default: '',
		required: true,
		typeOptions: {
			loadOptionsMethod: 'getOrgs',
		},
		displayOptions: {
			show: {
				type: ['org'],
			},
		},
	},
	{
		displayName: 'Events',
		name: 'orgEvents',
		type: 'multiOptions',
		default: null,
		options: [
			{ name: 'user.invitation_sent', value: 'user.invitation_sent' },
			{ name: 'user.invitation_acceptance', value: 'user.invitation_acceptance' },
			{ name: 'user.role_set', value: 'user.role_set' },
			{ name: 'user.removal_from_org', value: 'user.removal_from_org' },
			{ name: 'user.removal_from_pipe', value: 'user.removal_from_pipe' },
			{ name: 'user.removal_from_table', value: 'user.removal_from_table' },
		],
		displayOptions: {
			show: {
				type: ['org'],
			},
		},
	},

	{
		displayName: 'Additional Fields',
		name: 'additionalFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		options: [
			{
				displayName: 'Webhook Notification Email',
				name: 'notificationEmail',
				type: 'string',
				default: '',
				placeholder: 'email@example.com',
			},
			{
				displayName: 'Webhook Custom Headers',
				name: 'headers',
				type: 'json',
				default: '',
			},
		],
	},
];

const displayOptions: IDisplayOptions = {
	show: {
		resource: ['webhook'],
		operation: ['create'],
	},
};

export const description = updateDisplayOptions(displayOptions, properties);

export async function execute() {
	return { success: true };
}
