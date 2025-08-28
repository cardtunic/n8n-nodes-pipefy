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
		displayName: 'Org Name or ID',
		name: 'orgId',
		type: 'options',
		description:
			'Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>',
		default: '',
		required: true,
		typeOptions: {
			loadOptionsMethod: 'getOrgs',
		},
	},
	{
		displayName: 'Events',
		name: 'events',
		type: 'multiOptions',
		default: [],
		options: [
			{ name: 'user.invitation_acceptance', value: 'user.invitation_acceptance' },
			{ name: 'user.invitation_sent', value: 'user.invitation_sent' },
			{ name: 'user.removal_from_org', value: 'user.removal_from_org' },
			{ name: 'user.removal_from_pipe', value: 'user.removal_from_pipe' },
			{ name: 'user.removal_from_table', value: 'user.removal_from_table' },
			{ name: 'user.role_set', value: 'user.role_set' },
		],
		required: true,
	},

	...webhookProperties.authToken,
	webhookProperties.additionalFields(),
];

const displayOptions: IDisplayOptions = {
	show: {
		resource: ['webhook'],
		operation: ['createInOrg'],
	},
};

export const description = updateDisplayOptions(displayOptions, properties);

export async function execute(
	this: IExecuteFunctions,
	itemIndex: number,
): Promise<INodeExecutionData> {
	const { name, url, events, email, headers } = getWebhookParams.call(this, itemIndex);

	const orgId = this.getNodeParameter('orgId', itemIndex) as string;

	const responseData = (await graphQlRequest({
		ctx: this,
		query: `
      mutation createOrganizationWebhook(
        $events: [String]!
        $email: String
        $headers: Json
        $name: String!
        $orgId: ID!
        $url: String!
      ) {
        createOrganizationWebhook(
          input: {
            actions: $events
            email: $email
            headers: $headers
            name: $name
            organization_id: $orgId
            url: $url
        }
      ) {
        webhook {
            id
            name
            url
          }
        }
      }
      `,
		variables: {
			events,
			email,
			headers,
			name,
			orgId,
			url,
		},
	})) as { createOrganizationWebhook: { webhook: { id: string } } };

	return { json: { webhookId: responseData.createOrganizationWebhook.webhook.id } };
}
