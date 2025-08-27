import { INodeProperties } from 'n8n-workflow';

export * as getCurrent from './getCurrent.operation';

export const description: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		options: [
			{
				name: 'Get Current',
				value: 'getCurrent',
				action: 'Get authenticated user',
				description: 'Returns the authenticated user',
			},
		],
		default: 'getCurrent',
		displayOptions: {
			show: {
				resource: ['user'],
			},
		},
	},
];
