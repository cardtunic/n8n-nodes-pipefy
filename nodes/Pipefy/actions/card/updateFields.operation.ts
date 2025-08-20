import {
	IExecuteFunctions,
	INodeExecutionData,
	INodeProperties,
	NodeApiError,
	ResourceMapperValue,
	updateDisplayOptions,
} from 'n8n-workflow';
import constants from '../../constants';
import { graphQlRequest } from '../../transport';
import { resourceMapperValueToPipefyAttributes } from '../../utils';

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
		displayName: 'Phase ID',
		name: 'phaseId',
		default: '',
		required: true,
		description: 'The ID of the phase to move',
		type: 'options',
		typeOptions: {
			loadOptionsMethod: 'getPipePhases',
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
	},
	{
		displayName: 'Update operation',
		name: 'updateOperation',
		type: 'options',
		default: 'replace',
		hint: "The manner in which the field's value will be updated.",
		options: [
			{
				name: 'Replace',
				value: 'replace',
				description: 'Replace the existing value with the new one provided.',
			},
			{
				name: 'Add',
				value: 'add',
				description:
					'Append values to existing list of values, compatible with field types that support lists like Attachments, Assignees, Labels, Connections and Checklists.',
			},
			{
				name: 'Remove',
				value: 'remove',
				description:
					'Remove values from the existing list of values, compatible with field types that support lists like Attachments, Assignees, Labels, Connections and Checklists.',
			},
		],
		required: true,
		displayOptions: {
			show: {
				phaseId: [
					{
						_cnd: {
							gt: constants.phaseIdLength,
						},
					},
				],
			},
		},
	},
	{
		displayName: 'Fields',
		name: 'fields',
		type: 'resourceMapper',
		default: {
			mappingMode: 'defineBelow',
			value: null,
		},
		required: true,
		typeOptions: {
			resourceMapper: {
				resourceMapperMethod: 'getPhaseFields',
				mode: 'add',
				fieldWords: {
					singular: 'field',
					plural: 'fields',
				},
				addAllFields: true,
				noFieldsError: 'No fields found',
			},
			loadOptionsDependsOn: ['phaseId', 'updateOperation'],
		},
		displayOptions: {
			show: {
				phaseId: [
					{
						_cnd: {
							gt: constants.phaseIdLength,
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
		operation: ['updateFields'],
	},
};

export const description = updateDisplayOptions(displayOptions, properties);

export async function execute(this: IExecuteFunctions): Promise<INodeExecutionData[]> {
	const cardId = this.getNodeParameter('cardId', 0) as string;

	const updateOperation = this.getNodeParameter('updateOperation', 0) as
		| 'add'
		| 'remove'
		| 'replace';

	const fields = this.getNodeParameter('fields', 0) as ResourceMapperValue;

	const nodeValueInputs = resourceMapperValueToPipefyAttributes(fields).map(
		({ field_id: fieldId, field_value: value }) => ({
			fieldId,
			value,
			operation: updateOperation.toUpperCase(),
		}),
	);

	const { updateFieldsValues } = (await graphQlRequest({
		ctx: this,
		query: `
    mutation updateCardFields($cardId: ID!, $nodeValueInputs: [NodeFieldValueInput!]!) {
      updateFieldsValues(input: { nodeId: $cardId, values: $nodeValueInputs }) {
        success
        userErrors {
          field
          message
        }
      }
    }
    `,
		variables: { cardId, nodeValueInputs },
	})) as {
		updateFieldsValues:
			| { success: false; userErrors: { field: string; message: string }[] }
			| {
					success: true;
					userErrors: null;
			  };
	};

	if (!updateFieldsValues.success)
		throw new NodeApiError(this.getNode(), {
			message: "Couldn't update the card's fields",
			description: JSON.stringify(updateFieldsValues.userErrors, null, 2),
		});

	return this.helpers.returnJsonArray(updateFieldsValues);
}
