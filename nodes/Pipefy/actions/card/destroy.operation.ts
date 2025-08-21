import {
	IDisplayOptions,
	IExecuteFunctions,
	INodeExecutionData,
	INodeProperties,
	NodeApiError,
	updateDisplayOptions,
} from 'n8n-workflow';
import constants from '../../constants';
import { graphQlRequest } from '../../transport';

const properties: INodeProperties[] = [
	{
		displayName: 'Card ID',
		name: 'cardId',
		default: '',
		required: true,
		hint: 'The ID of the card to delete',
		description:
			"You can find the card's ID in the URL when you're viewing it in the browser. https://app.pipefy.com/open-cards/[ID]",
		type: 'string',
		typeOptions: {
			minValue: constants.cardIdLength,
			maxValue: constants.cardIdLength,
		},
	},
];

const displayOptions: IDisplayOptions = {
	show: {
		resource: ['card'],
		operation: ['destroy'],
	},
};

export const description = updateDisplayOptions(displayOptions, properties);

export async function execute(
	this: IExecuteFunctions,
	itemIndex: number,
): Promise<INodeExecutionData> {
	const cardId = this.getNodeParameter('cardId', itemIndex) as string;

	const responseData = (await graphQlRequest({
		ctx: this,
		query: `
    mutation deleteCard($cardId: ID!) {
      deleteCard(input: { id: $cardId }) {
        success
      }
    }
    `,
		variables: { cardId },
	})) as { deleteCard: { success: boolean } };

	if (!responseData.deleteCard.success)
		throw new NodeApiError(this.getNode(), { message: "Couldn't delete the card" });

	return { json: responseData };
}
