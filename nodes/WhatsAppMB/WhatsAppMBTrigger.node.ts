import { IWebhookFunctions } from 'n8n-core';
import { IDataObject, INodeType, INodeTypeDescription, IWebhookResponseData } from 'n8n-workflow';
// import { OptionsWithUri } from 'request-promise-native';

export class WhatsAppMBTrigger implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'WhatsApp MB Trigger',
		name: 'whatsAppMBTrigger',
		icon: 'file:WhatsAppMB.svg',
		group: ['trigger'],
		version: 1,
		subtitle: '={{$parameter["operation"]}}',
		description: 'Use WhatsApp Cloud API',
		defaults: {
			name: 'WhatsApp MB',
		},
		inputs: [],
		outputs: ['main', 'main'], // eslint-disable-line
		outputNames: ['message', 'status'],
		credentials: [
			{
				name: 'whatsappCredentialsApi',
				required: true,
			},
		],
		webhooks: [
			{
				name: 'default',
				httpMethod: '={{$parameter["operation"] == "verify_token" ? "GET" : "POST"}}',
				responseMode: 'onReceived',
				isFullPath: true,
				path: 'whatsappMB',
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
						name: 'Token Verification',
						value: 'verify_token',
						action: 'Token verification',
					},
					{
						name: 'Receive Message',
						value: 'receive_message',
						action: 'Receive message',
					},
				],
				default: 'verify_token',
			},
		],
	};

	async webhook(this: IWebhookFunctions): Promise<IWebhookResponseData> {
		const req = this.getRequestObject();
		const resp = this.getResponseObject();

		const operation = this.getNodeParameter('operation') as string;
		console.log('Operation: ', operation);

		const credentials = (await this.getCredentials('whatsappCredentialsApi')) as IDataObject;
		const verifyToken = credentials.verifyToken;

		// Verification
		if (operation == 'verify_token') {
			let mode = req.query['hub.mode'];
			let receivedToken = req.query['hub.verify_token'];
			let challenge = req.query['hub.challenge'];

			if (mode === 'subscribe' && receivedToken === verifyToken) {
				return {
					webhookResponse: challenge,
					workflowData: [this.helpers.returnJsonArray(req.body)],
				};
			}

			resp.writeHead(401);
			resp.end('Authorization Error');
			return {
				noWebhookResponse: true,
			};
		}

		// Receive Message
		else if (operation == 'receive_message') {
			const entries = req.body.entry;
			console.log('Changes: ', entries[0].changes);
			console.log('Statuses: ', entries[0].changes[0].value.statuses);

			const changes = entries[0].changes;

			const receivedMessages = [];
			const receivedStatuses = [];

			for (const change of changes) {
				const messages = change.value.messages;
				if (messages !== undefined) {
					for (const message of messages) {
						let businessNumberId = change.value.metadata.phone_number_id;
						let from = message.from; // extract the phone number from the webhook payload
						let text = message.text.body;
						const id = message.id;
						receivedMessages.push({ businessNumberId, from, text, id });
					}
				}

				const statuses = change.value.statuses;
				if (statuses !== undefined) {
					for (const status of statuses) {
						const businessNumberId = change.value.metadata.phone_number_id;
						const statusName = status.status;
						const recipientId = status.recipient_id;
						receivedStatuses.push({ businessNumberId, statusName, recipientId });
					}
				}
			}

			resp.writeHead(200);
			resp.end('Success');

			return {
				noWebhookResponse: true,
				workflowData: [
					this.helpers.returnJsonArray(receivedMessages),
					this.helpers.returnJsonArray(receivedStatuses),
				],
			};
		} else
			return {
				noWebhookResponse: true,
			};
	}
}
