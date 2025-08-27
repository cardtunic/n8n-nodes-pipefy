import { INodeProperties } from 'n8n-workflow';

import * as createPresignedUrl from './createPresignedUrl.operation';
import * as uploadFile from './uploadFile.operation';

export { createPresignedUrl, uploadFile };

export const description: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		default: 'createPresignedUrl',
		options: [
			{
				name: 'Create Presigned URL',
				value: 'createPresignedUrl',
				description: 'Creates a presigned URL to upload a file to Pipefy',
				action: 'Create presigned URL',
			},
			{
				name: 'Upload File',
				value: 'uploadFile',
				description: 'Sends a PUT request to upload a file to a created presigned URL',
				action: 'Upload file',
			},
		],
		displayOptions: {
			show: {
				resource: ['attachment'],
			},
		},
	},

	...createPresignedUrl.description,
	...uploadFile.description,
];
