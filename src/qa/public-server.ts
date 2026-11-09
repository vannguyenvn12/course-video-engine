import {createServer} from 'node:http';
import {join} from 'node:path';
import {promises as fs} from 'node:fs';

const contentTypes: Record<string, string> = {
  '.html': 'text/html; charset=utf-8',
  '.woff2': 'font/woff2',
  '.png': 'image/png',
};

export const startPublicServer = async (): Promise<{
  baseUrl: string;
  close: () => Promise<void>;
}> => {
  const publicDir = join(process.cwd(), 'public');
  const server = createServer(async (req, res) => {
    try {
      const pathname = decodeURIComponent(new URL(req.url ?? '/', 'http://local').pathname);
      const safe = pathname.replace(/\.\./g, '');
      const filePath = join(publicDir, safe === '/' ? 'measure/font-still.html' : safe);
      const data = await fs.readFile(filePath);
      const ext = filePath.slice(filePath.lastIndexOf('.'));
      res.writeHead(200, {'Content-Type': contentTypes[ext] ?? 'application/octet-stream'});
      res.end(data);
    } catch {
      res.writeHead(404);
      res.end('Not found');
    }
  });
  await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', () => resolve()));
  const addr = server.address();
  if (!addr || typeof addr === 'string') {
    throw new Error('Failed to bind public server');
  }
  const baseUrl = `http://127.0.0.1:${addr.port}`;
  return {
    baseUrl,
    close: () => new Promise((resolve, reject) => server.close((err) => (err ? reject(err) : resolve()))),
  };
};
