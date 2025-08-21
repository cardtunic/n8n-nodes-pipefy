import { ILoadOptionsFunctions, ResourceMapperField, ResourceMapperFields } from 'n8n-workflow';
import { graphQlRequest } from '../transport';

type PipefyFieldType =
	| 'assignee_select'
	| 'attachment'
	| 'checklist_horizontal'
	| 'checklist_vertical'
	| 'cnpj'
	| 'connector'
	| 'cpf'
	| 'currency'
	| 'date'
	| 'datetime'
	| 'due_date'
	| 'email'
	| 'id'
	| 'label_select'
	| 'long_text'
	| 'number'
	| 'phone'
	| 'radio_horizontal'
	| 'radio_vertical'
	| 'select'
	| 'short_text'
	| 'statement'
	| 'time'
	| 'formula'
	| 'dynamic_content';

type PipefyField = {
	id: string;
	label: string;
	options: string[];
	required: boolean;
	type: PipefyFieldType;
};

function mapPipefyFieldType({
	type,
	id,
	label,
	options,
	required,
}: PipefyField): (ResourceMapperField & { pipefyType: PipefyFieldType }) | null {
	const field: Pick<
		ResourceMapperField,
		'id' | 'required' | 'displayName' | 'display' | 'defaultMatch'
	> & { pipefyType: PipefyFieldType } = {
		id,
		required,
		displayName: `${label} (${type})`,
		display: true,
		defaultMatch: false,
		pipefyType: type,
	};

	if (
		(['cnpj', 'cpf', 'email', 'long_text', 'phone', 'short_text'] as PipefyFieldType[]).includes(
			type,
		)
	)
		return { ...field, type: 'string' };

	if ((['radio_horizontal', 'radio_vertical', 'select'] as PipefyFieldType[]).includes(type))
		return {
			...field,
			type: 'options',
			options: options.map((option) => ({ value: option, name: option })),
		};

	if (
		(
			[
				'attachment',
				'assignee_select',
				'checklist_horizontal',
				'checklist_vertical',
				'label_select',
				'connector',
			] as PipefyFieldType[]
		).includes(type)
	)
		return { ...field, type: 'array' };

	if ((['currency', 'number'] as PipefyFieldType[]).includes(type))
		return { ...field, type: 'number' };

	if ((['datetime', 'date', 'due_date'] as PipefyFieldType[]).includes(type))
		return { ...field, type: 'dateTime' };

	if ((['time'] as PipefyFieldType[]).includes(type)) return { ...field, type: 'time' };

	return null;
}

export async function getStartFormFields(
	this: ILoadOptionsFunctions,
): Promise<ResourceMapperFields> {
	const pipeId = this.getNodeParameter('pipeId') as string;

	const {
		pipe: { start_form_fields: fields },
	} = (await graphQlRequest({
		ctx: this,
		query: `
    query getStartFormFields($pipeId: ID!) {
      pipe(id: $pipeId) {
        start_form_fields {
          id
          label
          options
          required
          type
        }
      }
    }`,
		variables: { pipeId },
	})) as {
		pipe: {
			start_form_fields: PipefyField[];
		};
	};

	return {
		fields: fields.map(mapPipefyFieldType).filter((field) => field !== null),
	};
}

export async function getPhaseFields(this: ILoadOptionsFunctions): Promise<ResourceMapperFields> {
	const phaseId = this.getNodeParameter('phaseId') as string;
	const updateOperation = this.getNodeParameter('updateOperation') as string;

	const listFieldTypes = [
		'attachment',
		'assignee_select',
		'checklist_horizontal',
		'checklist_vertical',
		'label_select',
	] as PipefyFieldType[];

	const {
		phase: { fields },
	} = (await graphQlRequest({
		ctx: this,
		query: `
    query getPhaseFields($phaseId: ID!) {
      phase(id: $phaseId) {
        fields {
          type
          options
          label
          id
        }
      }
    }`,
		variables: { phaseId },
	})) as { phase: { fields: Omit<PipefyField, 'required'>[] } };

	return {
		fields: fields
			.map((field) => mapPipefyFieldType({ ...field, required: false }))
			.filter((field) => field !== null)
			.filter((field) => {
				if (updateOperation === 'add' || updateOperation === 'remove') {
					return listFieldTypes.includes(field.pipefyType);
				} else return true;
			}),
	};
}
