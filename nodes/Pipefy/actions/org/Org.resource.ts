import { INodeProperties } from 'n8n-workflow';

export const description: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		options: [
			{
				name: 'Get many',
				value: 'getMany',
				action: 'Get many orgs',
				description: 'Lists all orgs that the user has access to',
			},
			{
				name: 'Get',
				value: 'get',
				action: 'Get org',
				description: 'Gets an org by ID',
			},
		],
		default: 'get',
		displayOptions: {
			show: {
				resource: ['org'],
			},
		},
	},
];
