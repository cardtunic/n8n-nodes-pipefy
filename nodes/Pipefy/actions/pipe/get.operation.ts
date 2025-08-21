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
		displayName: 'Pipe ID',
		name: 'pipeId',
		type: 'string',
		default: '',
		required: true,
	},
];

const displayOptions: IDisplayOptions = {
	show: {
		resource: ['pipe'],
		operation: ['get'],
	},
};

export const description = updateDisplayOptions(displayOptions, properties);

export async function execute(
	this: IExecuteFunctions,
	itemIndex: number,
): Promise<INodeExecutionData> {
	const pipeId = this.getNodeParameter('pipeId', itemIndex) as string;

	const responseData = await graphQlRequest({
		ctx: this,
		query: `
      query getPipe($pipeId: ID!) {
        pipe(id: $pipeId) {
            id,
            members {
                user {
                    id
                    email
                }
            }
        }
      }`,
		variables: { pipeId },
	});

	return { json: responseData };
}
