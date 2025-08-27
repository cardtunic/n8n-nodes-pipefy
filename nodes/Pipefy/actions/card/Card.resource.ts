import { INodeProperties } from 'n8n-workflow';

import * as create from './create.operation';
import * as createRelation from './createRelation.operation';
import * as destroy from './destroy.operation';
import * as get from './get.operation';
import * as move from './move.operation';
import * as update from './update.operation';
import * as updateFields from './updateFields.operation';

export { create, createRelation, destroy, get, move, update, updateFields };

export const description: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		options: [
			{
				name: 'Create',
				value: 'create',
				action: 'Create card',
				description: 'Creates a card',
			},
			{
				name: 'Create Relation',
				value: 'createRelation',
				action: 'Create card relation',
				description: 'Creates a relation between one card and another',
			},
			{
				name: 'Delete',
				value: 'destroy',
				action: 'Delete card',
				description: 'Deletes a given card',
			},
			{
				name: 'Get',
				value: 'get',
				action: 'Get card',
				description: 'Gets a card by ID',
			},
			{
				name: 'Get Many',
				value: 'getMany',
				action: 'Get many cards',
				description: 'Lists all cards inside a given pipe',
			},
			{
				name: 'Move',
				value: 'move',
				action: 'Move card',
				description: 'Moves a card to a given phase',
			},
			{
				name: 'Update',
				value: 'update',
				action: 'Update card',
				description: 'Updates a given card',
			},
			{
				name: 'Update Fields',
				value: 'updateFields',
				action: 'Update card fields',
				description: 'Updates the fields of a given card',
			},
		],
		default: 'get',
		displayOptions: {
			show: {
				resource: ['card'],
			},
		},
	},

	...get.description,
	...move.description,
	...create.description,
	...update.description,
	...updateFields.description,
	...destroy.description,
	...createRelation.description,
];
