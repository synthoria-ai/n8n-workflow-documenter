# n8n Workflow Documenter

Automated documentation generator for n8n workflows using Google Gemini AI.

## 🚀 Overview

The **n8n Workflow Documenter** is a web application designed to simplify the documentation process for n8n workflows. By leveraging the power of **Google Gemini AI**, it analyzes your workflow JSON files and generates comprehensive, easy-to-read documentation, including summaries, node descriptions, credential requirements, and usage instructions.

**Key capabilities:**
- **Automated Analysis**: Upload your n8n workflow JSON and get instant documentation.
- **AI-Powered**: Uses Google Gemini Pro to understand workflow logic and context.
- **Privacy-Focused**: Sensitive credentials are detected and highlighted but never stored.
- **Multiple formats**: Export as Markdown files.
- **Google Drive Integration**: Batch process multiple workflows directly from your Drive.

## ✨ Features

- **Drag-and-Drop Interface**: Easily upload JSON workflow files.
- **Batch Processing**: Connect to Google Drive to document entire folders of workflows at once.
- **Sanitization**: Automatically removes sensitive values from the exported JSON.
- **Detailed Reports**:
  - Workflow Summary & Purpose
  - Trigger & Schedule details
  - Node-by-node breakdown
  - Required Credentials list
- **Modern UI**: Clean Next.js-based interface.

## 🛠️ Technology Stack

- **Framework**: [Next.js](https://nextjs.org/) (React)
- **AI Engine**: [Google Gemini API](https://ai.google.dev/)
- **Styling**: Tailwind CSS
- **Integration**: Google Drive API

## 🏃 Quick Start (Local Development)

1.  **Clone the repository**:
    ```bash
    git clone https://github.com/synthoria-ai/n8n-workflow-documenter.git
    cd n8n-workflow-documenter
    ```

2.  **Install dependencies**:
    ```bash
    npm install
    ```

3.  **Configure Environment Variables**:
    Create a `.env.local` file in the root directory and add your API keys:
    ```env
    GOOGLE_API_KEY=your_gemini_api_key
    # Optional: For Google Drive integration
    # GOOGLE_CLIENT_ID=...
    # GOOGLE_CLIENT_SECRET=...
    ```

4.  **Run the development server**:
    ```bash
    npm run dev
    ```

5.  Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🚢 Deployment

For detailed instructions on how to deploy this application to production (using Docker, Nginx, & CI/CD), please refer to the **[Deployment Guide](deployment/DEPLOYMENT_GUIDE.md)** located in the `deployment/` directory.

We support:
- **Docker** & **Docker Compose**
- **Manual Deployment** on VPS (Hetzner, DigitalOcean)
- **GitLab CI/CD** pipelines

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
