import { IExecuteFunctions } from 'n8n-core';
import {
	IDataObject,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
	NodeOperationError,
} from 'n8n-workflow';
import { sendMessage, markAsRead } from './executions';

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
				displayName: 'Business Number ID',
				name: 'number_id',
				type: 'string',
				default: '',
				required: true,
				description: 'Your business phone number',
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
				displayName: 'Message',
				name: 'message',
				type: 'string',
				default: '',
				required: true,
				description: 'The message to be sent',
				typeOptions: {
					rows: 4,
				},
				displayOptions: {
					show: {
						operation: ['send_message'],
					},
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
		console.log('Items: ', items);

		const credentials = (await this.getCredentials('whatsappCredentialsApi')) as IDataObject;
		const wppToken = credentials.wppToken;

		const operation = this.getNodeParameter('operation', 0) as string;

		switch (operation) {
			case 'send_message':
				const response = [];
				for (let i = 0; i < items.length; i++) {
					const number_id = this.getNodeParameter('number_id', 0) as string;
					const to_number = this.getNodeParameter('to_number', 0) as string;
					const message = this.getNodeParameter('message', i) as string;
					const buttonsui = this.getNodeParameter('buttonsui', i);

					const resp = await sendMessage(
						message,
						to_number,
						number_id,
						buttonsui,
						wppToken as IDataObject,
						this,
					);
					response.push(resp);
				}
				return [this.helpers.returnJsonArray(response)];

			case 'mark_as_read':
				return await markAsRead(this, wppToken as IDataObject);
			default:
				throw new NodeOperationError(
					this.getNode(),
					`The operation "${operation}" is not supported!`,
				);
		}
	}
}
