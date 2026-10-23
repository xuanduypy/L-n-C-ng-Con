import type { IncomingMessage, ServerResponse } from 'http';
import { handleApiRoute } from '../src/server/apiHandler';

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  const url = req.url || '';
  const pathname = url.split('?')[0];

  try {
    const handled = await handleApiRoute(req, res, pathname);
    if (!handled) {
      res.writeHead(404, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Endpoint not found' }));
    }
  } catch (err: any) {
    console.error('Serverless API error:', err);
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: err.message || 'Internal Server Error' }));
  }
}
