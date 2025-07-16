#!/usr/bin/env node

import axios from "axios";
import { z } from "zod";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";

// Create an MCP server
const server = new McpServer({
  name: "Meme Image Server",
  version: "1.0.0",
});

// Register the generateMeme tool
server.tool(
  "generateMeme",
  "Generate a meme image from Imgflip using the numeric template id and text",
  {
    templateNumericId: z.string(),
    text0: z.string(),
    text1: z.string().optional(),
  },
  async ({ templateNumericId, text0, text1 }) => {
    try {
      // Prepare the Imgflip API request
      const formData = new FormData();
      formData.append("template_id", templateNumericId);
      formData.append("text0", text0);
      if (text1) formData.append("text1", text1);
      formData.append("username", process.env.IMGFLIP_USERNAME || "");
      formData.append("password", process.env.IMGFLIP_PASSWORD || "");

      // Send the request to the Imgflip API
      const response = await axios.post("https://api.imgflip.com/caption_image", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      // Get the image URL from the response
      const imageUrl = response.data.data.url;

      // Download the image
      const imageResponse = await axios.get(imageUrl, { responseType: "arraybuffer" });
      const imageDataBase64 = imageResponse.data.toString("base64");

      // Return the image as a base64 encoded string
      return {
        content: [{ type: "image", data: imageDataBase64, mimeType: "image/png" }],
      };
    } catch (error) {
      // Return an error message
      return {
        content: [
          {
            type: "text",
            text: "Failed to generate meme image",
          },
        ],
        isError: true,
      };
    }
  }
);

// Start receiving messages on stdin and sending messages on stdout
const transport = new StdioServerTransport();
await server.connect(transport);
