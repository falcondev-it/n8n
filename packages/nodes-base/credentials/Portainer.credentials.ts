import {
	ICredentialType,
	NodePropertyTypes,
} from 'n8n-workflow';

export class Portainer implements ICredentialType {
	name = 'portainer';
	displayName = 'Portainer';
	documentationUrl = 'Portainer';
	properties = [
		{
			displayName: 'API Key',
			name: 'apiKey',
			type: 'string' as NodePropertyTypes,
			default: '',
		},
		{
			displayName: 'Endpoint',
			name: 'endpoint',
			type: 'string' as NodePropertyTypes,
			default: '',
		},
	];
}
