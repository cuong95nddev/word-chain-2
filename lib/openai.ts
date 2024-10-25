import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
  dangerouslyAllowBrowser: true,
});

export async function validateWord(word: string): Promise<boolean> {
  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      response_format: {
        type: 'json_object',
      },
      messages: [
        {
          role: 'user',
          content: `Hãy phân tích từ "${word}" và cho biết đây có phải là một từ tiếng Việt có nghĩa hay không.
Yêu cầu:
Xác định xem đây có phải là một từ tiếng Việt có nghĩa hay không
Nếu là từ có nghĩa, hãy cho biết:
Loại từ (danh từ, động từ, tính từ, etc.)
Nghĩa chính của từ
Nếu không phải từ có nghĩa, hãy giải thích lý do
Trả về kết quả theo định dạng JSON: { "is_valid_word": true/false, "word_type": "loại từ", "meaning": "nghĩa của từ", "explanation": "giải thích thêm nếu cần" }`,
        },
      ],
      temperature: 0.3,
    });

    console.log(response.choices[0].message.content);

    return (
      JSON.parse(response.choices[0].message.content || '{}')?.is_valid_word ===
      true
    );
  } catch (error) {
    console.error('Error validating word:', error);
    return false;
  }
}
