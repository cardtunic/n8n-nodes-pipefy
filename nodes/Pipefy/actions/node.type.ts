import { AllEntities } from 'n8n-workflow';

type NodeMap = {
	card: 'get' | 'create' | 'move' | 'updateFields' | 'update' | 'destroy' | 'createRelation';
	pipe: 'get';
	user: 'getCurrent';
	attachment: 'createPresignedUrl' | 'uploadFile';
	webhook: 'getFromOrg' | 'getFromPipe' | 'destroy' | 'createInOrg' | 'createInPipe';
};

export type PipefyType = AllEntities<NodeMap>;
