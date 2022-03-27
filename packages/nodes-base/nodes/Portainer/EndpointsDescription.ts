import { ILoadOptionsFunctions, INodeProperties, INodePropertyOptions } from "n8n-workflow";
import { IWorkspaceDto } from "../Clockify/WorkpaceInterfaces";
import { portainerApiRequest } from "./GenericFunctions";
import { Endpoint } from "./Interfaces";

export const endpointsProperties: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		displayOptions: {
			show: {
				resource: [
					'endpoints',
				],
			},
		},
		options: [
			{
				name: 'Execute Docker Request',
				value: 'docker',
			}
		],
		default: 'docker',
		description: 'The operation to perform.',
	},

	// docker
	{
		displayName: 'Endpoint',
		name: 'endpoint',
		type: 'options',
		required: true,
		default: '',
		typeOptions: {
			loadOptionsMethod: 'loadEndpoints'
		},
		displayOptions: {
			show: {
				resource: [
					'endpoints',
				],
				operation: [
					'docker',
				],
			},
		},
	},
	{
		displayName: 'Method',
		name: 'method',
		type: 'options',
		required: true,
		default: 'GET',
		options: [
			{
				name: 'GET',
				value: 'GET'
			},
			{
				name: 'POST',
				value: 'POST'
			},
			{
				name: 'PUT',
				value: 'PUT'
			},
			{
				name: 'DELETE',
				value: 'DELETE'
			},
		],
		displayOptions: {
			show: {
				resource: [
					'endpoints',
				],
				operation: [
					'docker',
				],
			},
		},
	},
	{
		displayName: 'Path',
		name: 'path',
		type: 'string',
		required: true,
		default: '',
		displayOptions: {
			show: {
				resource: [
					'endpoints',
				],
				operation: [
					'docker',
				],
			},
		},
	},
	{
		displayName: 'Body',
		name: 'body',
		type: 'json',
		required: true,
		default: '',
		displayOptions: {
			show: {
				resource: [
					'endpoints',
				],
				operation: [
					'docker',
				],
			},
		},
	},
];

export const endpointsLoadOptions: { [key: string]: (this: ILoadOptionsFunctions) => Promise<INodePropertyOptions[]>; } = {
	async loadEndpoints(this) {
		const options: INodePropertyOptions[] = [];
		const endpoints: Endpoint[] = await portainerApiRequest.call(this, 'GET', '/endpoints');
		if (endpoints !== undefined) {
			endpoints.forEach(value => {
				options.push(
					{
						name: value.Name,
						value: value.Id,
					});
			});
		}
		return options;
	}
}
