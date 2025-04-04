/** @type {import('next').NextConfig} */

const path = require('path');
// const { join } = require('path');
// const { access, symlink } = require('fs/promises');

const nextConfig = {
    //-------------
    // PRODUCTION
    // swcMinify: true,
    // reactStrictMode: true,
    //-------------
    // DEV
    swcMinify: true,
    reactStrictMode: false,
    //-------------
    images: {
        domains: ['localhost', 'ipfs.io', 'taptools.io', 'taptools-public.s3.amazonaws.com', 'img.cexplorer.io', 'github.com', 's3.amazonaws.com'],
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'github.com',
                pathname: '/**',
            },
        ],
    },
    generateBuildId: async () => {
        // Generate your build ID here if needed
        // Return a unique value for each build, like a timestamp
        return new Date().getTime().toString();
    },
    experimental: {
        // appDir: true,
        // serverActions: true, // <-- add this for mongoose and next13
        // esmExternals: true, // <-- add this for mongoose and next13
        // serverComponentsExternalPackages:['mongoose'] // <-- add this for mongoose and next13 '@typegoose/typegoose'
    },
    webpack: (config, { dev, isServer }) => {
        config.stats = 'verbose'; // or 'errors-only', 'minimal', etc.

        config.resolve.alias['@'] = path.resolve(__dirname, './src/');

        config.experiments = {
            asyncWebAssembly: true,
            syncWebAssembly: true,
            topLevelAwait: true,
            layers: true, // optional, with some bundlers/frameworks it doesn't work without
        };

        // This allows you to omit extensions when importing ES modules
        config.resolve.fullySpecified = false;

        // Evitar las advertencias críticas sin desactivar completamente los módulos
        config.module.parser = {
            javascript: {
                exprContextCritical: false, // Esto elimina las advertencias de dependencias críticas
            },
        };

        if (isServer) {
            config.externals.push('formidable');
            config.resolve.fallback = {
                ...config.resolve.fallback,
                // Disable 'react-native-sqlite-storage' and other packages
                'react-native-sqlite-storage': false,
                fs: false,
                net: false,
                tls: false,
                kerberos: false,
                '@mongodb-js/zstd': false,
                '@aws-sdk/credential-providers': false,
                snappy: false,
                aws4: false,
                'mongodb-client-encryption': false,
                '@google-cloud/spanner': false,
                '@sap/hana-client': false,
                'hdb-pool': false,
                mysql: false,
                mysql2: false,
                oracledb: false,
                'pg-native': false,
                'pg-query-stream': false,
                redis: false,
                ioredis: false,
                'better-sqlite3': false,
                sqlite3: false,
                'sql.js': false,
                mssql: false,
                'typeorm-aurora-data-api-driver': false,
            };
        }

        if (dev) {
            config.devtool = 'eval-source-map'; // Fast for development
        } else {
            config.devtool = 'source-map'; // Detailed for production
        }
        
        // config.plugins.push(
        //     //NOTE: para que anda cardano serialization lib browser y se agregue wasm en next static server
        //     new (class {
        //         apply(compiler) {
        //             compiler.hooks.afterEmit.tapPromise('SymlinkWebpackPlugin', async (compiler) => {
        //                 if (isServer) {
        //                     const from = join(compiler.options.output.path, '../static');
        //                     const to = join(compiler.options.output.path, 'static');

        //                     try {
        //                         await access(from);
        //                         // console.log(`${from} already exists`);
        //                         return;
        //                     } catch (error) {
        //                         if (error.code === 'ENOENT') {
        //                             // No link exists
        //                         } else {
        //                             throw error;
        //                         }
        //                     }

        //                     await symlink(to, from, 'junction');
        //                     console.log(`created symlink ${from} -> ${to}`);
        //                 }
        //             });
        //         }
        //     })()
        // );
        return config;
    },
    async headers() {
        return [
            // {
            //     // Global headers applied to all routes
            //     source: '/:path*',
            //     headers: [
            //         // Clickjacking protection
            //         { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
            //         // XSS Protection for older browsers
            //         { key: 'X-XSS-Protection', value: '1; mode=block' },
            //         // Enforce the use of HTTPS
            //         { key: 'Strict-Transport-Security', value: 'max-age=31536000; includeSubDomains; preload' },
            //         // Referrer Policy for privacy and security
            //         { key: 'Referrer-Policy', value: 'no-referrer-when-downgrade' },
            //         // Content Security Policy to prevent XSS and data injection attacks
            //         // WARNING: This is an example. You need to tailor the CSP for your application's needs.
            //         {
            //             key: 'Content-Security-Policy',
            //             value: "default-src 'self'; script-src 'self' https://apis.google.com; img-src 'self' https://img.cexplorer.io; style-src 'self' 'unsafe-inline';",
            //         },
            //         // Permissions Policy to disable unused browser features
            //         { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
            //     ],
            // },
            {
                // Specific headers for /uploads path
                source: '/uploads/:path*',
                headers: [
                    { key: 'X-Content-Type-Options', value: 'nosniff' },
                    // You could add more specific headers here if needed
                ],
            },
        ];
    },
};

module.exports = nextConfig;
