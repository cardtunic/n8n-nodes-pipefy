import {
	IDisplayOptions,
	IExecuteFunctions,
	INodeExecutionData,
	INodeProperties,
	ResourceMapperValue,
	updateDisplayOptions,
} from 'n8n-workflow';
import { graphQlRequest } from '../../transport';
import { resourceMapperValueToPipefyAttributes } from '../../utils';

const properties: INodeProperties[] = [
	{
		displayName: 'Org ID',
		name: 'orgId',
		type: 'options',
		default: '',
		required: true,
		description: 'The ID of the organization to get the pipes from',
		typeOptions: {
			loadOptionsMethod: 'getOrgs',
		},
	},
	{
		displayName: 'Pipe ID',
		name: 'pipeId',
		type: 'options',
		default: '',
		required: true,
		description: 'The ID of the pipe to get the cards from',
		typeOptions: {
			loadOptionsMethod: 'getOrgPipes',
			loadOptionsDependsOn: ['orgId'],
		},
		displayOptions: {
			show: {
				orgId: [
					{
						_cnd: {
							gt: 0,
						},
					},
				],
			},
		},
	},
	{
		displayName: 'Title',
		name: 'title',
		type: 'string',
		default: '',
		required: true,
		hint: 'The title of the new card',
		displayOptions: {
			show: {
				pipeId: [
					{
						_cnd: {
							gt: 0,
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
				resourceMapperMethod: 'getStartFormFields',
				mode: 'add',
				fieldWords: {
					singular: 'field',
					plural: 'fields',
				},
				addAllFields: true,
				noFieldsError: 'No fields found',
			},
			loadOptionsDependsOn: ['pipeId'],
		},
		displayOptions: {
			show: {
				pipeId: [
					{
						_cnd: {
							gt: 0,
						},
					},
				],
			},
		},
	},
];

const displayOptions: IDisplayOptions = {
	show: {
		resource: ['card'],
		operation: ['create'],
	},
};

export const description = updateDisplayOptions(displayOptions, properties);

export async function execute(
	this: IExecuteFunctions,
	itemIndex: number,
): Promise<INodeExecutionData> {
	const pipeId = this.getNodeParameter('pipeId', itemIndex) as string;
	const title = this.getNodeParameter('title', itemIndex) as string;
	const fields = this.getNodeParameter('fields', itemIndex) as ResourceMapperValue;

	const attributes = resourceMapperValueToPipefyAttributes(fields);

	const responseData = await graphQlRequest({
		ctx: this,
		query: `
	  mutation createCard($pipeId: ID!, $title: String!, $attributes: [FieldValueInput]) {
	    createCard(input: { pipe_id: $pipeId, title: $title, fields_attributes: $attributes }) {
	      card {
	        id
	      }
	    }
	  }`,
		variables: { pipeId, title, attributes },
	});

	return { json: responseData };
}
