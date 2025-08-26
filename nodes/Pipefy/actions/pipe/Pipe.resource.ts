import { INodeProperties } from 'n8n-workflow';

import * as get from './get.operation';

export { get };

export const description: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		options: [
			{
				name: 'Get',
				value: 'get',
				action: 'Get pipe',
				description: 'Gets a pipe by ID',
			},
		],
		default: 'get',
		displayOptions: {
			show: {
				resource: ['pipe'],
			},
		},
	},

	...get.description,
];
