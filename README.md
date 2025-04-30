<a id="readme-top"></a>

<!-- PROJECT SHIELDS -->

[![Contributors][contributors-shield]][contributors-url]
[![Forks][forks-shield]][forks-url]
[![Stargazers][stars-shield]][stars-url]
[![Issues][issues-shield]][issues-url]
[![License][license-shield]][license-url]
[![LinkedIn][linkedin-shield]][linkedin-url]

<!-- PROJECT LOGO -->
<br />
<div align="center">
  <a href="https://github.com/MAYZGitHub/mayz-otc-dapp">
    <img src="https://www.mayz.io/img/logo/logo.svg" alt="Logo" width="300" height="120">
  </a>

  <h3 align="center">MAYZ OTC DApp</h3>

  <p align="center">
    A trustless, decentralized OTC smart contract solution for Cardano.
    <br />
    <a href="https://github.com/MAYZGitHub/mayz-otc-dapp"><strong>Explore the docs »</strong></a>
    <br />
    <br />
    <a href="https://github.com/MAYZGitHub/mayz-otc-dapp">View Demo</a>
    ·
    <a href="https://github.com/MAYZGitHub/mayz-otc-dapp/issues/new?labels=bug&template=bug-report---.md">Report Bug</a>
    ·
    <a href="https://github.com/MAYZGitHub/mayz-otc-dapp/issues/new?labels=enhancement&template=feature-request---.md">Request Feature</a>
  </p>
</div>

<!-- TABLE OF CONTENTS -->
<details>
  <summary>Table of Contents</summary>
  <ol>
    <li><a href="#about-the-project">About The Project</a></li>
    <li><a href="#built-with">Built With</a></li>
    <li><a href="#getting-started">Getting Started</a></li>
    <li><a href="#usage">Usage</a></li>
    <li><a href="#environment-variables">Environment Variables</a></li>
    <li><a href="#roadmap">Roadmap</a></li>
    <li><a href="#contributing">Contributing</a></li>
    <li><a href="#license">License</a></li>
    <li><a href="#contact">Contact</a></li>
    <li><a href="#acknowledgments">Acknowledgments</a></li>

  </ol>
</details>

<!-- ABOUT THE PROJECT -->

## About The Project

[![Product Name Screen Shot][product-screenshot]](https://github.com/MAYZGitHub/mayz-otc-dapp)

MAYZ Trustless OTC Smart Contract aims to solve liquidity and slippage issues for large transactions on Cardano by implementing a decentralized, non-custodial OTC solution. Users can execute high-volume trades without directly relying on DEX liquidity, minimizing slippage and creating a more efficient trading experience.

The UI consists of three main tabs:

-   **Admin Panel**: Create and configure new OTC protocols.
-   **Manage Positions**: Manage your tokens and open OTC positions.
-   **Available Claims**: Claim OTC deals when holding the correct tokens in your wallet.

<p align="right">(<a href="#readme-top">back to top</a>)</p>

### Built With

-   [![Next][Next.js]][Next-url]
-   [![React][React.js]][React-url]
-   [![TypeScript][TypeScript-shield]][TypeScript-url]
-   [SmartDb](https://github.com/protofire/Cardano-SmartDB/tree/main) by Protofire

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- GETTING STARTED -->

## Getting Started

To set up a local copy, follow these simple steps:

### Prerequisites

-   npm
    ```sh
    npm install npm@latest -g
    ```

### Installation

1. Clone the repository
    ```sh
    git clone https://github.com/MAYZGitHub/mayz-otc-dapp.git
    ```
2. Install NPM packages
    ```sh
    npm install
    ```
3. Create `.env.local` and configure environment variables as needed:

Example:

```bash
NEXT_PUBLIC_PROYECT_NAME=MAYZ-OTC-DAPP
NEXT_PUBLIC_CARDANO_NET=Emulator
USE_DATABASE=postgresql
DB_USE_TRANSACTIONS=true
...
```

4. Start the development server
    ```sh
    npm run dev
    ```

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- USAGE EXAMPLES -->

## Usage

Once the development server is running:

-   Navigate to the Admin tab to create OTC protocols.
-   Manage your open positions and tokens in "Manage Positions".
-   Claim OTC deals in the "Available Claims" tab.

For production deployment, ensure environment variables are set correctly according to the network (Mainnet, Preprod, Preview, Emulator).

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- ENVIRONMENT VARIABLES -->
## Environment Variables

You must configure a `.env.local` file. Below is an explanation of the key fields:

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_PROYECT_NAME` | Project name identifier. |
| `NEXT_PUBLIC_CARDANO_NET` | Cardano network: `Emulator`, `Mainnet`, `Preview`, `Preprod`, or `Custom`. |
| `NEXT_PUBLIC_BLOCKFROST_URL_*` | Blockfrost API URLs for various networks. |
| `BLOCKFROST_KEY_*` | Your Blockfrost API keys for each network. |
| `NEXT_PUBLIC_REACT_SERVER_URL` | URL of your local server (default: `http://localhost:3000`). |
| `NEXTAUTH_URL` | Authentication server URL, usually matches `NEXT_PUBLIC_REACT_SERVER_URL`. |
| `NEXTAUTH_SECRET` | Secret used to sign NextAuth sessions. Generate with `openssl rand -base64 32`. |
| `LOGIN_JWT_SECRET_KEY` | Secret for signing custom login tokens. |
| `USE_DATABASE` | Database to use: `postgresql` or `mongo`. |
| `DB_USE_TRANSACTIONS` | Enables database transactions if set to `true`. |
| `MONGO_URLDB` | MongoDB connection URL. |
| `POSTGRES_*` | PostgreSQL configuration (host, port, user, password, database). |
| `SWAGGER_PORT` | Swagger API documentation server port (default 3001). |
| `AUTH_TOKEN` | Token for authenticated API requests in Swagger. |
| `NEXT_PUBLIC_MAYZ_TOKEN_POLICY_CS` | MAYZ Token Policy ID. |
| `NEXT_PUBLIC_MAYZ_TOKEN_NAME` | MAYZ Token name. |
| `NEXT_PUBLIC_TEST_TOKEN_POLICY_CS` | Test token Policy ID. |
| `NEXT_PUBLIC_TEST_TOKEN_TN_Str` | Test token name. |
| `NEXT_PUBLIC_ADMIN_TOKEN_POLICY_CS` | Admin token Policy ID. |
| `NEXT_PUBLIC_USE_BLOCKCHAIN_TIME` | If `true`, timestamps from blockchain are used. |
| `LOGS_*` | Logging configuration for debugging. |

⚠️ **Important:**  
When switching from Emulator to a real network (Preprod, Preview, Mainnet), ensure your policy IDs, token names, and wallet keys are updated accordingly!

<p align="right">(<a href="#readme-top">back to top</a>)</p>


<!-- ROADMAP -->

## Roadmap

-   [x] Full integration with Cardano SmartDb
-   [x] Support for emulator and live networks
-   [ ] Enhanced UI/UX improvements
-   [ ] Notifications system
-   [ ] Multilanguage support (English, Spanish)

See the [open issues](https://github.com/MAYZGitHub/mayz-otc-dapp/issues) for a full list of proposed features.

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- CONTRIBUTING -->

## Contributing

Contributions make the open-source community an amazing place to learn and create. Any contributions you make are **greatly appreciated**.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### Top Contributors

<a href="https://github.com/MAYZGitHub/mayz-otc-dapp/graphs/contributors">
  <img src="https://contrib.rocks/image?repo=MAYZGitHub/mayz-otc-dapp" />
</a>

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- LICENSE -->

## License

Distributed under the MIT License. See `LICENSE` for more information.

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- CONTACT -->

## Contact

MAYZ Team - [@mayzgithub](https://twitter.com/mayzgithub) - contact@mayz.io

Project Link: [https://github.com/MAYZGitHub/mayz-otc-dapp](https://github.com/MAYZGitHub/mayz-otc-dapp)

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- ACKNOWLEDGMENTS -->

## Acknowledgments

-   [Choose an Open Source License](https://choosealicense.com)
-   [GitHub Emoji Cheat Sheet](https://www.webpagefx.com/tools/emoji-cheat-sheet)
-   [Cardano SmartDb by Protofire](https://github.com/protofire/Cardano-SmartDB)
-   [Img Shields](https://shields.io)
-   [Next.js Documentation](https://nextjs.org/)

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- MARKDOWN LINKS & IMAGES -->

[contributors-shield]: https://img.shields.io/github/contributors/MAYZGitHub/mayz-otc-dapp.svg?style=for-the-badge
[contributors-url]: https://github.com/MAYZGitHub/mayz-otc-dapp/graphs/contributors
[forks-shield]: https://img.shields.io/github/forks/MAYZGitHub/mayz-otc-dapp.svg?style=for-the-badge
[forks-url]: https://github.com/MAYZGitHub/mayz-otc-dapp/network/members
[stars-shield]: https://img.shields.io/github/stars/MAYZGitHub/mayz-otc-dapp.svg?style=for-the-badge
[stars-url]: https://github.com/MAYZGitHub/mayz-otc-dapp/stargazers
[issues-shield]: https://img.shields.io/github/issues/MAYZGitHub/mayz-otc-dapp.svg?style=for-the-badge
[issues-url]: https://github.com/MAYZGitHub/mayz-otc-dapp/issues
[license-shield]: https://img.shields.io/github/license/MAYZGitHub/mayz-otc-dapp.svg?style=for-the-badge
[license-url]: https://github.com/MAYZGitHub/mayz-otc-dapp/blob/main/LICENSE
[linkedin-shield]: https://img.shields.io/badge/-LinkedIn-black.svg?style=for-the-badge&logo=linkedin&colorB=555
[linkedin-url]: https://linkedin.com/in/your-profile
[product-screenshot]: https://github.com/MAYZGitHub/mayz-otc-dapp/blob/main/.media/screenshot.png
[Next.js]: https://img.shields.io/badge/next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white
[Next-url]: https://nextjs.org/
[React.js]: https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB
[React-url]: https://reactjs.org/
[TypeScript-shield]: https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white
[TypeScript-url]: https://www.typescriptlang.org/


