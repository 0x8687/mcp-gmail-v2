import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { VercelAIToolSet } from "composio-core";

console.log('process.env.COMPOSIO_API_KEY', process.env.COMPOSIO_API_KEY || '4xyic69yfd4610srw8cebg');
const toolset = new VercelAIToolSet({
    apiKey: process.env.COMPOSIO_API_KEY || '4xyic69yfd4610srw8cebg',
});

export function registerTools(server: McpServer) {
    server.tool("connect-gmail", "Connect to Gmail", {}, async (args, extra) => {
        try {
            // For MCP tools, we'll use a default user approach
            // In a real implementation, you'd need to pass user context through args or headers
            console.log('args ', args);
            console.log('extra ', extra);
            const userAddress = "default-user";
            
            const entity = toolset.client.getEntity(userAddress);
            const connection = await entity.initiateConnection({ appName: "gmail" });
            
            return {
                content: [{ 
                    type: "text", 
                    text: `🔗 Gmail connection initiated!\n\nPlease connect your Gmail account by clicking on the link below:\n\n${connection.redirectUrl}\n\nAfter connecting, you can use Gmail actions.` 
                }],
            };
        } catch (error) {
            console.error('Error initiating Gmail connection:', error);
            return {
                content: [{ 
                    type: "text", 
                    text: `Error initiating Gmail connection: ${error instanceof Error ? error.message : String(error)}` 
                }],
            };
        }
    });

    server.tool("check-gmail-connection", "Check Gmail connection status", {}, async (args, extra) => {
        try {
            const userAddress = "default-user";
            
            const result = await toolset.executeAction({
                action: "GMAIL_GET_PROFILE",
                entityId: userAddress,
                params: {}
            });
            
            if (result.successful) {
                const profile = result.data?.response_data as any;
                return {
                    content: [{ 
                        type: "text", 
                        text: `✅ Your Gmail account is connected!\n\nUser Profile:\n• Email: ${profile.emailAddress}\n• Messages: ${profile.messagesTotal} total\n• Threads: ${profile.threadsTotal} total` 
                    }],
                };
            } else {
                return {
                    content: [{ 
                        type: "text", 
                        text: "❌ Your Gmail account is not connected! Please use the connect-gmail tool first." 
                    }],
                };
            }
        } catch (error) {
            console.error('Error checking Gmail connection:', error);
            return {
                content: [{ 
                    type: "text", 
                    text: `Error checking Gmail connection: ${error instanceof Error ? error.message : String(error)}` 
                }],
            };
        }
    });

    // Send email
    server.tool("send-email", "Send an email", {
        to: z.string().describe("The email address of the recipient"),
        subject: z.string().describe("The subject of the email"),
        body: z.string().describe("The body of the email"),
    }, async (args, extra) => {    
        try {
            const userAddress = "default-user";
            
            const result = await toolset.executeAction({
                action: "GMAIL_SEND_EMAIL",
                entityId: userAddress,
                params: args
            });
            
            if (result.successful) {
                return {
                    content: [{ 
                        type: "text", 
                        text: `✅ Email sent successfully!\n\nTo: ${args.to}\nSubject: ${args.subject}\n\nYour email has been sent and is now in your Gmail sent folder.` 
                    }],
                };
            } else {
                return {
                    content: [{ 
                        type: "text", 
                        text: `❌ Failed to send email: ${result.error || 'Unknown error'}` 
                    }],
                };
            }
        } catch (error) {
            console.error('Error sending email:', error);
            return {
                content: [{ 
                    type: "text", 
                    text: `Error sending email: ${error instanceof Error ? error.message : String(error)}` 
                }],
            };
        }
    });
}