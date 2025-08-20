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
		description: 'The ID of the pipe to get the cards from',
		hint: "You can find the pipe's ID in the URL when you're viewing it in the browser. https://app.pipefy.com/pipes/[ID]",
	},
];

const displayOptions: IDisplayOptions = {
	show: {
		resource: ['card'],
		operation: ['getMany'],
	},
};

export const description = updateDisplayOptions(displayOptions, properties);

export async function execute(this: IExecuteFunctions): Promise<INodeExecutionData[]> {
	const cardId = this.getNodeParameter('cardId', 0) as string;

	const responseData = await graphQlRequest({
		ctx: this,
		query: `
    query getCard($cardId: ID!) {
      card(id: $cardId) {
        title
        fields {
          name
          field {
            id
            options 
          }
          value
        }
      }
    }`,
		variables: { cardId },
	});

	return this.helpers.returnJsonArray(responseData);
}
