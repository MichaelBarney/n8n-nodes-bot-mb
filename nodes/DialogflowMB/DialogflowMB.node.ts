import { IExecuteFunctions } from 'n8n-core';
import { IDataObject, INodeExecutionData, INodeType, INodeTypeDescription } from 'n8n-workflow';

import dialogflow from '@google-cloud/dialogflow';

export class DialogflowMB implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Dialogflow MB',
		name: 'dialogflowMB',
		icon: 'file:Dialogflow.svg',
		group: ['transform'],
		version: 1,
		subtitle: '={{$parameter["operation"]}}',
		description: 'Use Dialogflow',
		defaults: {
			name: 'Dialogflow',
		},
		inputs: ['main'],
		outputs: ['main'],
		credentials: [
			{
				name: 'dialogflowCredentialsApi',
				required: true,
			},
		],

		properties: [
			{
				displayName: 'User ID',
				name: 'user_id',
				type: 'string',
				default: '',
				required: true,
				description: 'Identification for the User',
			},
			{
				displayName: 'Input Text',
				name: 'input_text',
				type: 'string',
				default: '',
				required: true,
				description: 'The text to be processed',
			},
			{
				displayName: 'Contexts',
				name: 'contextUi',
				placeholder: 'Add Context',
				type: 'fixedCollection',
				default: '',
				typeOptions: {
					multipleValues: true,
				},
				description: '',
				options: [
					{
						name: 'contextValues',
						displayName: 'Context',
						values: [
							{
								displayName: 'Name',
								name: 'name',
								type: 'string',
								default: '',
							},
							{
								displayName: 'Lifespan',
								name: 'lifespan',
								type: 'number',
								default: 5,
							},
						],
					},
				],
			},
		],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const credentials = (await this.getCredentials('dialogflowCredentialsApi')) as IDataObject;
		const credentialsJSON = JSON.parse(credentials.credentials_json as string);
		const projectId = credentials.project_id as string;

		const user_id = this.getNodeParameter('user_id', 0) as string;
		const input_text = this.getNodeParameter('input_text', 0) as string;

		const dialogflogSessionClient = new dialogflow.SessionsClient({
			credentials: credentialsJSON,
		});

		const contextUi = this.getNodeParameter('contextUi', 0) as any;

		const contexts = contextUi.contextValues.map((context: any) => {
			return {
				name: dialogflogSessionClient.projectAgentSessionContextPath(
					projectId,
					user_id,
					context.name,
				),
				parameters: {},
				lifespanCount: context.lifespan,
			};
		});

		const dialogflowSessionPath = dialogflogSessionClient.projectAgentSessionPath(
			projectId,
			user_id,
		);
		const dialogflowRequestParams = {
			session: dialogflowSessionPath,
			queryInput: {
				text: {
					text: input_text,
					languageCode: 'pt-BR',
				},
			},
			queryParams: {
				contexts: contexts, // Add the context to the query parameters
			},
		};
		const dialogflowRequest = await dialogflogSessionClient.detectIntent(dialogflowRequestParams);

		// get messages
		const dialogflowResponses = dialogflowRequest[0].queryResult?.fulfillmentMessages;
		const intent = dialogflowRequest[0].queryResult?.intent?.displayName;
		const action = dialogflowRequest[0].queryResult?.action;
		const parameters = dialogflowRequest[0].queryResult?.parameters;

		const responseTexts = dialogflowResponses?.map((response) => {
			return {
				text: response?.text?.text?.[0],
				intent,
				action,
				parameters,
			};
		});

		// return response
		if (responseTexts) {
			return [this.helpers.returnJsonArray(responseTexts)];
		}
		return [];
	}
}
