import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { VercelAIToolSet } from "composio-core";

console.log('process.env.COMPOSIO_API_KEY', process.env.COMPOSIO_API_KEY || '4xyic69yfd4610srw8cebg');
const toolset = new VercelAIToolSet({
    apiKey: process.env.COMPOSIO_API_KEY || '4xyic69yfd4610srw8cebg',
});

export function registerTools(server: McpServer) {
    // Authentication & Connection Tools
    server.tool("connect-gmail", "Connect to Gmail", {}, async (args, extra) => {
        try {
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
            console.log('args ', args);
            console.log('extra ', extra);
            
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

    // Email Operations
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

    server.tool("get-emails", "Get emails from inbox", {
        maxResults: z.number().optional().describe("Maximum number of emails to retrieve (default: 10)"),
        query: z.string().optional().describe("Gmail search query to filter emails"),
        labelIds: z.array(z.string()).optional().describe("Array of label IDs to filter by"),
    }, async (args, extra) => {
        try {
            const userAddress = "default-user";
            
            const result = await toolset.executeAction({
                action: "GMAIL_GET_EMAILS",
                entityId: userAddress,
                params: args
            });
            
            if (result.successful) {
                const emails = result.data?.response_data as any;
                const emailList = emails.messages?.map((email: any) => 
                    `• ${email.snippet} (${email.id})`
                ).join('\n') || 'No emails found';
                
                return {
                    content: [{ 
                        type: "text", 
                        text: `📧 Emails retrieved successfully!\n\n${emailList}\n\nTotal: ${emails.messages?.length || 0} emails` 
                    }],
                };
            } else {
                return {
                    content: [{ 
                        type: "text", 
                        text: `❌ Failed to get emails: ${result.error || 'Unknown error'}` 
                    }],
                };
            }
        } catch (error) {
            console.error('Error getting emails:', error);
            return {
                content: [{ 
                    type: "text", 
                    text: `Error getting emails: ${error instanceof Error ? error.message : String(error)}` 
                }],
            };
        }
    });

    server.tool("get-email", "Get a specific email by ID", {
        emailId: z.string().describe("The ID of the email to retrieve"),
    }, async (args, extra) => {
        try {
            const userAddress = "default-user";
            
            const result = await toolset.executeAction({
                action: "GMAIL_GET_EMAIL",
                entityId: userAddress,
                params: args
            });
            
            if (result.successful) {
                const email = result.data?.response_data as any;
                return {
                    content: [{ 
                        type: "text", 
                        text: `📧 Email Details:\n\nFrom: ${email.payload?.headers?.find((h: any) => h.name === 'From')?.value}\nSubject: ${email.payload?.headers?.find((h: any) => h.name === 'Subject')?.value}\nDate: ${email.payload?.headers?.find((h: any) => h.name === 'Date')?.value}\n\nBody: ${email.snippet}` 
                    }],
                };
            } else {
                return {
                    content: [{ 
                        type: "text", 
                        text: `❌ Failed to get email: ${result.error || 'Unknown error'}` 
                    }],
                };
            }
        } catch (error) {
            console.error('Error getting email:', error);
            return {
                content: [{ 
                    type: "text", 
                    text: `Error getting email: ${error instanceof Error ? error.message : String(error)}` 
                }],
            };
        }
    });

    server.tool("reply-to-email", "Reply to an existing email", {
        emailId: z.string().describe("The ID of the email to reply to"),
        message: z.string().describe("The reply message content"),
    }, async (args, extra) => {
        try {
            const userAddress = "default-user";
            
            const result = await toolset.executeAction({
                action: "GMAIL_REPLY_TO_EMAIL",
                entityId: userAddress,
                params: args
            });
            
            if (result.successful) {
                return {
                    content: [{ 
                        type: "text", 
                        text: `✅ Reply sent successfully!\n\nYour reply has been sent to the original email thread.` 
                    }],
                };
            } else {
                return {
                    content: [{ 
                        type: "text", 
                        text: `❌ Failed to send reply: ${result.error || 'Unknown error'}` 
                    }],
                };
            }
        } catch (error) {
            console.error('Error sending reply:', error);
            return {
                content: [{ 
                    type: "text", 
                    text: `Error sending reply: ${error instanceof Error ? error.message : String(error)}` 
                }],
            };
        }
    });

    server.tool("forward-email", "Forward an email to other recipients", {
        emailId: z.string().describe("The ID of the email to forward"),
        to: z.string().describe("The email address to forward to"),
        message: z.string().optional().describe("Additional message to include with the forward"),
    }, async (args, extra) => {
        try {
            const userAddress = "default-user";
            
            const result = await toolset.executeAction({
                action: "GMAIL_FORWARD_EMAIL",
                entityId: userAddress,
                params: args
            });
            
            if (result.successful) {
                return {
                    content: [{ 
                        type: "text", 
                        text: `✅ Email forwarded successfully!\n\nForwarded to: ${args.to}` 
                    }],
                };
            } else {
                return {
                    content: [{ 
                        type: "text", 
                        text: `❌ Failed to forward email: ${result.error || 'Unknown error'}` 
                    }],
                };
            }
        } catch (error) {
            console.error('Error forwarding email:', error);
            return {
                content: [{ 
                    type: "text", 
                    text: `Error forwarding email: ${error instanceof Error ? error.message : String(error)}` 
                }],
            };
        }
    });

    // Draft Operations
    server.tool("create-draft", "Create an email draft", {
        to: z.string().describe("The email address of the recipient"),
        subject: z.string().describe("The subject of the email"),
        body: z.string().describe("The body of the email"),
    }, async (args, extra) => {
        try {
            const userAddress = "default-user";
            
            const result = await toolset.executeAction({
                action: "GMAIL_DRAFT_EMAIL",
                entityId: userAddress,
                params: args
            });
            
            if (result.successful) {
                return {
                    content: [{ 
                        type: "text", 
                        text: `📝 Draft created successfully!\n\nDraft ID: ${(result.data?.response_data as any)?.id}\nTo: ${args.to}\nSubject: ${args.subject}` 
                    }],
                };
            } else {
                return {
                    content: [{ 
                        type: "text", 
                        text: `❌ Failed to create draft: ${result.error || 'Unknown error'}` 
                    }],
                };
            }
        } catch (error) {
            console.error('Error creating draft:', error);
            return {
                content: [{ 
                    type: "text", 
                    text: `Error creating draft: ${error instanceof Error ? error.message : String(error)}` 
                }],
            };
        }
    });

    server.tool("send-draft", "Send a draft email", {
        draftId: z.string().describe("The ID of the draft to send"),
    }, async (args, extra) => {
        try {
            const userAddress = "default-user";
            
            const result = await toolset.executeAction({
                action: "GMAIL_SEND_DRAFT",
                entityId: userAddress,
                params: args
            });
            
            if (result.successful) {
                return {
                    content: [{ 
                        type: "text", 
                        text: `✅ Draft sent successfully!\n\nYour draft has been sent and is now in your Gmail sent folder.` 
                    }],
                };
            } else {
                return {
                    content: [{ 
                        type: "text", 
                        text: `❌ Failed to send draft: ${result.error || 'Unknown error'}` 
                    }],
                };
            }
        } catch (error) {
            console.error('Error sending draft:', error);
            return {
                content: [{ 
                    type: "text", 
                    text: `Error sending draft: ${error instanceof Error ? error.message : String(error)}` 
                }],
            };
        }
    });

    // Label Operations
    server.tool("get-labels", "Get all Gmail labels", {}, async (args, extra) => {
        try {
            const userAddress = "default-user";
            
            const result = await toolset.executeAction({
                action: "GMAIL_GET_LABELS",
                entityId: userAddress,
                params: {}
            });
            
            if (result.successful) {
                const labels = result.data?.response_data as any;
                const labelList = labels.labels?.map((label: any) => 
                    `• ${label.name} (${label.id})`
                ).join('\n') || 'No labels found';
                
                return {
                    content: [{ 
                        type: "text", 
                        text: `🏷️ Labels retrieved successfully!\n\n${labelList}\n\nTotal: ${labels.labels?.length || 0} labels` 
                    }],
                };
            } else {
                return {
                    content: [{ 
                        type: "text", 
                        text: `❌ Failed to get labels: ${result.error || 'Unknown error'}` 
                    }],
                };
            }
        } catch (error) {
            console.error('Error getting labels:', error);
            return {
                content: [{ 
                    type: "text", 
                    text: `Error getting labels: ${error instanceof Error ? error.message : String(error)}` 
                }],
            };
        }
    });

    server.tool("create-label", "Create a new Gmail label", {
        name: z.string().describe("The name of the label to create"),
        labelListVisibility: z.string().optional().describe("Visibility of the label in the label list"),
        messageListVisibility: z.string().optional().describe("Visibility of the label in the message list"),
    }, async (args, extra) => {
        try {
            const userAddress = "default-user";
            
            const result = await toolset.executeAction({
                action: "GMAIL_CREATE_LABEL",
                entityId: userAddress,
                params: args
            });
            
            if (result.successful) {
                return {
                    content: [{ 
                        type: "text", 
                        text: `✅ Label created successfully!\n\nLabel: ${args.name}\nID: ${(result.data?.response_data as any)?.id}` 
                    }],
                };
            } else {
                return {
                    content: [{ 
                        type: "text", 
                        text: `❌ Failed to create label: ${result.error || 'Unknown error'}` 
                    }],
                };
            }
        } catch (error) {
            console.error('Error creating label:', error);
            return {
                content: [{ 
                    type: "text", 
                    text: `Error creating label: ${error instanceof Error ? error.message : String(error)}` 
                }],
            };
        }
    });

    // Thread Operations
    server.tool("get-threads", "Get email threads", {
        maxResults: z.number().optional().describe("Maximum number of threads to retrieve"),
        query: z.string().optional().describe("Gmail search query to filter threads"),
    }, async (args, extra) => {
        try {
            const userAddress = "default-user";
            
            const result = await toolset.executeAction({
                action: "GMAIL_GET_THREADS",
                entityId: userAddress,
                params: args
            });
            
            if (result.successful) {
                const threads = result.data?.response_data as any;
                const threadList = threads.threads?.map((thread: any) => 
                    `• Thread ${thread.id} (${thread.snippet})`
                ).join('\n') || 'No threads found';
                
                return {
                    content: [{ 
                        type: "text", 
                        text: `🧵 Threads retrieved successfully!\n\n${threadList}\n\nTotal: ${threads.threads?.length || 0} threads` 
                    }],
                };
            } else {
                return {
                    content: [{ 
                        type: "text", 
                        text: `❌ Failed to get threads: ${result.error || 'Unknown error'}` 
                    }],
                };
            }
        } catch (error) {
            console.error('Error getting threads:', error);
            return {
                content: [{ 
                    type: "text", 
                    text: `Error getting threads: ${error instanceof Error ? error.message : String(error)}` 
                }],
            };
        }
    });

    // Search Operations
    server.tool("search-emails", "Search emails using Gmail search syntax", {
        query: z.string().describe("Gmail search query (e.g., 'from:example@gmail.com', 'subject:meeting', 'is:unread')"),
        maxResults: z.number().optional().describe("Maximum number of results to return"),
    }, async (args, extra) => {
        try {
            const userAddress = "default-user";
            
            const result = await toolset.executeAction({
                action: "GMAIL_SEARCH_EMAILS",
                entityId: userAddress,
                params: args
            });
            
            if (result.successful) {
                const emails = result.data?.response_data as any;
                const emailList = emails.messages?.map((email: any) => 
                    `• ${email.snippet} (${email.id})`
                ).join('\n') || 'No emails found matching your search';
                
                return {
                    content: [{ 
                        type: "text", 
                        text: `🔍 Search results for "${args.query}":\n\n${emailList}\n\nTotal: ${emails.messages?.length || 0} emails found` 
                    }],
                };
            } else {
                return {
                    content: [{ 
                        type: "text", 
                        text: `❌ Failed to search emails: ${result.error || 'Unknown error'}` 
                    }],
                };
            }
        } catch (error) {
            console.error('Error searching emails:', error);
            return {
                content: [{ 
                    type: "text", 
                    text: `Error searching emails: ${error instanceof Error ? error.message : String(error)}` 
                }],
            };
        }
    });

    // Advanced Operations
    server.tool("mark-as-read", "Mark emails as read", {
        emailIds: z.array(z.string()).describe("Array of email IDs to mark as read"),
    }, async (args, extra) => {
        try {
            const userAddress = "default-user";
            
            const result = await toolset.executeAction({
                action: "GMAIL_MARK_AS_READ",
                entityId: userAddress,
                params: args
            });
            
            if (result.successful) {
                return {
                    content: [{ 
                        type: "text", 
                        text: `✅ Emails marked as read successfully!\n\nMarked ${args.emailIds.length} email(s) as read.` 
                    }],
                };
            } else {
                return {
                    content: [{ 
                        type: "text", 
                        text: `❌ Failed to mark emails as read: ${result.error || 'Unknown error'}` 
                    }],
                };
            }
        } catch (error) {
            console.error('Error marking emails as read:', error);
            return {
                content: [{ 
                    type: "text", 
                    text: `Error marking emails as read: ${error instanceof Error ? error.message : String(error)}` 
                }],
            };
        }
    });

    server.tool("mark-as-unread", "Mark emails as unread", {
        emailIds: z.array(z.string()).describe("Array of email IDs to mark as unread"),
    }, async (args, extra) => {
        try {
            const userAddress = "default-user";
            
            const result = await toolset.executeAction({
                action: "GMAIL_MARK_AS_UNREAD",
                entityId: userAddress,
                params: args
            });
            
            if (result.successful) {
                return {
                    content: [{ 
                        type: "text", 
                        text: `✅ Emails marked as unread successfully!\n\nMarked ${args.emailIds.length} email(s) as unread.` 
                    }],
                };
            } else {
                return {
                    content: [{ 
                        type: "text", 
                        text: `❌ Failed to mark emails as unread: ${result.error || 'Unknown error'}` 
                    }],
                };
            }
        } catch (error) {
            console.error('Error marking emails as unread:', error);
            return {
                content: [{ 
                    type: "text", 
                    text: `Error marking emails as unread: ${error instanceof Error ? error.message : String(error)}` 
                }],
            };
        }
    });

    server.tool("move-to-trash", "Move emails to trash", {
        emailIds: z.array(z.string()).describe("Array of email IDs to move to trash"),
    }, async (args, extra) => {
        try {
            const userAddress = "default-user";
            
            const result = await toolset.executeAction({
                action: "GMAIL_MOVE_TO_TRASH",
                entityId: userAddress,
                params: args
            });
            
            if (result.successful) {
                return {
                    content: [{ 
                        type: "text", 
                        text: `🗑️ Emails moved to trash successfully!\n\nMoved ${args.emailIds.length} email(s) to trash.` 
                    }],
                };
            } else {
                return {
                    content: [{ 
                        type: "text", 
                        text: `❌ Failed to move emails to trash: ${result.error || 'Unknown error'}` 
                    }],
                };
            }
        } catch (error) {
            console.error('Error moving emails to trash:', error);
            return {
                content: [{ 
                    type: "text", 
                    text: `Error moving emails to trash: ${error instanceof Error ? error.message : String(error)}` 
                }],
            };
        }
    });

    server.tool("get-gmail-settings", "Get Gmail settings", {}, async (args, extra) => {
        try {
            const userAddress = "default-user";
            
            const result = await toolset.executeAction({
                action: "GMAIL_GET_SETTINGS",
                entityId: userAddress,
                params: {}
            });
            
            if (result.successful) {
                const settings = result.data?.response_data as any;
                return {
                    content: [{ 
                        type: "text", 
                        text: `⚙️ Gmail Settings:\n\n${JSON.stringify(settings, null, 2)}` 
                    }],
                };
            } else {
                return {
                    content: [{ 
                        type: "text", 
                        text: `❌ Failed to get Gmail settings: ${result.error || 'Unknown error'}` 
                    }],
                };
            }
        } catch (error) {
            console.error('Error getting Gmail settings:', error);
            return {
                content: [{ 
                    type: "text", 
                    text: `Error getting Gmail settings: ${error instanceof Error ? error.message : String(error)}` 
                }],
            };
        }
    });
}