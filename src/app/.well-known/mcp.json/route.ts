import { SITE_URL } from '@/lib/formats'
import { SERVER_INFO, SUPPORTED_VERSIONS } from '@/lib/mcp'

/** MCP server discovery document. */
export function GET() {
  return Response.json(
    {
      ...SERVER_INFO,
      description: 'Search and read the Aestheticpedia encyclopedia of world aesthetics.',
      transport: { type: 'streamable-http', url: `${SITE_URL}/api/mcp` },
      protocolVersions: SUPPORTED_VERSIONS,
      capabilities: { tools: true, resources: true, prompts: true },
      authentication: { required: false },
      documentation: `${SITE_URL}/data#mcp`,
    },
    { headers: { 'Access-Control-Allow-Origin': '*' } }
  )
}
