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
		displayName: 'Org ID',
		name: 'orgId',
		type: 'options',
		default: '',
		required: true,
		description: 'ID of the organization',
		typeOptions: {
			loadOptionsMethod: 'getOrgs',
		},
	},
	{
		displayName: 'Filename',
		name: 'filename',
		type: 'string',
		default: '',
		required: true,
		description: 'Filename of the attachment',
	},
	{
		displayName: 'ℹ️ This will be the name of the file displayed on Pipefy field.',
		name: 'notice',
		type: 'notice',
		default: '',
	},
];

const displayOptions: IDisplayOptions = {
	show: {
		resource: ['attachment'],
		operation: ['createPresignedUrl'],
	},
};

export const description = updateDisplayOptions(displayOptions, properties);

export async function execute(
	this: IExecuteFunctions,
	itemIndex: number,
): Promise<INodeExecutionData> {
	const orgId = this.getNodeParameter('orgId', itemIndex) as string;
	const filename = this.getNodeParameter('filename', itemIndex) as string;

	const {
		createPresignedUrl: { url },
	} = (await graphQlRequest({
		ctx: this,
		query: `
    mutation createPresignedUrl($orgId: ID!, $filename: String!) {
      createPresignedUrl(input: { organizationId: $orgId, fileName: $filename }){
        url
      }
    }
    `,
		variables: { orgId, filename },
	})) as { createPresignedUrl: { url: string } };

	const fieldValue = `orgs${url.split('/orgs')[1].split('?')[0]}`;

	return { json: { url, fieldValue } };
}
