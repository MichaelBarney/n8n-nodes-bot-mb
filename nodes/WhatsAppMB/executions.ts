import {
	IExecuteFunctions,
	INodeExecutionData,
	IHttpRequestOptions,
	IDataObject,
} from 'n8n-workflow';

export const markAsRead = async (
	execution: IExecuteFunctions,
	wppToken: IDataObject,
): Promise<INodeExecutionData[][]> => {
	const msgId = execution.getNodeParameter('message_id', 0) as string;
	const fromNumber = execution.getNodeParameter('number_id', 0) as string;

	// Mark the message as read
	const options: IHttpRequestOptions = {
		headers: {
			Accept: 'application/json',
		},
		method: 'POST',
		body: {
			messaging_product: 'whatsapp',
			status: 'read',
			message_id: msgId,
		},
		url: 'https://graph.facebook.com/v12.0/' + fromNumber + '/messages?access_token=' + wppToken,
		json: true,
	};

	try {
		const response = await execution.helpers.httpRequest(options);
		console.log('Marked as read: ', response);
		return [execution.helpers.returnJsonArray([response])];
	} catch (error) {
		console.log(error);
		return [execution.helpers.returnJsonArray([error])];
	}
};

export const sendMessage = async (
	msg_body: string,
	to_number: string,
	number_id: string,
	buttonsui: any,
	wppToken: IDataObject,
	execution: IExecuteFunctions,
): Promise<INodeExecutionData> => {
	let type = 'text';

	if (buttonsui.button?.length > 0) {
		type = 'button';
		if (buttonsui.button.length > 3) {
			type = 'list';
		}
	}

	console.log('Collection: ', buttonsui);

	console.log(to_number, number_id, wppToken, msg_body);

	const requestBody = {
		messaging_product: 'whatsapp',
		to: to_number,
		text: { body: msg_body },

		// if type is interactive, add buttons
		...((type === 'button' || type === 'list') && {
			type: 'interactive',
			interactive: {
				type,
				body: {
					text: msg_body,
				},
				action: {
					buttons: buttonsui.button.map((button: any) => {
						return {
							type: 'reply',
							reply: {
								title: button.text,
								id: button.text,
							},
						};
					}),
				},
			},
		}),
	};

	console.log('Request Body Changed: ', JSON.stringify(requestBody));

	const options: IHttpRequestOptions = {
		headers: {
			Accept: 'application/json',
		},
		method: 'POST',
		body: requestBody,
		url: 'https://graph.facebook.com/v12.0/' + number_id + '/messages?access_token=' + wppToken,
		json: true,
	};

	try {
		console.log('Sending message...');
		const response = await execution.helpers.httpRequest(options);
		console.log('Sent: ', response);
		return response;
	} catch (error) {
		console.log(error);
		return error;
	}
};
