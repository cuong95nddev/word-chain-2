import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
  dangerouslyAllowBrowser: true
});

export async function validateWord(
  word: string,
): Promise<boolean> {
  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content:
            "You are a helpful assistant that verifies if a Vietnamese word exists and has meaning. Reply with only 'true' or 'false'.",
        },
        {
          role: 'user',
          content: `Is "${word}" a valid Vietnamese word?`,
        },
      ],
      temperature: 0.3,
    });

    console.log(response.choices[0].message.content);

    return (
      response.choices[0].message.content?.toLowerCase() === 'true'
    );
  } catch (error) {
    console.error('Error validating word:', error);
    return false;
  }
}
