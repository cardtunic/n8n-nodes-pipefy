import {
	IDisplayOptions,
	IExecuteFunctions,
	INodeExecutionData,
	INodeProperties,
	NodeApiError,
	updateDisplayOptions,
} from 'n8n-workflow';
import { graphQlRequest } from '../../transport';

const properties: INodeProperties[] = [
	{
		displayName: 'Webhook ID',
		name: 'webhookId',
		type: 'string',
		default: '',
		required: true,
	},
	{
		displayName: 'Type',
		name: 'type',
		type: 'options',
		default: null,
		options: [
			{
				name: 'Org',
				value: 'org',
			},
			{
				name: 'Pipe',
				value: 'pipe',
			},
		],
		required: true,
	},
];

const displayOptions: IDisplayOptions = {
	show: {
		resource: ['webhook'],
		operation: ['destroy'],
	},
};

export const description = updateDisplayOptions(displayOptions, properties);

export async function execute(
	this: IExecuteFunctions,
	itemIndex: number,
): Promise<INodeExecutionData> {
	const webhookId = this.getNodeParameter('webhookId', itemIndex) as string;
	const type = this.getNodeParameter('type', itemIndex) as 'org' | 'pipe';

	let success: boolean = false;

	if (type === 'org') {
		const response = (await graphQlRequest({
			ctx: this,
			query: `
      mutation deleteOrganizationWebhook($webhookId: ID!) {
        deleteOrganizationWebhook(input: { id: $webhookId }) {
          success
        }
      }`,
			variables: { webhookId },
		})) as { deleteOrganizationWebhook: { success: boolean } };

		success = response.deleteOrganizationWebhook.success;
	}

	if (type === 'pipe') {
		const response = (await graphQlRequest({
			ctx: this,
			query: `
      mutation deleteWebhook($webhookId: ID!) {
        deleteWebhook(input: { id: $webhookId }) {
          success
        }
      }`,
			variables: { webhookId },
		})) as { deleteWebhook: { success: boolean } };

		success = response.deleteWebhook.success;
	}

	if (!success) throw new NodeApiError(this.getNode(), { message: 'Webhook could not be deleted' });

	return { json: { success } };
}
