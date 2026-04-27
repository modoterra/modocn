import { ComponentPage } from "@/src/components/component-page"

export function TransportOpenaiPage() {
  return (
    <ComponentPage
      name="openaiTransport"
      registry="transport-openai"
      description="ChatTransport implementation for OpenAI-compatible chat completions APIs. Parses SSE (Server-Sent Events) text/event-stream format. Works with OpenAI, Azure OpenAI, Groq, Together, Anyscale, and any endpoint that follows the OpenAI chat completions streaming format."
      features={[
        "OpenAI-compatible SSE stream parsing",
        "Works with OpenAI, Azure OpenAI, Groq, Together, and other compatible APIs",
        "Configurable model, base URL, and API key",
        "Custom fetch implementation support",
        "Graceful handling of malformed JSON lines",
        "Buffers incomplete lines across chunks",
        "Pure library function — no React dependency",
      ]}
      props={[
        { name: "apiKey", type: "string", description: "API key for authentication." },
        { name: "model", type: "string", default: '"gpt-4o"', description: "Model ID to use for completions." },
        { name: "baseUrl", type: "string", default: '"https://api.openai.com/v1"', description: "Base URL for the API endpoint." },
        { name: "fetch", type: "typeof fetch", description: "Custom fetch implementation." },
      ]}
      exports={[
        { name: "openaiTransport", kind: "function", description: "Factory function that creates a ChatTransport for OpenAI-compatible APIs." },
      ]}
      examples={[
        {
          title: "Basic OpenAI usage",
          description: "Connect to the OpenAI API with your API key.",
          code: `import { openaiTransport } from "@/lib/transport-openai"

<ChatBox
  transport={openaiTransport({
    apiKey: "sk-...",
    model: "gpt-4o",
  })}
>
  {/* ... */}
</ChatBox>`,
        },
        {
          title: "Azure OpenAI",
          description: "Point to your Azure OpenAI deployment.",
          code: `<ChatBox
  transport={openaiTransport({
    apiKey: "your-azure-key",
    model: "gpt-4o",
    baseUrl: "https://your-resource.openai.azure.com/openai/deployments/your-deployment",
  })}
>
  {/* ... */}
</ChatBox>`,
        },
        {
          title: "Groq / Together / Other providers",
          description: "Any OpenAI-compatible endpoint works by changing the base URL.",
          code: `// Groq
openaiTransport({
  apiKey: "gsk_...",
  model: "llama-3.3-70b-versatile",
  baseUrl: "https://api.groq.com/openai/v1",
})

// Together
openaiTransport({
  apiKey: "...",
  model: "meta-llama/Meta-Llama-3.1-70B-Instruct-Turbo",
  baseUrl: "https://api.together.xyz/v1",
})`,
        },
        {
          title: "With ChatFull",
          description: "Use with the complete chat interface component.",
          code: `import { openaiTransport } from "@/lib/transport-openai"
import { ChatFull } from "@/components/chat-full"

export function App() {
  return (
    <ChatFull
      transport={openaiTransport({
        apiKey: process.env.OPENAI_API_KEY!,
        model: "gpt-4o",
      })}
    />
  )
}`,
        },
      ]}
      prev={{ label: "ChatFull", href: "/docs/components/chat-full" }}
      next={{ label: "Demos", href: "/demos" }}
    />
  )
}
