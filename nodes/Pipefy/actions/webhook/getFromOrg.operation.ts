import {
	IDisplayOptions,
	IExecuteFunctions,
	INodeExecutionData,
	INodeProperties,
	updateDisplayOptions,
} from 'n8n-workflow';
import { graphQlRequest } from '../../transport';

const properties: INodeProperties[] = [
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
];

const displayOptions: IDisplayOptions = {
	show: {
		resource: ['webhook'],
		operation: ['getFromOrg'],
	},
};

export const description = updateDisplayOptions(displayOptions, properties);

export async function execute(
	this: IExecuteFunctions,
	itemIndex: number,
): Promise<INodeExecutionData> {
	const orgId = this.getNodeParameter('orgId', itemIndex) as string;

	const responseData = (await graphQlRequest({
		ctx: this,
		query: `
    query getOrgWebhooks($orgId: ID!) {
      organization(id: $orgId) {
        webhooks {
          actions
          email
          filters
          headers
          id
          name
          url
        }
      }
    }`,
		variables: { orgId },
	})) as {
		organization: {
			webhooks: any;
		};
	};

	return { json: { webhooks: responseData.organization.webhooks } };
}
