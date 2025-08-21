import {
	IDisplayOptions,
	IExecuteFunctions,
	INodeExecutionData,
	INodeProperties,
	updateDisplayOptions,
} from 'n8n-workflow';
import { uploadFile } from '../../transport';

const properties: INodeProperties[] = [
	{
		displayName: 'Presigned URL',
		name: 'presignedUrl',
		type: 'string',
		default: '',
		required: true,
		hint: 'The presigned URL of the file to upload',
	},
	{
		displayName: 'ℹ️ You can ge the presigned URL with the "Create presigned URL" operation.',
		name: 'notice',
		type: 'notice',
		default: '',
	},
	{
		displayName: 'Binary field name',
		name: 'binaryFieldName',
		type: 'string',
		default: '',
		required: true,
		hint: 'The name of the field that contains the binary data to be uploaded',
	},
];

const displayOptions: IDisplayOptions = {
	show: {
		resource: ['attachment'],
		operation: ['uploadFile'],
	},
};

export const description = updateDisplayOptions(displayOptions, properties);

export async function execute(this: IExecuteFunctions): Promise<INodeExecutionData[]> {
	const presignedUrl = this.getNodeParameter('presignedUrl', 0) as string;
	const binaryFieldName = this.getNodeParameter('binaryFieldName', 0) as string;

	const binaryDataInfo = this.helpers.assertBinaryData(0, binaryFieldName);
	const binaryData = (await this.helpers.getBinaryDataBuffer(0, binaryFieldName)) as ArrayBuffer;

	await uploadFile({
		ctx: this,
		presignedUrl,
		buffer: binaryData,
		mimeType: binaryDataInfo.mimeType,
	});

	return this.helpers.returnJsonArray({});
}
