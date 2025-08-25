import { INodeProperties } from 'n8n-workflow';

import * as create from './create.operation';

export { create };

export const description: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		options: [
			{
				name: 'Create',
				value: 'create',
				action: 'Create webhook',
				description: 'Create a webhook at the organization or pipe level',
			},
		],
		default: 'get',
		displayOptions: {
			show: {
				resource: ['webhook'],
			},
		},
	},

	...create.description,
];
