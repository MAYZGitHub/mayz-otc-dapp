import { initBackEnd } from '@/lib/SmartDB/backEnd';
import { NextApiRequest, NextApiResponse } from 'next';
import { NextApiRequestAuthenticated, smartDBMainApiHandler } from 'smart-db/backEnd';
import { parse } from 'querystring';

// This function call must be included in every backend file, as it initializes the backend environment.
// It loads all necessary configurations, decorators, and registries for entities and backend handlers.
// Calling `initBackEnd()` ensures the backend is correctly set up and ready to handle requests.
initBackEnd();

// export const config = {
//     api: {
//         // The `bodyParser: false` setting disables the default body parser for API requests.
//         // This may be necessary when working with custom request formats or file uploads.
//         bodyParser: false,
//     },
// };

// // The `smartDBMainApiHandler` handles all API requests for the backend.
// // It acts as the main handler for incoming requests, routing them according to the defined endpoints,
// // and processing them using the SmartDB framework.
// export default smartDBMainApiHandler.bind(smartDBMainApiHandler);

export const config = {
    api: {
        bodyParser: false,
    },
};

async function parseFormBody(req: NextApiRequest): Promise<Record<string, string>> {
    return new Promise((resolve, reject) => {
        let body = '';
        req.on('data', (chunk) => (body += chunk));
        req.on('end', () => {
            try {
                const raw = parse(body); // type: Record<string, string | string[]>
                const parsed: Record<string, string> = {};

                for (const key in raw) {
                    const val = raw[key];
                    parsed[key] = Array.isArray(val) ? val[0] : val ?? '';
                }

                resolve(parsed);
            } catch (err) {
                reject(err);
            }
        });
    });
}

export default async function handler(req: NextApiRequestAuthenticated, res: NextApiResponse) {
    const action = req.query.nextauth?.[0];

    if (action === '_log') {
        // Handle _log manually (optional: log, ignore, or respond with noop)
        if (req.method === 'POST' && req.headers['content-type']?.startsWith('application/x-www-form-urlencoded')) {
            const parsed = await parseFormBody(req);
            console.log('[NextAuth _log]', parsed); // or handle how you want
        }
        res.status(204).end(); // no content
        return;
    }

    // Default handling for all other /auth/* actions
    return smartDBMainApiHandler(req, res);
}
