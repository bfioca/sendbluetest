/* eslint-disable @typescript-eslint/no-explicit-any */

// FROM https://github.com/sendblue-api/sendblue-node
type RequestMethod = 'get' | 'post' | 'delete';
type ModifyType = 'add' | 'remove'; // Replace with actual modify types if available

const apiKey = <string>process.env.SENDBLUE_API_KEY;
const apiSecret = <string>process.env.SENDBLUE_API_SECRET;
export const statusCallbackBase = `${process.env.SERVER_URL}/api/text/sendblue/`;

export class Sendblue {
  private baseUrl: string;
  private headers: Record<string, string>;

  constructor(apiKey: string, apiSecret: string) {
    this.baseUrl = 'https://api.sendblue.co';
    this.headers = {
      'sb-api-key-id': apiKey,
      'sb-api-secret-key': apiSecret,
      'Content-Type': 'application/json'
    };
  }

  async request(method: RequestMethod, endpoint: string, data: any = null): Promise<any> {
    const url = `${this.baseUrl}${endpoint}`;

    const response = await fetch(url, {
      method: method.toUpperCase(),
      body: data ? JSON.stringify(data) : null,
      headers: this.headers
    });

    try {
      return response.ok ? response.json() : Promise.reject(response);
    } catch (err) {
      const errorText = await response.text();
      console.error(err, errorText);
      throw err;
    }
  }

  async sendMessage(
    number: string,
    content: string,
    sendStyle: string | null = null,
    mediaUrl: string | null = null,
    callbackMessageId: string | null
  ): Promise<any> {
    const data = {
      number,
      content,
      send_style: sendStyle,
      media_url: mediaUrl,
      status_callback: callbackMessageId ? `${statusCallbackBase}${callbackMessageId}` : null
    };
    return this.request('post', '/api/send-message', data);
  }

  async sendGroupMessage(
    numbers: string[],
    content: string,
    groupId: string | null = null,
    sendStyle: string | null = null,
    mediaUrl: string | null = null,
    callbackMessageId: string | null
  ): Promise<any> {
    const data = {
      numbers,
      group_id: groupId,
      content,
      send_style: sendStyle,
      media_url: mediaUrl,
      status_callback: callbackMessageId ? `${statusCallbackBase}${callbackMessageId}` : null
    };
    return this.request('post', '/api/send-group-message', data);
  }

  async getMessage(messageId: string): Promise<any> {
    return this.request('get', `/api/message/${messageId}`);
  }

  async modifyGroup(groupId: string, modifyType: ModifyType, number: string): Promise<any> {
    const data = {
      group_id: groupId,
      modify_type: modifyType,
      number
    };
    return this.request('post', '/modify-group', data);
  }

  async lookup(number: string): Promise<any> {
    return this.request('get', `/api/evaluate-service?number=${number}`);
  }

  async sendTypingIndicator(number: string): Promise<any> {
    const data = { number };
    return this.request('post', `/api/send-typing-indicator?number=${number}`, data);
  }

  async getContacts(): Promise<any> {
    return this.request('get', '/accounts/contacts');
  }

  async createContact(
    number: string,
    firstName: string | null = null,
    lastName: string | null = null,
    companyName: string | null = null
  ): Promise<any> {
    const data = {
      number,
      firstName,
      lastName,
      companyName
    };
    return this.request('post', '/accounts/contacts', data);
  }

  async deleteContact(contactId: string): Promise<any> {
    return this.request('delete', `/accounts/contacts/${contactId}`);
  }

  async getMessages(contactId: string): Promise<any> {
    return this.request('get', `/accounts/messages?cid=${contactId}`);
  }
}

const sendblue = new Sendblue(apiKey, apiSecret);

export default sendblue;
