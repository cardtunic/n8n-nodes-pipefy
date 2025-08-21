import { AllEntities } from 'n8n-workflow';

type NodeMap = {
	card: 'get' | 'create' | 'move' | 'updateFields' | 'update' | 'destroy' | 'createRelation';
	org: 'getMany' | 'get';
	pipe: 'getMany' | 'get';
	user: 'getCurrent';
};

export type PipefyType = AllEntities<NodeMap>;
