import {
	IDisplayOptions,
	IExecuteFunctions,
	INodeExecutionData,
	INodeProperties,
	updateDisplayOptions,
} from 'n8n-workflow';
import { graphQlRequest } from '../../transport';

const properties: INodeProperties[] = [
	{
		displayName: 'Pipe ID',
		name: 'pipeId',
		type: 'string',
		default: '',
		required: true,
	},
	{
		displayName: 'Include Labels?',
		name: 'getLabelsEnabled',
		type: 'boolean',
		default: false,
		description: 'Whether to return the labels of the pipe',
	},
	{
		displayName: 'Include Members?',
		name: 'getMembersEnabled',
		type: 'boolean',
		default: false,
		description: 'Whether to return the members of the pipe',
	},
	{
		displayName: 'Include Phases?',
		name: 'getPhasesEnabled',
		type: 'boolean',
		default: false,
		description: 'Whether to return the phases of the pipe',
	},
	{
		displayName: 'Include Webhooks?',
		name: 'getWebhooksEnabled',
		type: 'boolean',
		default: false,
		description: 'Whether to return the webhooks of the pipe',
	},
];

const optionalQueryParts = properties
	.filter((prop) => prop.type === 'boolean')
	.map((prop) => prop.name);

const queryParts = {
	getLabelsEnabled: `
  labels {
    color
    id
    name
  }`,
	getMembersEnabled: `
  members {
    billable
    customRole
    role_name
    user {
      id
      email
      displayName
      avatarUrl
      name
      currentOrganizationRole
      departmentKey
      invited
      phone
      username
    }
  }
  `,
	getPhasesEnabled: `
  phases {
    can_receive_card_directly_from_draft
    cards_count
    color
    created_at
    custom_sorting_preferences
    description
    done
    expiredCardsCount
    id
    identifyTask
    index
    isDraft
    lateCardsCount
    lateness_time
    name
    next_phase_ids
    previous_phase_ids
    repo_id
    sequentialId
    uuid
  }
  `,
	getWebhooksEnabled: `
  webhooks {
    email
    filters
    headers
    id
    name
    url
  }
  `,
};

const displayOptions: IDisplayOptions = {
	show: {
		resource: ['pipe'],
		operation: ['get'],
	},
};

export const description = updateDisplayOptions(displayOptions, properties);

export async function execute(
	this: IExecuteFunctions,
	itemIndex: number,
): Promise<INodeExecutionData> {
	const pipeId = this.getNodeParameter('pipeId', itemIndex) as string;

	const optionalQueryPart = optionalQueryParts
		.map((part) => {
			const isPartEnabled = (this.getNodeParameter(part, itemIndex) as boolean) === true;

			if (isPartEnabled) return queryParts[part as keyof typeof queryParts];

			return '';
		})
		.join('');

	const responseData = await graphQlRequest({
		ctx: this,
		query: `
    query getPipe($pipeId: ID!) {
      pipe(id: $pipeId) {
        anyone_can_create_card
        canBeTagged
        cards_count
        clone_from_id
        color
        conditionExpressionsFieldIds
        countOnlyWeekDays
        create_card_label
        created_at
        description
        emailAddress
        expiration_time_by_unit
        expiration_unit
        icon
        id
        last_updated_by_card
        name
        noun
        only_admin_can_remove_cards
        only_assignees_can_edit_cards
        opened_cards_count
        organizationId
        public
        public_form
        public_form_active
        reachedConcurrentBulkActionsLimit
        role
        startFormPhaseId
        suid
        type
        users_count
        uuid
        organization {
          id
          name
        }
        ${optionalQueryPart}
      }
    }`,
		variables: { pipeId },
	});

	return { json: { ...(responseData.pipe as any) } };
}
