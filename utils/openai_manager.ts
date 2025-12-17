import OpenAI from 'openai';

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || '',
});

export async function getLLMResponse(question: string, history: any[]) {
  try {
    const chatCompletion = await client.chat.completions.create({
      messages: [
        ...history,
        { role: 'user', content: question }],
      model: 'gpt-3.5-turbo',
    });

    return chatCompletion.choices[0].message.content;
  } catch (error: any) {
    throw new Error(error.message);
  }
}

export async function* getLLMResponseStream(question: string, history: any[]) {
  try {
    const stream = await client.chat.completions.create({
      messages: [
        ...history,
        { role: 'user', content: question }],
      model: 'gpt-3.5-turbo',
      stream: true,
    });

    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content;
      if (content) {
        yield content;
      }
    }
  } catch (error: any) {
    throw new Error(error.message);
  }
}

export async function getEmbedding(text: string) {
  try {
    const embedding = await client.embeddings.create({
      model: "text-embedding-3-small",
      input: text,
      encoding_format: "float",
    });
    return embedding.data[0].embedding;
  } catch (error: any) {
    throw new Error(error.message);
  }
}
