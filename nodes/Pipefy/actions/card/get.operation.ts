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
		displayName: 'Card ID',
		name: 'cardId',
		type: 'string',
		default: '',
		required: true,
		description:
			"You can find the card's ID in the URL when you're viewing it in the browser. https://app.pipefy.com/open-cards/[ID].",
		hint: 'The ID of the card to get',
	},
	{
		displayName: 'Include Asignees?',
		name: 'getAssigneesEnabled',
		type: 'boolean',
		default: false,
		description: 'Whether to return the assignees of the card',
	},
	{
		displayName: 'Include Attachments?',
		name: 'getAttachmentsEnabled',
		type: 'boolean',
		default: false,
		description: 'Whether to return the attachments of the card',
	},
	{
		displayName: 'Include Comments?',
		name: 'getCommentsEnabled',
		type: 'boolean',
		default: false,
		description: 'Whether to return the comments of the card',
	},
	{
		displayName: 'Include Fields?',
		name: 'getFieldsEnabled',
		type: 'boolean',
		default: false,
		description: 'Whether to return the fields of the card',
	},
	{
		displayName: 'Include Labels?',
		name: 'getLabelsEnabled',
		type: 'boolean',
		default: false,
		description: 'Whether to return the labels of the card',
	},
	{
		displayName: 'Include Inbox Emails?',
		name: 'getInboxEmailsEnabled',
		type: 'boolean',
		default: false,
		description: 'Whether to return the emails in card inbox',
	},
	{
		displayName: 'Include Phases History?',
		name: 'getPhasesHistoryEnabled',
		type: 'boolean',
		default: false,
		description: 'Whether to return the phases history of the card',
	},
];

const displayOptions: IDisplayOptions = {
	show: {
		resource: ['card'],
		operation: ['get'],
	},
};

export const description = updateDisplayOptions(displayOptions, properties);

const optionalQueryParts = [
	'getAssigneesEnabled',
	'getAttachmentsEnabled',
	'getCommentsEnabled',
	'getFieldsEnabled',
	'getLabelsEnabled',
	'getInboxEmailsEnabled',
	'getPhasesHistoryEnabled',
] as const;

type OptionalQueryPart = (typeof optionalQueryParts)[number];

const queryParts: Record<OptionalQueryPart, string> = {
	getAssigneesEnabled: `
    assignees {
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
    }`,
	getAttachmentsEnabled: `
    attachments {
      createdAt
      field {
        id
      }
      url
    }`,
	getCommentsEnabled: `
    comments {
      id
      text
      author {
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
    }`,
	getFieldsEnabled: `
    fields {
      array_value
      value
      date_value
      datetime_value
      filled_at
      float_value
      name
      native_value
      report_value
      updated_at
      label_values {
        color
        id
        name
      }
      field {
        id
        deleted
        index
        index_name
        internal_id
        label
        options
        settings
        type
        uuid
      }
      assignee_values {
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
    }`,
	getLabelsEnabled: `
    labels {
      color
      id
      name
    }`,
	getInboxEmailsEnabled: `
    inbox_emails {
      attachments {
        fileUrl
        filename
        public_url
        id
        originalFilename
      }
      bcc
      body
      cc
      clean_body
      clean_html
      clean_text
      created_at
      from
      fromName
      id
      main_to
      message_id
      raw_headers
      raw_html
      sent_via_automation
      state
      subject
      to
      type
      updated_at
    }
  `,
	getPhasesHistoryEnabled: `
    phases_history {
      became_late
      created_at
      draft
      duration
      firstTimeIn
      lastTimeIn
      lastTimeOut
      phase {
        id
        isDraft
        name
        next_phase_ids
        previous_phase_ids
        done
      }
    }
  `,
};

export async function execute(
	this: IExecuteFunctions,
	itemIndex: number,
): Promise<INodeExecutionData> {
	const cardId = this.getNodeParameter('cardId', itemIndex) as string;

	const optionalQueryPart = optionalQueryParts
		.map((part) => {
			const isPartEnabled = (this.getNodeParameter(part, itemIndex) as boolean) === true;

			if (isPartEnabled) return queryParts[part];

			return '';
		})
		.join('');

	const responseData = await graphQlRequest({
		ctx: this,
		query: `
    query getCard($cardId: ID!) {
      card(id: $cardId) {
        id
        age
        checklist_items_checked_count
        checklist_items_count
        createdAt
        createdBy {
          id
          email
          displayName
          avatarUrl
          name
          departmentKey
          invited
          phone
          username
          currentOrganizationRole
        }
        currentLateness {
          becameLateAt
          id
          shouldBecomeLateAt
          sla
        }
        current_phase {
          id
          isDraft
          name
          next_phase_ids
          previous_phase_ids
          done
        }
        current_phase_age
        done
        due_date
        emailMessagingAddress
        expiration {
          expiredAt
          shouldExpireAt
        }
        expired
        finished_at
        late
        overdue
        public_form_submitter_email
        started_current_phase_at
        suid
        title
        updated_at
        url
        uuid
        ${optionalQueryPart}
      }
    }`,
		variables: { cardId },
	});

	return { json: responseData };
}
