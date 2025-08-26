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
		type: 'options',
		default: '',
		required: true,
		typeOptions: {
			loadOptionsMethod: 'getPipes',
		},
	},
];

const displayOptions: IDisplayOptions = {
	show: {
		resource: ['webhook'],
		operation: ['getFromPipe'],
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
    query getPipeWebhooks($pipeId: ID!) {
      pipe(id: $pipeId) {
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
    }
    `,
		variables: { pipeId },
	});

	return { json: responseData };
}
