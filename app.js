import readlines from "node:readline/promises"
import dotenv from "dotenv";
dotenv.config({ quiet: true });
import { tavily } from "@tavily/core";
const tvly = tavily({ apiKey: process.env.TAVILY_API_KEY });

import Groq from "groq-sdk";
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
async function main() {
  
  const rl=readlines.createInterface({input:process.stdin,output:process.stdout })


  const messages = [
    {
      role: "system",
      content: `You are a friendly and intelligent chatbot. You must always respond using the following structured approach:
1. If you need to call a tool, do not return plain text. Always return the tool object with:
   - id
   - type
   - function.name
   - function.arguments as a JSON string
2. If you have no tool to call, then return a simple Assistant text message.

Rules:
- Keep tone conversational, positive, and polite.
- For technical questions, explain step by step if user asks for clarification.
- Never return plain text if a tool can be used; always return structured tool call.
You have access to the following tools:
1. webSearch({query}) - Search the latest information and real-time data from the internet
   `,
    }
    // {
    //   role: "user",
    //   content: "what is current weather in mumbai",
    // },
  ];



  while(true)
  {
      const question = await rl.question('User: '); // use singular "question" and await
  if (question.toLowerCase() === 'bye') break;

  messages.push({
    role: 'user',
    content: question
  });
    
    while (true) {
    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      temperature:0,
      messages: messages,
      tools: [
        {
          type: "function",
          function: {
            name: "webSearch",
            description:
              "Search the latest information and real-time data from the internet",
            parameters: {
              type: "object",
              properties: {
                query: {
                  type: "string",
                  description:
                    "Search query to perform search on, e.g. 'iPhone 16 release date','current net worth of elon musk'",
                },
              },
              required: ["query"],
            },
          },
        },
      ],
      tool_choice: "auto",
    });

    messages.push(completion.choices[0].message);

    const toolCalls = completion.choices[0].message.tool_calls;

    if (!toolCalls) {
      console.log(`Assistant: ${completion.choices[0].message.content}`);
      break;
    }

    for (const tool of toolCalls) {
      // console.log('tool:',tool);
      const functionName = tool.function.name;
      const functionArgument = tool.function.arguments;

      if (functionName == "webSearch") {
        const toolResult = await webSearch(JSON.parse(functionArgument));
        //  console.log("Tool result:",toolResult);

        messages.push({
          tool_call_id: tool.id,
          role: "tool",
          name: functionName,
          content: toolResult,
        });
      }
    }

    console.log(
      JSON.stringify(completion.choices[0].message.content, null, 2)
    );
  }
  }
  rl.close()
}

main().catch(console.error);


async function webSearch({ query }) {
  const response = await tvly.search(query);
  const finalResult = response.results
    .map((result) => result.content)
    .join("\n\n");
  return finalResult;
}
