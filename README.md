# Gmail AI Agent MCP Server

A Model Context Protocol (MCP) server that provides Gmail integration capabilities for AI models and tools. This server enables AI assistants to connect to Gmail accounts, check connection status, and send emails through a secure interface.

<a href="https://glama.ai/mcp/servers/d316l4kyh7">
  <img width="380" height="200" src="https://glama.ai/mcp/servers/d316l4kyh7/badge" alt="Gmail AI Agent MCP server" />
</a>

## Tools

The server implements the following Gmail-related tools:

### `connect-gmail`
Initiates a connection to a Gmail account. This tool will provide a redirect URL for OAuth authentication.

### `check-gmail-connection`
Checks the current Gmail connection status and displays user profile information including email address, total messages, and total threads.

### `send-email`
Sends an email through the connected Gmail account. Parameters:
- `to`: The email address of the recipient
- `subject`: The subject of the email
- `body`: The body content of the email

## Setup

### Prerequisites

1. **Composio API Key**: You'll need a Composio API key to use the Gmail integration. You can get one by signing up at [Composio](https://composio.dev/).

2. **Gmail Account**: A Gmail account that you want to connect to the AI agent.

### Installation

You can configure the Gmail AI agent server in your client using the [`meme-mcp`](https://www.npmjs.com/package/meme-mcp) NPM package (note: package name is legacy but functionality is Gmail-focused). Here is an example configuration for Claude Desktop (Settings -> Developer -> Edit Config):

```json
{
  "mcpServers": {
    "gmail-agent": {
      "command": "npx",
      "args": ["-y", "meme-mcp"],
      "env": {
        "COMPOSIO_API_KEY": "<YOUR_COMPOSIO_API_KEY>"
      }
    }
  }
}
```

### Manual Installation

If you prefer to install manually, you can install the package globally:

```bash
npm install -g meme-mcp
```

Then use it directly in your configuration:

```json
{
  "mcpServers": {
    "gmail-agent": {
      "command": "/Users/<USERNAME>/.nvm/versions/node/v20.18.2/bin/node",
      "args": ["/Users/<USERNAME>/.nvm/versions/node/v20.18.2/lib/node_modules/meme-mcp/dist/index.js"],
      "env": {
        "COMPOSIO_API_KEY": "<YOUR_COMPOSIO_API_KEY>"
      }
    }
  }
}
```

## Usage

1. **Configure the server** in your MCP client (like Claude Desktop)
2. **Restart your client** to load the new configuration
3. **Connect to Gmail** by using the `connect-gmail` tool - this will provide an OAuth link
4. **Authorize the connection** by clicking the provided link and following the Gmail authorization flow
5. **Check connection** using `check-gmail-connection` to verify everything is working
6. **Send emails** using the `send-email` tool with recipient, subject, and body parameters

## Security

- The server uses OAuth 2.0 for secure Gmail authentication
- No passwords are stored locally
- All Gmail operations are performed through secure API calls
- The connection is maintained securely through Composio's infrastructure

## Example Workflow

1. **Initial Setup**: Use `connect-gmail` to start the OAuth flow
2. **Verification**: Use `check-gmail-connection` to confirm successful connection
3. **Email Operations**: Use `send-email` to compose and send emails through your connected Gmail account

## Troubleshooting

- **Connection Issues**: If you encounter connection problems, try using `connect-gmail` again to re-authenticate
- **API Key Issues**: Ensure your Composio API key is correctly set in the environment variables
- **Permission Errors**: Make sure you've granted the necessary permissions during the OAuth flow

## Author

This project is created by [Vladimir Haltakov](https://haltakov.net). If you find it interesting you can message me on X [@haltakov](https://x.com/haltakov).
