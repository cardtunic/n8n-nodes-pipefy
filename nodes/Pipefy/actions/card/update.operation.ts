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
		displayName: 'Additional Fields',
		name: 'additionalFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		options: [
			{
				displayName: 'Labels',
				name: 'labels',
				type: 'multiOptions',
				default: null,
				hint: 'List of labels to replace in the card',
				typeOptions: {
					loadOptionsMethod: 'getCardPipeLabels',
					loadOptionsDependsOn: ['cardId'],
				},
			},
			{
				displayName: 'Assignees',
				name: 'assignees',
				type: 'multiOptions',
				default: null,
				hint: 'List of assignees to replace in the card',
				typeOptions: {
					loadOptionsMethod: 'getCardPipeMembers',
					loadOptionsDependsOn: ['cardId'],
				},
			},
			{
				displayName: 'Clear Labels',
				name: 'clearLabels',
				type: 'boolean',
				default: true,
				hint: 'Enable to clear all labels from the card',
				displayOptions: {
					hide: {
						labels: [
							{
								_cnd: {
									exists: true,
								},
							},
						],
					},
				},
			},
			{
				displayName: 'Clear Assignees',
				name: 'clearAssignees',
				type: 'boolean',
				default: true,
				hint: 'Enable to clear all assignees from the card',
				displayOptions: {
					hide: {
						assignees: [
							{
								_cnd: {
									exists: true,
								},
							},
						],
					},
				},
			},
		],
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
	},
];

const displayOptions: INodeProperties['displayOptions'] = {
	show: {
		resource: ['card'],
		operation: ['update'],
	},
};

export const description = updateDisplayOptions(displayOptions, properties);

export async function execute(
	this: IExecuteFunctions,
	itemIndex: number,
): Promise<INodeExecutionData> {
	const cardId = this.getNodeParameter('cardId', itemIndex) as string;
	const title = this.getNodeParameter('title', itemIndex) as string;
	const dueDate = this.getNodeParameter('dueDate', itemIndex) as string;

	const { assignees, labels, clearAssignees, clearLabels } = this.getNodeParameter(
		'additionalFields',
		itemIndex,
	) as {
		assignees?: string[];
		labels?: string[];
		clearLabels?: boolean;
		clearAssignees?: boolean;
	};

	await graphQlRequest({
		ctx: this,
		query: `
    mutation updateCard(
      $cardId: ID!,
      ${title ? '$title: String, ' : ''}
      ${assignees || clearAssignees ? '$assignees: [ID], ' : ''} 
      ${labels || clearLabels ? '$labels: [ID], ' : ''}
      ${dueDate ? '$dueDate: DateTime' : ''}
    ) { 
      updateCard(input: {
        id: $cardId,
        ${title ? 'title: $title, ' : ''}
        ${assignees || clearAssignees ? 'assignee_ids: $assignees, ' : ''}
        ${labels || clearLabels ? 'label_ids: $labels, ' : ''}
        ${dueDate ? 'due_date: $dueDate' : ''}
      }) {
        card {
          id
        }
      }
    }
    `,
		variables: {
			cardId,
			title,
			dueDate,
			assignees: clearAssignees ? [] : assignees,
			labels: clearLabels ? [] : labels,
		},
	});

	return { json: { cardId, title, dueDate, assignees, labels } };
}
