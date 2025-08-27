import {
	IExecuteFunctions,
	NodeConnectionType,
	type INodeType,
	type INodeTypeDescription,
} from 'n8n-workflow';

import * as attachment from './actions/attachments/Attachment.resource';
import * as card from './actions/card/Card.resource';
import * as pipe from './actions/pipe/Pipe.resource';
import * as webhook from './actions/webhook/Webhook.resource';
import { router } from './actions/router';
import * as user from './actions/user/User.resource';
import { loadOptions, resourceMapping } from './methods';

export class Pipefy implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Pipefy',
		name: 'pipefy',
		description: 'Interact with Pipefy GraphQL API',
		icon: { light: 'file:pipefy.svg', dark: 'file:pipefy.svg' },
		group: ['transform'],
		version: 1,

		defaults: {
			name: 'Pipefy',
		},

		inputs: [NodeConnectionType.Main],
		outputs: [NodeConnectionType.Main],

		credentials: [
			{
				name: 'pipefyServiceAccountApi',
				required: true,
				displayOptions: {
					show: {
						authentication: ['pipefyServiceAccountApi'],
					},
				},
			},
			{
				name: 'pipefyPersonalTokenApi',
				required: true,
				displayOptions: {
					show: {
						authentication: ['pipefyPersonalTokenApi'],
					},
				},
			},
		],

		properties: [
			{
				displayName: 'Authentication',
				name: 'authentication',
				type: 'options',
				options: [
					{
						name: 'Service Account',
						value: 'pipefyServiceAccountApi',
					},
					{
						name: 'Personal Access Token',
						value: 'pipefyPersonalTokenApi',
					},
				],
				default: 'pipefyServiceAccountApi',
			},
			{
				displayName: 'Resource',
				name: 'resource',
				type: 'options',
				noDataExpression: true,
				options: [
					{
						name: 'Attachment',
						value: 'attachment',
					},
					{
						name: 'Card',
						value: 'card',
					},
					{
						name: 'Pipe',
						value: 'pipe',
					},
					{
						name: 'User',
						value: 'user',
					},
					{
						name: 'Webhook',
						value: 'webhook',
					},
				],
				default: 'org',
			},
			...attachment.description,
			...card.description,
			...pipe.description,
			...user.description,
			...webhook.description,
		],
	};

	methods = {
		loadOptions,
		resourceMapping,
	};

	async execute(this: IExecuteFunctions) {
		const items = this.getInputData();

		const itemsPromises = items.map(async (_, itemIndex) => {
			return await router.call(this, itemIndex);
		});

		const processedItems = await Promise.all(itemsPromises);

		return [this.helpers.returnJsonArray(processedItems)];
	}
}
