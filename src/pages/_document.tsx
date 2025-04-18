'use client';

import { Head, Html, Main, NextScript } from 'next/document';

export const metadata = {
    title: 'MAYZ - OTC',
    description: 'OTC service of MAYZ protocol',
    applicationName: 'MAYZ - OTC',
    themeColor: '#ffffff',
};

export default function Document() {
    return (
        <Html lang="en">
            <Head>
                <meta name="description" content={metadata.description} />
                <meta name="application-name" content={metadata.applicationName} />
                <meta name="theme-color" content={metadata.themeColor} />
                <link rel="icon" type='image/ico' href="icon.ico" />
                {/* <link rel="manifest" href="/site.webmanifest" /> */}
                {/* <link rel="mask-icon" href="/safari-pinned-tab.svg" color="#f0a500" /> */}
                <meta charSet="UTF-8" />
                <meta name="viewport" content="width=device-width, initial-scale=1" />
                <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
            </Head>
            <body>
                <Main />
                <NextScript />
            </body>
        </Html>
    );
}
