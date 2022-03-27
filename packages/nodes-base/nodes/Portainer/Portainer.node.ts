import {
	IExecuteFunctions,
} from 'n8n-core';

import {
	IDataObject,
	IHookFunctions,
	ILoadOptionsFunctions,
	INodeExecutionData,
	INodePropertyOptions,
	INodeType,
	INodeTypeDescription,
	IWebhookSetupMethods,
} from 'n8n-workflow';

import {
	OptionsWithUri,
} from 'request';
import { endpointsLoadOptions, endpointsProperties } from './EndpointsDescription';
import { portainerApiRequest } from './GenericFunctions';

export class Portainer implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Portainer',
		name: 'portainer',
		icon: 'file:portainer.svg',
		group: ['output'],
		version: 1,
		description: 'Consume Portainer API',
		defaults: {
			name: 'Portainer',
			color: '#13bef9'
		},
		inputs: ['main'],
		outputs: ['main'],
		credentials: [
			{
				name: 'portainer',
				required: true
			}
		],
		properties: [
			{
				displayName: 'Resource',
				name: 'resource',
				type: 'options',
				options: [
					{
						name: 'Custom Templates',
						value: 'custom_templates',
					},
					{
						name: 'Edge Groups',
						value: 'edge_groups',
					},
					{
						name: 'Edge Jobs',
						value: 'edge_jobs',
					},
					{
						name: 'Edge Stacks',
						value: 'edge_stacks',
					},
					{
						name: 'Edge Templates',
						value: 'edge_templates',
					},
					{
						name: 'Edge',
						value: 'edge',
					},
					{
						name: 'Endpoints',
						value: 'endpoints',
					},
					{
						name: 'Endpoint Groups',
						value: 'endpoint_groups',
					},
					{
						name: 'Kubernetes',
						value: 'kubernetes',
					},
					{
						name: 'Motd',
						value: 'motd',
					},
					{
						name: 'Registries',
						value: 'registries',
					},
					{
						name: 'Resource Controls',
						value: 'resource_controls',
					},
					{
						name: 'Roles',
						value: 'Roles',
					},
					{
						name: 'Settings',
						value: 'settings',
					},
					{
						name: 'Status',
						value: 'status',
					},
					{
						name: 'Users',
						value: 'users',
					},
					{
						name: 'Tags',
						value: 'tags',
					},
					{
						name: 'Teams',
						value: 'teams',
					},
					{
						name: 'Team Memberships',
						value: 'team_memberships',
					},
					{
						name: 'Templates',
						value: 'templates',
					},
					{
						name: 'Stacks',
						value: 'stacks',
					},
					{
						name: 'SSL',
						value: 'ssl',
					},
					{
						name: 'Upload',
						value: 'upload',
					},
					{
						name: 'Webhooks',
						value: 'webhooks',
					},
					{
						name: 'Websocket',
						value: 'websocket',
					},
					{
						name: 'Backup',
						value: 'backup',
					},
					{
						name: 'Helm',
						value: 'helm',
					},
					{
						name: 'LDAP',
						value: 'ldap',
					},
					{
						name: 'Helm Chart',
						value: 'helm_chart',
					}
				],
				default: 'endpoints',
				description: 'The resource to operate on.',
			},
			...endpointsProperties
		],
	}
	methods = {
		loadOptions: {
			...endpointsLoadOptions
		}
	}

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {

		const items = this.getInputData();
		let responseData;
		const returnData = [];
		const resource = this.getNodeParameter('resource', 0) as string;
		const operation = this.getNodeParameter('operation', 0) as string;
		const credentials = await this.getCredentials('portainer') as IDataObject;

		for (let i = 0; i < items.length; i++) {
			if (resource === 'endpoints') {
				if (operation === 'docker') {

					const endpoint = this.getNodeParameter('endpoint', i) as number
					const path = this.getNodeParameter('path', i) as string;
					const body = this.getNodeParameter('body', i) as IDataObject;
					const method = this.getNodeParameter('method', i) as string;

					responseData = await portainerApiRequest.call(this, method, `/endpoints/${endpoint}/docker${path}`, body)
					returnData.push(responseData);
				}
			}
		}
		// Map data to n8n data structure
		return [this.helpers.returnJsonArray(returnData)];

	}
}
