![Banner image](https://user-images.githubusercontent.com/10284570/173569848-c624317f-42b1-45a6-ab09-f0ea3c247648.png)

# N8N Bot Nodes

This repo contains various nodes made specifically for the creation of chatbots, including:

- WhatsApp Node: Allows the use of the Cloud API to send and receive messages, including sending button messages.
- Dialogflow Node: Enables the integration with the Dialogflow platform for creating conversations.

## Credentials

### WhatsApp

1. Create a [Meta for Developers](https://developers.facebook.com/) App
2. Enable WhatsApp in the App
3. Copy the temporary **Access Token** (it will be used for testing purposes)
4. Add a test number
5. Configure the WebHook by setting the Return URL to the N8N Node URL
6. Configure the WebHook by defining a **Verify Token** (functions like a password, can be anything)
7. Start testing the integration
8. Generate a [Permanent Access Token](https://developers.facebook.com/docs/whatsapp/business-management-api/get-started#user-access-tokens)

### Dialogflow

1. Copy the **Project ID** in the Dialogflow's Agent configuration page
2. Create a **Creadential JSON Key** inside the corresponding Google Project. Allow the permission to manage Dialogflow projects.

## License

[MIT](https://github.com/n8n-io/n8n-nodes-starter/blob/master/LICENSE.md)
