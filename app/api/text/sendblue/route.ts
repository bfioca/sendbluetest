import { NextRequest } from 'next/server';
import sendblue from '@/lib/sendblue';

import * as fs from 'fs';
import * as path from 'path';


export async function POST(request: NextRequest) {
  const postJSON = await request.json();

  console.debug('Received a message from Sendblue: ', postJSON);

  // Extract relevant information from the payload
  const { number, content } = postJSON;

  console.log(`Received message from ${number}: ${content}`);
  const message = 'This is a test response from the Sendblue Test App.';

  // test sending typing indicator
  if (process.env.TYPING_INDICATOR === 'true') {
    await sendblue.sendTypingIndicator(number);
    await new Promise((resolve) => setTimeout(resolve, 2000));
  }

  const messageId = generateId();

  const success = await sendBlue(number, message, null, messageId);

  const isDelivered = await checkAndResendBlue(messageId, number, message);

  if (!isDelivered) {
    console.error(`Failed to deliver message after multiple attempts`);
    return false;
  }

  // Return a response to avoid multiple webhook calls from Sendblue
  if (success) {
    console.debug('Sent message successfully');
    return new Response(null, { status: 200, statusText: 'Received' });
  } else {
    console.error('Failed to send message');
    return new Response(null, { status: 500, statusText: 'FAILED' });
  }
}

// simulate generating a unique id from the database
function generateId(): string {
  return 'xxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

async function sendBlue(
  phone: string,
  message: string,
  mediaUrl: string[] | null = null,
  callbackMessageId: string | null = null
) {
  const response = await sendblue.sendMessage(
    phone,
    message,
    null,
    mediaUrl ? mediaUrl[0] : null,
    callbackMessageId
  );
  console.debug('Sendblue response: ', response);
  return response;
}

// Function to check the delivery status and retry sending the SMS
async function checkAndResendBlue(
  messageId: string,
  phone: string,
  message: string,
  retries: number = 2
): Promise<boolean> {

  // wait for 10 seconds for sendblue callback to be received
  await new Promise((resolve) => setTimeout(resolve, 10000));

  console.log('Checking message status: ', messageId);
  // fetch the message status
  const delivered = hasMessageBeenDelivered(messageId);

  if (!delivered) {
    console.info('Message not delivered. Resending...');
    await sendBlue(phone, message, null, messageId);
    return await checkAndResendBlue(messageId, phone, message, retries - 1);
  } else if (retries <= 0) {
    console.error('Failed to deliver message after multiple attempts');
    return false;
  }

  return true;
}

// see if the callback endpoint handler has written the file
function hasMessageBeenDelivered(id: string): boolean {
  const tempDir = '/tmp';
  const fileName = `${id}.message`;
  const filePath = path.join(tempDir, fileName);

  return fs.existsSync(filePath);
}
