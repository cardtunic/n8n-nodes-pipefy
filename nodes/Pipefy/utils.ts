import { ResourceMapperValue } from 'n8n-workflow';

export function resourceMapperValueToPipefyAttributes({ value }: ResourceMapperValue) {
	return Object.entries(value ?? {})
		.filter(([, value]) => value !== null)
		.map(([key, value]) => ({
			field_id: key,
			field_value: value as string | string[] | number[] | number,
		}));
}
