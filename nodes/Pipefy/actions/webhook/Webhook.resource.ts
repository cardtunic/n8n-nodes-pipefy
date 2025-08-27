import { INodeProperties } from 'n8n-workflow';

import * as getFromOrg from './getFromOrg.operation';
import * as getFromPipe from './getFromPipe.operation';
import * as destroy from './destroy.operation';
import * as createInOrg from './createInOrg.operation';
import * as createInPipe from './createInPipe.operation';

export { getFromOrg, getFromPipe, destroy, createInOrg, createInPipe };

export const description: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		options: [
			{
				name: 'Create Org Webhook',
				value: 'createInOrg',
				action: 'Create org webhook',
				description: 'Create a webhook to watch organization events',
			},
			{
				name: 'Create Pipe Webhook',
				value: 'createInPipe',
				action: 'Create pipe webhook',
				description: 'Create a webhook to watch pipe events',
			},
			{
				name: 'Delete',
				value: 'destroy',
				action: 'Delete webhook',
				description: 'Deletes a given webhook',
			},
			{
				name: 'Get Org Webhooks',
				value: 'getFromOrg',
				action: 'Get org webhooks',
				description: 'Get all webhooks in the organization level',
			},
			{
				name: 'Get Pipe Webhooks',
				value: 'getFromPipe',
				action: 'Get pipe webhooks',
				description: 'Get all webhooks in the pipe level',
			},
		],
		default: 'getFromOrg',
		displayOptions: {
			show: {
				resource: ['webhook'],
			},
		},
	},

	...getFromOrg.description,
	...getFromPipe.description,

	...createInOrg.description,
	...createInPipe.description,

	...destroy.description,
];
