import { NextRequest } from 'next/server';

import * as fs from 'fs';
import * as path from 'path';

/**
 * Called when sendblue receives a message
 * https://sendblue.co/docs/outbound/
 */
export async function POST(request: NextRequest, { params }: { params: { messageId: string } }) {
  const messageId = params.messageId;
  const postJSON = await request.json();

  console.debug('Received a callback from Sendblue: ', postJSON);

  // Extract relevant information from the payload
  const { status } = postJSON;

  if (messageId && status && status === 'DELIVERED') {
    await receivedMessage(messageId);

    console.debug('UPDATED MESSAGE');
  }

  return new Response(null, { status: 200 });
}

function receivedMessage(id: string): void {
  // Just write the message id to a temp file so the other process can see it
  const tempDir = '/tmp';
  const fileName = `${id}.message`;
  const filePath = path.join(tempDir, fileName);

  fs.writeFileSync(filePath, '');
}
