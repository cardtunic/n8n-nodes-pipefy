import { IExecuteFunctions, INodeExecutionData } from 'n8n-workflow';
import { PipefyType } from './node.type';

import * as attachment from './attachments/Attachment.resource';
import * as card from './card/Card.resource';
import * as pipe from './pipe/Pipe.resource';
import * as user from './user/User.resource';

export async function router(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
	const resource = this.getNodeParameter<PipefyType>('resource', 0);
	const operation = this.getNodeParameter('operation', 0);

	const pipefyNodeData = { resource, operation } as PipefyType;

	let responseData: INodeExecutionData[] = [];

	switch (pipefyNodeData.resource) {
		case 'user':
			responseData = await user[pipefyNodeData.operation].execute.call(this);
			break;

		case 'pipe':
			responseData = await pipe[pipefyNodeData.operation].execute.call(this);
			break;

		case 'card':
			responseData = await card[pipefyNodeData.operation].execute.call(this);
			break;

		case 'attachment':
			responseData = await attachment[pipefyNodeData.operation].execute.call(this);
	}

	return [responseData];
}
