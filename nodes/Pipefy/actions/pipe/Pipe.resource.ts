import { INodeProperties } from 'n8n-workflow';

import * as get from './get.operation';
import * as getMany from './getMany.operation';

export { get, getMany };

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
				action: 'Get many pipes',
				description: 'Lists all pipes in a given org',
			},
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
	...getMany.description,
];
