# SmartDB Project Template

Welcome to the **SmartDB Project Template**! This repository provides a ready-to-use template for projects implementing the [SmartDB library](https://protofire-docs.gitbook.io/smartdb). It contains the essential files and directories needed to kick-start your application, offering a foundation to develop with SmartDB seamlessly.

## Table of Contents
- [SmartDB Project Template](#smartdb-project-template)
  - [Table of Contents](#table-of-contents)
  - [Features](#features)
  - [Documentation](#documentation)
  - [Directory Structure](#directory-structure)
  - [Getting Started](#getting-started)
    - [1. Create Your Repository](#1-create-your-repository)
    - [2. Install Dependencies](#2-install-dependencies)
  - [Resources](#resources)
    - [CBOR Files](#cbor-files)
    - [Scaffold Project](#scaffold-project)
  - [Market Place Example](#market-place-example)
  - [Learn More](#learn-more)


## Features

- **Basic Project Structure**: Includes predefined directories and files to streamline your development.
- **SmartDB Integration**: Prepares your project to use the SmartDB library, including environment setup and example configurations.
- **Customizable Components**: Easily extend and adapt the template to fit your specific use case.

## Documentation

For detailed documentation, please visit our [Gitbook](https://protofire-docs.gitbook.io/smartdb/smartdb-project-template/).

## Directory Structure

```plaintext
├── docs/
│   └── Step-by-Step.md           # Step-by-step example of an 
│                                    end-to-end implementation
├── src/
│   ├── components/                # UI components for frontend
│   ├── pages/                     # Main application pages
│   ├── styles/                    # SCSS or CSS files for styling
│   └── utils/                     # Utility functions and helpers
├── .env.example                   # Example environment configuration
├── smart-db.tgz                   # SmartDB library package for installation
├── package.json                   # Project dependencies and scripts
└── README.md                      # Project documentation
```

## Getting Started

### 1. Create Your Repository

1. Click the **"Use this template"** button at the top of this repository.  
2. Name your new repository and set it to public or private.  
3. Clone your newly created repository to your local environment.

![Use Template](.media/create_template.gif)

```bash
git clone https://github.com/<your_username>/<your_repo_name>.git
cd <your_repo_name>
```

### 2. Install Dependencies

Run the following command to install all required dependencies:

```bash
npm install
```

## Resources

### CBOR Files

To start the project, you need the **CBOR files** of the Plutus smart contracts you plan to implement. These files are essential for deploying and interacting with on-chain scripts.  
- CBOR files can be generated using the appropriate Plutus tools or your preferred Haskell development environment.  


### Scaffold Project

You must install the **Scaffold Project** to define and generate your SmartDB entities.  
The Scaffold Project provides tools for:  
- Creating database schemas.  
- Generating TypeScript types for both MongoDB and PostgreSQL.

To get started with the Scaffold Project, follow the instructions in its [official repository](https://github.com/protofire/Cardano-SmartDB-Scaffold/tree/main?tab=readme-ov-file#introduction).  

Once installed, you can use the scaffold commands to generate entities for your SmartDB project.
## Market Place Example

Explore a comprehensive [**step-by-step guide**](./docs/Step-by-Step.md) for building an end-to-end project with SmartDB in the file.

This example demonstrates how to:
- Implement entities using SmartDB.
- Develop basic CRUD functionalities.
- Create frontend components for marketplace operations.
- Deploy and test your application.

## Learn More

- **Documentation**: For detailed SmartDB library documentation, visit [SmartDB Docs](https://protofire-docs.gitbook.io/smartdb).
- **Support**: Reach out to us via [Issues](https://github.com/protofire/Cardano-SmartDB-Template/issues) for assistance or to report bugs.

Happy coding with SmartDB! 🎉