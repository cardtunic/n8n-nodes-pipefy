import { ILoadOptionsFunctions, INodePropertyOptions } from 'n8n-workflow';
import { graphQlRequest } from '../transport';
import { PipefyField } from '../types';

export async function getOrgs(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
	const { organizations } = (await graphQlRequest({
		ctx: this,
		query: `
    query {
      organizations {
        id,
        name
      }
    }
    `,
	})) as { organizations: { id: string; name: string }[] };

	return organizations.map((org) => ({ name: org.name, value: org.id }));
}

export async function getOrgPipes(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
	const orgId = this.getNodeParameter('orgId', 0) as string;

	const {
		organization: { pipes },
	} = (await graphQlRequest({
		ctx: this,
		query: `
    query getOrgPipes($orgId: ID!) {
      organization(id: $orgId) {
        pipes {
          id
          name
        }
      }
      
    }`,
		variables: { orgId },
	})) as { organization: { pipes: { id: string; name: string }[] } };

	return pipes.map((pipe) => ({ name: pipe.name, value: pipe.id }));
}

export async function getPipePhases(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
	const cardId = this.getNodeParameter('cardId', 0) as string;

	const {
		card: {
			pipe: { phases },
		},
	} = (await graphQlRequest({
		ctx: this,
		query: `
    query getPipePhases($cardId: ID!) {
      card(id: $cardId) {
        pipe {
          phases {
            id
            name
          }
        }
      }
    }`,
		variables: { cardId },
	})) as { card: { pipe: { phases: { id: string; name: string }[] } } };

	return phases.map((phase) => ({ name: phase.name, value: phase.id }));
}

export async function getCardPipeLabels(
	this: ILoadOptionsFunctions,
): Promise<INodePropertyOptions[]> {
	const cardId = this.getNodeParameter('cardId', 0) as string;

	const {
		card: {
			pipe: { labels },
		},
	} = (await graphQlRequest({
		ctx: this,
		query: `
    query getCardPipeLabels($cardId: ID!) {
      card(id: $cardId) {
        pipe {
          labels {
            id
            name
          }
        }
      }
    }`,
		variables: { cardId },
	})) as { card: { pipe: { labels: { id: string; name: string }[] } } };

	return labels.map((label) => ({ name: label.name, value: label.id }));
}

export async function getCardPipeMembers(
	this: ILoadOptionsFunctions,
): Promise<INodePropertyOptions[]> {
	const cardId = this.getNodeParameter('cardId', 0) as string;

	const {
		card: {
			pipe: { members },
		},
	} = (await graphQlRequest({
		ctx: this,
		query: `
    query getCardPipeMembers($cardId: ID!) {
      card(id: $cardId) {
        pipe {
          members {
            user {
              id
              name
            }
          }
        }
      }
    }`,
		variables: { cardId },
	})) as { card: { pipe: { members: { user: { id: string; name: string } }[] } } };

	return members.map((member) => ({ name: member.user.name, value: member.user.id }));
}

export async function getCardPipeRelations(
	this: ILoadOptionsFunctions,
): Promise<INodePropertyOptions[]> {
	const cardId = this.getNodeParameter('cardId', 0) as string;

	const {
		card: {
			pipe: { childrenRelations },
		},
	} = (await graphQlRequest({
		ctx: this,
		query: `
    query getCardPipeRelations($cardId: ID!) {
      card(id: $cardId) {
        pipe {
          childrenRelations {
            id
            name
          }
        }
      }
    }
    `,
		variables: { cardId },
	})) as { card: { pipe: { childrenRelations: { id: string; name: string }[] } } };

	return childrenRelations.map((relation) => ({ name: relation.name, value: relation.id }));
}

export async function getPhaseRelationFields(
	this: ILoadOptionsFunctions,
): Promise<INodePropertyOptions[]> {
	const phaseId = this.getNodeParameter('phaseId', 0) as string;

	const {
		phase: { fields },
	} = (await graphQlRequest({
		ctx: this,
		query: `
      query getPhaseFields($phaseId: ID!) {
        phase(id: $phaseId) {
          fields {
            type
            label
            internal_id
          }
        }
      }`,
		variables: { phaseId },
	})) as { phase: { fields: (Pick<PipefyField, 'type' | 'label'> & { internal_id: string })[] } };

	return fields
		.filter((field) => field.type === 'connector')
		.map((field) => ({ name: field.label, value: field.internal_id }));
}
