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
		displayName: 'Parent ID',
		name: 'cardId',
		default: '',
		required: true,
		hint: 'The ID of the card parent card in the relation',
		description:
			"You can find the card's ID in the URL when you're viewing it in the browser. https://app.pipefy.com/open-cards/[ID].",
		type: 'string',
	},
	{
		displayName: 'Relation Source',
		name: 'relationSource',
		type: 'options',
		options: [
			{
				name: 'Pipe Relation',
				value: 'pipe',
				description: "Relation defined in the card's pipe",
			},
			{
				name: 'Field Relation',
				value: 'field',
				description: 'Relation defined in a field of the card',
			},
		],
		default: 'pipe',
		required: true,
	},
	{
		displayName:
			'💡 Recommendation: Use "Update fields" instead. With "Field Relation" selected, the relation will be created, but, Pipefy will not fill the field.',
		name: 'fieldRelationSourceNotice',
		type: 'notice',
		default: '',
		displayOptions: {
			show: {
				relationSource: ['field'],
			},
		},
	},
	{
		displayName: 'Pipe Relation Name or ID',
		name: 'pipeRelationId',
		type: 'options',
		typeOptions: {
			loadOptionsMethod: 'getCardPipeRelations',
			loadOptionsDependsOn: ['cardId', 'relationSource'],
		},
		default: '',
		required: true,
		description:
			'Pipe Relation ID defined in the card\'s pipe. Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>.',
		displayOptions: {
			show: {
				relationSource: ['pipe'],
				cardId: [
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
		displayName: 'Phase Name or ID',
		name: 'phaseId',
		default: '',
		required: true,
		description:
			'Phase ID where the relation field is. Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>.',
		type: 'options',
		typeOptions: {
			loadOptionsMethod: 'getPipePhases',
			loadOptionsDependsOn: ['cardId', 'relationSource'],
		},
		displayOptions: {
			show: {
				relationSource: ['field'],
				cardId: [
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
		displayName: 'Field Relation Name or ID',
		name: 'fieldId',
		default: '',
		required: true,
		description:
			'ID of a field of type "connector". Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>.',
		type: 'options',
		typeOptions: {
			loadOptionsMethod: 'getPhaseRelationFields',
			loadOptionsDependsOn: ['cardId', 'relationSource', 'phaseId'],
		},
		displayOptions: {
			show: {
				relationSource: ['field'],
				cardId: [
					{
						_cnd: {
							exists: true,
						},
					},
				],
				phaseId: [
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
		displayName: 'Child ID',
		name: 'childId',
		default: '',
		required: true,
		hint: 'The ID of the child card in the relation',
		description:
			"You can find the card's ID in the URL when you're viewing it in the browser. https://app.pipefy.com/open-cards/[ID].",
		type: 'string',
	},
];

const displayOptions: IDisplayOptions = {
	show: {
		resource: ['card'],
		operation: ['createRelation'],
	},
};

export const description = updateDisplayOptions(displayOptions, properties);

export async function execute(
	this: IExecuteFunctions,
	itemIndex: number,
): Promise<INodeExecutionData> {
	const parentId = this.getNodeParameter('cardId', itemIndex) as string;
	const relationSource = this.getNodeParameter('relationSource', itemIndex) as 'field' | 'pipe';

	let pipeRelationId = '';
	let fieldId = '';

	if (relationSource === 'field') {
		fieldId = this.getNodeParameter('fieldId', itemIndex) as string;
	} else {
		pipeRelationId = this.getNodeParameter('pipeRelationId', itemIndex) as string;
	}

	const childId = this.getNodeParameter('childId', itemIndex) as string;

	const sourceId = relationSource === 'field' ? fieldId : pipeRelationId;

	const responseData = (await graphQlRequest({
		ctx: this,
		query: `
    mutation createCardRelation($parentId: ID!, $sourceId: ID!, $childId: ID!, $sourceType: String!) {
      createCardRelation(input: { parentId: $parentId, sourceId: $sourceId, childId: $childId, sourceType: $sourceType }) {
        cardRelation {
          id
        }
      }
    }
    `,
		variables: {
			parentId,
			sourceId,
			childId,
			sourceType: relationSource === 'field' ? 'Field' : 'PipeRelation',
		},
	})) as { createCardRelation: { cardRelation: { id: string } } };

	return { json: { relationId: responseData.createCardRelation.cardRelation.id } };
}
