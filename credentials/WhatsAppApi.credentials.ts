import {
	IAuthenticateGeneric,
	// ICredentialTestRequest,
	ICredentialType,
	INodeProperties,
} from 'n8n-workflow';

export class WhatsAppApi implements ICredentialType {
	name = 'whatsappCredentialsApi';
	displayName = 'WhatsApp Cloud API';
	documentationUrl = 'https://github.com/MichaelBarney/n8n-nodes-bot-mb#readme';
	properties: INodeProperties[] = [
		{
			displayName: 'WhatsApp Token',
			name: 'wppToken',
			type: 'string',
			default: '',
		},
		{
			displayName: 'Verify Token',
			name: 'verifyToken',
			type: 'string',
			default: '',
		},
		{
			displayName: 'Business Number ID',
			name: 'number_id',
			type: 'string',
			default: '',
			required: true,
			description: 'Your business phone number',
		},
	];

	// This allows the credential to be used by other parts of n8n
	// stating how this credential is injected as part of the request
	// An example is the Http Request node that can make generic calls
	// reusing this credential
	authenticate: IAuthenticateGeneric = {
		type: 'generic',
		properties: {
			headers: {
				Authorization: '={{"Bearer " + $credentials.token}}',
			},
		},
	};

	// The block below tells how this credential can be tested
	// test: ICredentialTestRequest = {
	// 	request: {
	// 		baseURL: '={{$credentials?.domain}}',
	// 		url: '/bearer',
	// 	},
	// };
}
