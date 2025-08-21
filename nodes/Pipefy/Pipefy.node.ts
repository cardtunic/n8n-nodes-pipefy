import {
	IExecuteFunctions,
	NodeConnectionType,
	type INodeType,
	type INodeTypeDescription,
} from 'n8n-workflow';

import * as attachment from './actions/attachments/Attachment.resource';
import * as card from './actions/card/Card.resource';
import * as org from './actions/org/Org.resource';
import * as pipe from './actions/pipe/Pipe.resource';
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
				name: 'pipefyPersonalToken',
				required: true,
			},
		],

		properties: [
			{
				displayName: 'Resource',
				name: 'resource',
				type: 'options',
				noDataExpression: true,
				options: [
					{
						name: 'User',
						value: 'user',
					},
					{
						name: 'Organization',
						value: 'org',
					},
					{
						name: 'Pipe',
						value: 'pipe',
					},
					{
						name: 'Card',
						value: 'card',
					},
					{
						name: 'Attachment',
						value: 'attachment',
					},
				],
				default: 'org',
			},
			...org.description,
			...card.description,
			...pipe.description,
			...user.description,
			...attachment.description,
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
