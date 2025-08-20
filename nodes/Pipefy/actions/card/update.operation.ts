import {
	IExecuteFunctions,
	INodeExecutionData,
	INodeProperties,
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
		hint: 'The ID of the card to update the fields of',
		description:
			"You can find the card's ID in the URL when you're viewing it in the browser. https://app.pipefy.com/open-cards/[ID]",
		type: 'string',
		typeOptions: {
			minValue: constants.cardIdLength,
			maxValue: constants.cardIdLength,
		},
	},
	{
		displayName: 'Title',
		name: 'title',
		type: 'string',
		default: '',
		hint: 'The new title of the card',
	},
	{
		displayName: 'Due date',
		name: 'dueDate',
		type: 'dateTime',
		default: '',
		hint: 'The new card due date',
	},
	{
		displayName: 'Labels',
		name: 'labels',
		type: 'multiOptions',
		default: null,
		hint: 'The list of labels to replace in the card',
		typeOptions: {
			loadOptionsMethod: 'getCardPipeLabels',
			loadOptionsDependsOn: ['cardId'],
		},
		displayOptions: {
			show: {
				cardId: [
					{
						_cnd: {
							gt: constants.cardIdLength,
						},
					},
				],
			},
		},
		required: false,
	},
	{
		displayName: 'Assignees',
		name: 'assignees',
		type: 'multiOptions',
		default: null,
		hint: 'The list of assignees to replace in the card',
		typeOptions: {
			loadOptionsMethod: 'getCardPipeMembers',
			loadOptionsDependsOn: ['cardId'],
		},
		displayOptions: {
			show: {
				cardId: [
					{
						_cnd: {
							gt: constants.cardIdLength,
						},
					},
				],
			},
		},
		required: false,
	},
];

const displayOptions: INodeProperties['displayOptions'] = {
	show: {
		resource: ['card'],
		operation: ['update'],
	},
};

export const description = updateDisplayOptions(displayOptions, properties);

export async function execute(this: IExecuteFunctions): Promise<INodeExecutionData[]> {
	const cardId = this.getNodeParameter('cardId', 0) as string;
	const title = this.getNodeParameter('title', 0) as string;
	const dueDate = this.getNodeParameter('dueDate', 0) as string;
	const assignees = this.getNodeParameter('assignees', 0) as string[];
	const labels = this.getNodeParameter('labels', 0) as string[];

	await graphQlRequest({
		ctx: this,
		query: `
    mutation updateCard(
      $cardId: ID!,
      ${title ? '$title: String, ' : ''}
      ${assignees ? '$assignees: [ID], ' : ''} 
      ${labels ? '$labels: [ID], ' : ''}
      ${dueDate ? '$dueDate: DateTime' : ''}
    ) { 
      updateCard(input: {
        id: $cardId,
        ${title ? 'title: $title, ' : ''}
        ${assignees ? 'assignee_ids: $assignees, ' : ''}
        ${labels ? 'label_ids: $labels, ' : ''}
        ${dueDate ? 'due_date: $dueDate' : ''}
      }) {
        card {
          id
        }
      }
    }
    `,
		variables: { cardId, title, dueDate, assignees, labels },
	});

	return this.helpers.returnJsonArray({ cardId, title, dueDate, assignees, labels });
}
