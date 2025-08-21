export type PipefyFieldType =
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

export type PipefyField = {
	id: string;
	label: string;
	options: string[];
	required: boolean;
	type: PipefyFieldType;
};
