import { IExecuteFunctions, INodeExecutionData } from 'n8n-workflow';
import { graphQlRequest } from '../../transport';

export async function execute(this: IExecuteFunctions): Promise<INodeExecutionData[]> {
	const responseData = await graphQlRequest({
		ctx: this,
		query: `{ me { id name email username } }`,
	});

	return this.helpers.returnJsonArray(responseData);
}
