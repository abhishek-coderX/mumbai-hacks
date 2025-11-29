import dotenv from "dotenv";
dotenv.config({ quiet: true });
import { factCheck } from "./factcheck.js";


import Groq from "groq-sdk";
import { tavily } from "@tavily/core";
import NodeCache from "node-cache";

const tvly = tavily({ apiKey: "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" });
const groq = new Groq({ apiKey: "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" });

const cache = new NodeCache({
  stdTTL: 60 * 60 * 24,
  checkperiod: 60 * 10,
  useClones: false,
  maxKeys: 10000,
});

export async function generate(userMessage, threadId) {
  const baseMessages = [
  {
    role: "system",
    content: `You are TRUTH-GUARD, an agentic AI that verifies factual claims.
1) Identify if the user text contains a factual claim or only an opinion/subjective statement.
2) If it's an opinion, reply: {"type":"opinion","message":"..."}.
3) If it's a factual claim, call function factCheck with {claim: "..."}.
4) When given factCheck results, synthesize a short verdict: True | False | Misleading | Unverified,
   give a concise 1-2 sentence summary, a confidence score (0-100), and list 2-4 sources.
Return final answer as JSON only.`
  }
];



const messages = [...(cache.get(threadId) || baseMessages)];

 if (messages.length > 50) {
    messages.splice(1, messages.length - 49);
}

  messages.push({
    role: "user",
    content: userMessage,
  });

  const MAX_RETRIES = 10;
  let count = 0;

  while (true) {
    if (count > MAX_RETRIES) {
      return "I Could not find the result, please try again";
    }
    count++;

    let completions = null;
    try {
        completions = await groq.chat.completions.create({
            model: "llama-3.3-70b-versatile",
            temperature: 0,
            messages: messages,
            tools: [
                {
                    type: "function",
                    function: {
                        name: "webSearch",
                        description:
                            "Search the latest information and realtime data on the internet.",
                        parameters: {
                            type: "object",
                            properties: {
                                query: {
                                    type: "string",
                                    description: "The search query to perform search on.",
                                },
                            },
                            required: ["query"],
                        },
                    },
                }, {
                    type: "function",
                    function: {
                        name: "factCheck",
                        description: "Search the web for evidence about a claim and return raw evidence and sources",
                        parameters: {
                            type: "object",
                            properties: {
                                claim: { type: "string" }
                            },
                            required: ["claim"]
                        }
                    }
                }
            ],
            tool_choice: "auto",
        });
        messages.push(completions.choices[0].message);
    } catch (error) {
        console.error("Error during Groq API call with tools:", error);
        return "An error occurred while trying to use the AI with tools. Please try again.";
    }

    const toolCalls = completions?.choices[0]?.message?.tool_calls;

    if (!toolCalls) {
      const finalMessage = completions.choices[0].message.content;
      let parsed;
      try {
        parsed = JSON.parse(finalMessage);
      } catch (err) {
        parsed = { type: "opinion", message: finalMessage };
      }
      cache.set(threadId, messages);
      return parsed;
    }

    for (const tool of toolCalls) {
      const functionName = tool.function.name;
      const functionParams = tool.function.arguments;

      if (functionName === "webSearch") {
        const toolResult = await webSearch(JSON.parse(functionParams));

        messages.push({
          tool_call_id: tool.id,
          role: "tool",
          name: functionName,
          content: toolResult,
        });
      }

      if (functionName === "factCheck") {
        const toolResult = await factCheck(JSON.parse(functionParams));

        messages.push({
          tool_call_id: tool.id,
          role: "tool",
          name: functionName,
          content: toolResult,
        });
      }
    }
    const finalResp = await groq.chat.completions.create({
        model: "llama-3.3-70b-versatile",
        messages,
        temperature: 0
    });

    const finalMessage = finalResp.choices[0].message.content;
    let parsed;
    try {
        parsed = JSON.parse(finalMessage);
    } catch (err) {
        parsed = { verdict: "unverified", summary: finalMessage, sources: [] };
    }
    cache.set(threadId, messages);
    return parsed;
  }
}
async function webSearch({ query }) {
  console.log("Calling web search...");

  const response = await tvly.search(query);

  const finalResult = response.results
    .map((result) => result.content)
    .join("\n\n");

  return finalResult;
}
