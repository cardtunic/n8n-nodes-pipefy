import { IExecuteFunctions, INodeExecutionData } from 'n8n-workflow';
import { PipefyType } from './node.type';

import * as attachment from './attachments/Attachment.resource';
import * as card from './card/Card.resource';
import * as pipe from './pipe/Pipe.resource';
import * as user from './user/User.resource';
import * as webhook from './webhook/Webhook.resource';

export async function router(
	this: IExecuteFunctions,
	itemIndex: number,
): Promise<INodeExecutionData> {
	const resource = this.getNodeParameter<PipefyType>('resource', itemIndex);
	const operation = this.getNodeParameter('operation', itemIndex);

	const pipefyNodeData = { resource, operation } as PipefyType;

	let responseData: INodeExecutionData = { json: {} };

	switch (pipefyNodeData.resource) {
		case 'user':
			responseData = await user[pipefyNodeData.operation].execute.call(this);
			break;

		case 'pipe':
			responseData = await pipe[pipefyNodeData.operation].execute.call(this, itemIndex);
			break;

		case 'card':
			responseData = await card[pipefyNodeData.operation].execute.call(this, itemIndex);
			break;

		case 'attachment':
			responseData = await attachment[pipefyNodeData.operation].execute.call(this, itemIndex);
			break;

		case 'webhook':
			responseData = await webhook[pipefyNodeData.operation].execute.call(this, itemIndex);
	}

	return responseData;
}
