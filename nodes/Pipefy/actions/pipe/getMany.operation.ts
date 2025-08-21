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
		displayName: 'Organization ID',
		name: 'orgId',
		type: 'string',
		default: '',
		required: true,
	},
];

const displayOptions: IDisplayOptions = {
	show: {
		resource: ['pipe'],
		operation: ['getMany'],
	},
};

export const description = updateDisplayOptions(displayOptions, properties);

export async function execute(
	this: IExecuteFunctions,
	itemIndex: number,
): Promise<INodeExecutionData> {
	const orgId = this.getNodeParameter('orgId', itemIndex) as string;

	const responseData = await graphQlRequest({
		ctx: this,
		query: `
    query getManyPipes($orgId: ID!) {
      organization(id: $orgId) {
        pipes {
          id
          name
        }
      }
    }`,
		variables: { orgId },
	});

	return { json: responseData };
}
