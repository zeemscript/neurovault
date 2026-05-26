import { AiTool } from "./types";

// Hardcoded fallback list — synced from server when connected
export const DEFAULT_AI_TOOLS: AiTool[] = [
  {
    id: "chatgpt",
    name: "ChatGPT",
    domains: ["chat.openai.com", "chatgpt.com"],
    category: "llm",
    default_risk: "medium",
    icon_url: null,
  },
  {
    id: "claude",
    name: "Claude",
    domains: ["claude.ai"],
    category: "llm",
    default_risk: "medium",
    icon_url: null,
  },
  {
    id: "gemini",
    name: "Gemini",
    domains: ["gemini.google.com", "bard.google.com"],
    category: "llm",
    default_risk: "medium",
    icon_url: null,
  },
  {
    id: "midjourney",
    name: "Midjourney",
    domains: ["midjourney.com"],
    category: "image-gen",
    default_risk: "medium",
    icon_url: null,
  },
  {
    id: "copilot",
    name: "GitHub Copilot",
    domains: ["github.com/copilot", "copilot.microsoft.com"],
    category: "code",
    default_risk: "low",
    icon_url: null,
  },
  {
    id: "perplexity",
    name: "Perplexity",
    domains: ["perplexity.ai"],
    category: "search",
    default_risk: "low",
    icon_url: null,
  },
  {
    id: "huggingface",
    name: "Hugging Face",
    domains: ["huggingface.co"],
    category: "ml-platform",
    default_risk: "medium",
    icon_url: null,
  },
  {
    id: "replicate",
    name: "Replicate",
    domains: ["replicate.com"],
    category: "ml-platform",
    default_risk: "medium",
    icon_url: null,
  },
  {
    id: "stability",
    name: "Stability AI",
    domains: ["stability.ai"],
    category: "image-gen",
    default_risk: "medium",
    icon_url: null,
  },
  {
    id: "jasper",
    name: "Jasper",
    domains: ["jasper.ai"],
    category: "writing",
    default_risk: "low",
    icon_url: null,
  },
  {
    id: "writesonic",
    name: "Writesonic",
    domains: ["writesonic.com"],
    category: "writing",
    default_risk: "low",
    icon_url: null,
  },
  {
    id: "copy-ai",
    name: "Copy.ai",
    domains: ["copy.ai"],
    category: "writing",
    default_risk: "low",
    icon_url: null,
  },
  {
    id: "notion-ai",
    name: "Notion AI",
    domains: ["notion.so"],
    category: "productivity",
    default_risk: "low",
    icon_url: null,
  },
  {
    id: "cursor",
    name: "Cursor",
    domains: ["cursor.com"],
    category: "code",
    default_risk: "low",
    icon_url: null,
  },
  {
    id: "v0",
    name: "v0 by Vercel",
    domains: ["v0.dev"],
    category: "code",
    default_risk: "low",
    icon_url: null,
  },
];

/**
 * Match a URL hostname against the AI tools list.
 * Returns the matched tool or null.
 */
export function matchUrlToTool(
  url: string,
  tools: AiTool[]
): AiTool | null {
  let hostname: string;
  try {
    hostname = new URL(url).hostname;
  } catch {
    return null;
  }

  for (const tool of tools) {
    for (const domain of tool.domains) {
      // Handle path-based domains like "github.com/copilot"
      if (domain.includes("/")) {
        try {
          const domainUrl = new URL(`https://${domain}`);
          if (
            (hostname === domainUrl.hostname ||
              hostname.endsWith(`.${domainUrl.hostname}`)) &&
            url.includes(domain)
          ) {
            return tool;
          }
        } catch {
          continue;
        }
      } else {
        if (hostname === domain || hostname.endsWith(`.${domain}`)) {
          return tool;
        }
      }
    }
  }

  return null;
}
