import { IExecuteFunctions } from 'n8n-core';
import {
	IDataObject,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
	NodeOperationError,
} from 'n8n-workflow';
import { sendSessionMessage, sendTemplateMessage, markAsRead } from './executions';

export class WhatsAppMB implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'WhatsApp MB',
		name: 'whatsAppMB',
		icon: 'file:WhatsAppMB.svg',
		group: ['transform'],
		version: 1,
		subtitle: '={{$parameter["operation"]}}',
		description: 'Use WhatsApp Cloud API',
		defaults: {
			name: 'WhatsApp MB',
		},
		inputs: ['main'],
		outputs: ['main'],
		credentials: [
			{
				name: 'whatsappCredentialsApi',
				required: true,
			},
		],

		properties: [
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				options: [
					{
						name: 'Send Message',
						value: 'send_message',
						action: 'Send message',
					},
					{
						name: 'Mark as Read',
						value: 'mark_as_read',
						action: 'Mark as read',
					},
				],
				default: 'send_message',
			},
			{
				displayName: 'To Number',
				name: 'to_number',
				type: 'string',
				default: '',
				required: true,
				description: 'The destination phone number',
				displayOptions: {
					show: {
						operation: ['send_message'],
					},
				},
			},
			{
				displayName: 'Message ID',
				name: 'message_id',
				type: 'string',
				default: '',
				required: true,
				description: 'The Received Message ID',
				displayOptions: {
					show: {
						operation: ['mark_as_read'],
					},
				},
			},
			{
				displayName: 'Message Type',
				name: 'message_type',
				type: 'options',
				noDataExpression: true,
				options: [
					{
						name: 'Session',
						value: 'session',
					},
					{
						name: 'Template',
						value: 'template',
					},
				],
				default: 'session',
				displayOptions: {
					show: {
						operation: ['send_message'],
					},
				},
			},
			{
				displayName: 'Message Text',
				name: 'message',
				type: 'string',
				default: '',
				required: true,
				description: 'The message text to be sent',
				typeOptions: {
					rows: 4,
				},
				displayOptions: {
					show: {
						operation: ['send_message'],
						message_type: ['session'],
					},
				},
			},
			{
				displayName: 'Template Name',
				name: 'template',
				type: 'string',
				default: '',
				required: true,
				description: 'The template name to be sent',
				displayOptions: {
					show: {
						operation: ['send_message'],
						message_type: ['template'],
					},
				},
			},
			{
				displayName: 'Language Code',
				name: 'language_code',
				type: 'string',
				default: '',
				required: true,
				description: 'The language code of the template',
				displayOptions: {
					show: {
						operation: ['send_message'],
						message_type: ['template'],
					},
				},
			},
			{
				displayName: 'Components',
				name: 'template_components',
				type: 'json',
				default: '[]',
				required: true,
				description: 'Custom compoenents of the template',
				displayOptions: {
					show: {
						operation: ['send_message'],
						message_type: ['template'],
					},
				},
				typeOptions: {
					rows: 4,
				},
			},
			{
				displayName: 'Buttons',
				name: 'buttonsui',
				placeholder: 'Add Buttons',
				type: 'fixedCollection',
				default: {},
				typeOptions: {
					multipleValues: true,
				},
				displayOptions: {
					show: {
						operation: ['send_message'],
					},
				},
				options: [
					{
						name: 'button',
						displayName: 'Button',
						values: [
							{
								displayName: 'Text',
								name: 'text',
								type: 'string',
								default: '',
							},
						],
					},
				],
			},
		],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();

		const credentials = (await this.getCredentials('whatsappCredentialsApi')) as IDataObject;
		const wppToken = credentials.wppToken as IDataObject;
		const number_id = credentials.number_id as IDataObject;

		const operation = this.getNodeParameter('operation', 0) as string;

		switch (operation) {
			case 'send_message':
				const response = [];
				for (let i = 0; i < items.length; i++) {
					const message_type = this.getNodeParameter('message_type', 0) as string;

					if (message_type === 'session') {
						const message = this.getNodeParameter('message', i) as string;
						const buttonsui = this.getNodeParameter('buttonsui', i);
						const to_number = this.getNodeParameter('to_number', i) as string;

						const resp = await sendSessionMessage(
							message,
							to_number,
							number_id,
							buttonsui,
							wppToken,
							this,
						);
						response.push(resp);
					} else if (message_type === 'template') {
						const template = this.getNodeParameter('template', i) as string;
						const language_code = this.getNodeParameter('language_code', i) as string;
						const components = this.getNodeParameter('template_components', i) as IDataObject;
						const to_number = this.getNodeParameter('to_number', i) as string;

						const resp = await sendTemplateMessage(
							template,
							language_code,
							components,
							to_number,
							number_id,
							wppToken as IDataObject,
							this,
						);
						response.push(resp);
					}
				}
				return [this.helpers.returnJsonArray(response)];

			case 'mark_as_read':
				return await markAsRead(this, wppToken as IDataObject, number_id);
			default:
				throw new NodeOperationError(
					this.getNode(),
					`The operation "${operation}" is not supported!`,
				);
		}
	}
}
