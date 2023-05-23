import { ICredentialType, INodeProperties } from 'n8n-workflow';

export class DialogflowApi implements ICredentialType {
	name = 'dialogflowCredentialsApi';
	displayName = 'Dialogflow API';
	documentationUrl = '<your-docs-url>';
	properties: INodeProperties[] = [
		{
			displayName: 'Project ID',
			name: 'project_id',
			type: 'string',
			default: '',
		},
		{
			displayName: 'Credentials JSON',
			name: 'credentials_json',
			type: 'json',
			default: '',
		},
	];
}
