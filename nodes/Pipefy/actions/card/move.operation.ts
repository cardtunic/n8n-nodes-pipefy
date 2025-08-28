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
		displayName: 'Card ID',
		name: 'cardId',
		default: '',
		required: true,
		description: 'The ID of the card to move',
		hint: "You can find the card's ID in the URL when you're viewing it in the browser. https://app.pipefy.com/open-cards/[ID]",
		type: 'string',
	},
	{
		displayName: 'Phase Name or ID',
		name: 'phaseId',
		default: '',
		required: true,
		description:
			'The ID of the phase to move. Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>.',
		type: 'options',
		typeOptions: {
			loadOptionsMethod: 'getPipePhases',
			loadOptionsDependsOn: ['cardId'],
		},
	},
];

const displayOptions: IDisplayOptions = {
	show: {
		resource: ['card'],
		operation: ['move'],
	},
};

export const description = updateDisplayOptions(displayOptions, properties);

export async function execute(
	this: IExecuteFunctions,
	itemIndex: number,
): Promise<INodeExecutionData> {
	const cardId = this.getNodeParameter('cardId', itemIndex) as string;
	const phaseId = this.getNodeParameter('phaseId', itemIndex) as string;

	await graphQlRequest({
		ctx: this,
		query: `
    mutation moveCard($cardId: ID!, $phaseId: ID!) {
      moveCardToPhase( input: { card_id: $cardId, destination_phase_id: $phaseId } ) {
        card {
          id
        }
      }
    }`,
		variables: { cardId, phaseId },
	});

	return { json: {} };
}
