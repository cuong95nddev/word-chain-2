import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
  dangerouslyAllowBrowser: true
});

export async function validateWord(
  word: string,
  previousWord?: string
): Promise<boolean> {
  try {
    const prompt = `Kiểm tra từ "${word}" có phải là một từ tiếng Việt hợp lệ không?${
      previousWord
        ? ` Và từ này có bắt đầu bằng chữ cuối của từ "${previousWord}" không?`
        : ''
    }`;

    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.3,
    });

    return (
      response.choices[0].message.content?.toLowerCase().includes('có') ?? false
    );
  } catch (error) {
    console.error('Error validating word:', error);
    return false;
  }
}
