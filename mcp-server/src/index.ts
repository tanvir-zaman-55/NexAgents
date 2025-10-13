#!/usr/bin/env node
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  Tool,
} from '@modelcontextprotocol/sdk/types.js';
import dotenv from 'dotenv';

// Load environment variables from parent directory
dotenv.config({ path: '../.env.local' });

// Define Chef tools
const CHEF_TOOLS: Tool[] = [
  {
    name: 'chef_create_project',
    description: 'Create a new Chef project with Convex backend',
    inputSchema: {
      type: 'object',
      properties: {
        name: {
          type: 'string',
          description: 'Project name',
        },
        description: {
          type: 'string',
          description: 'Project description or initial prompt',
        },
        teamSlug: {
          type: 'string',
          description: 'Convex team slug',
        },
      },
      required: ['name', 'description'],
    },
  },
  {
    name: 'chef_deploy',
    description: 'Deploy the current project to Convex',
    inputSchema: {
      type: 'object',
      properties: {
        projectId: {
          type: 'string',
          description: 'Chef project ID',
        },
      },
      required: ['projectId'],
    },
  },
  {
    name: 'chef_run_agent',
    description: 'Run the Chef agent loop to generate code',
    inputSchema: {
      type: 'object',
      properties: {
        projectId: {
          type: 'string',
          description: 'Chef project ID',
        },
        prompt: {
          type: 'string',
          description: 'Instruction for the agent',
        },
      },
      required: ['projectId', 'prompt'],
    },
  },
  {
    name: 'chef_list_projects',
    description: 'List all Chef projects for the current user',
    inputSchema: {
      type: 'object',
      properties: {},
    },
  },
  {
    name: 'chef_get_project_status',
    description: 'Get the status of a Chef project',
    inputSchema: {
      type: 'object',
      properties: {
        projectId: {
          type: 'string',
          description: 'Chef project ID',
        },
      },
      required: ['projectId'],
    },
  },
];

class ChefMCPServer {
  private server: Server;

  constructor() {
    this.server = new Server(
      {
        name: 'chef-mcp-server',
        version: '1.0.0',
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    this.setupHandlers();
  }

  private setupHandlers() {
    // List available tools
    this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
      tools: CHEF_TOOLS,
    }));

    // Handle tool calls
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      try {
        switch (name) {
          case 'chef_create_project':
            return await this.createProject(args);
          case 'chef_deploy':
            return await this.deployProject(args);
          case 'chef_run_agent':
            return await this.runAgent(args);
          case 'chef_list_projects':
            return await this.listProjects();
          case 'chef_get_project_status':
            return await this.getProjectStatus(args);
          default:
            throw new Error(`Unknown tool: ${name}`);
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        return {
          content: [
            {
              type: 'text',
              text: `Error: ${errorMessage}`,
            },
          ],
        };
      }
    });
  }

  private async createProject(args: any) {
    // TODO: Integrate with Convex backend to create project
    const { name, description, teamSlug } = args;

    return {
      content: [
        {
          type: 'text',
          text: `Creating Chef project "${name}"...\nDescription: ${description}\nTeam: ${teamSlug || 'default'}\n\n[Implementation pending: Will create Convex project and initialize chat]`,
        },
      ],
    };
  }

  private async deployProject(args: any) {
    // TODO: Integrate with Convex deployment
    const { projectId } = args;

    return {
      content: [
        {
          type: 'text',
          text: `Deploying project ${projectId}...\n\n[Implementation pending: Will deploy to Convex]`,
        },
      ],
    };
  }

  private async runAgent(args: any) {
    // TODO: Integrate with chef-agent loop
    const { projectId, prompt } = args;

    return {
      content: [
        {
          type: 'text',
          text: `Running Chef agent for project ${projectId}...\nPrompt: ${prompt}\n\n[Implementation pending: Will run agent loop]`,
        },
      ],
    };
  }

  private async listProjects() {
    // TODO: Query Convex for user's projects
    return {
      content: [
        {
          type: 'text',
          text: `Fetching your Chef projects...\n\n[Implementation pending: Will list projects from Convex]`,
        },
      ],
    };
  }

  private async getProjectStatus(args: any) {
    // TODO: Query Convex for project status
    const { projectId } = args;

    return {
      content: [
        {
          type: 'text',
          text: `Getting status for project ${projectId}...\n\n[Implementation pending: Will fetch project status]`,
        },
      ],
    };
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('Chef MCP Server running on stdio');
  }
}

// Start the server
const server = new ChefMCPServer();
server.run().catch(console.error);
