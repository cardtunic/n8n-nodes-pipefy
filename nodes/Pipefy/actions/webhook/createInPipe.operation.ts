import {
	IDisplayOptions,
	IExecuteFunctions,
	INodeExecutionData,
	INodeProperties,
	updateDisplayOptions,
} from 'n8n-workflow';
import { graphQlRequest } from '../../transport';
import getWebhookParams from '../../helpers/webhooks/getWebhookParams';
import webhookProperties from '../../helpers/webhooks/webhookProperties';

const properties: INodeProperties[] = [
	webhookProperties.name,
	webhookProperties.url,

	{
		displayName: 'Pipe Name or ID',
		name: 'pipeId',
		type: 'options',
		description: 'Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>',
		default: '',
		required: true,
		typeOptions: {
			loadOptionsMethod: 'getPipes',
		},
	},

	{
		displayName: 'Events',
		name: 'events',
		type: 'multiOptions',
		default: [],
		options: [
			{ name: 'card.comment_create', value: 'card.comment_create' },
			{ name: 'card.create', value: 'card.create' },
			{ name: 'card.delete', value: 'card.delete' },
			{ name: 'card.done', value: 'card.done' },
			{ name: 'card.email_received', value: 'card.email_received' },
			{ name: 'card.expired', value: 'card.expired' },
			{ name: 'card.field_update', value: 'card.field_update' },
			{ name: 'card.late', value: 'card.late' },
			{ name: 'card.move', value: 'card.move' },
			{ name: 'card.overdue', value: 'card.overdue' },
		],
		required: true,
	},

	...webhookProperties.authToken,
	webhookProperties.additionalFields(true),
];

const displayOptions: IDisplayOptions = {
	show: {
		resource: ['webhook'],
		operation: ['createInPipe'],
	},
};

export const description = updateDisplayOptions(displayOptions, properties);

export async function execute(
	this: IExecuteFunctions,
	itemIndex: number,
): Promise<INodeExecutionData> {
	const { name, url, events, email, headers, filters } = getWebhookParams.call(this, itemIndex);

	const pipeId = this.getNodeParameter('pipeId', itemIndex) as string;

	const responseData = await graphQlRequest({
		ctx: this,
		query: `
    mutation createWebhook(
      $events: [String]!,
      $email: String,
      $name: String!,
      $filters: JSON,
      $headers: Json,
      $pipeId: ID!,
      $url: String!
    ) {
      createWebhook(input: {
        actions: $events,
        name: $name,
        pipe_id: $pipeId,
        url: $url,
        email: $email,
        filters: $filters,
        headers: $headers,
      }) {
        webhook {
          id
          actions
          url
        }
      }
    }`,
		variables: {
			events: filters ? events.slice(0, 1) : events,
			email,
			name,
			filters,
			headers,
			pipeId,
			url,
		},
	});

	return { json: responseData };
}
