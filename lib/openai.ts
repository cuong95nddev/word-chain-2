import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
  dangerouslyAllowBrowser: true,
});

export async function generateFirstWord(): Promise<string> {
  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      response_format: {
        type: 'json_object',
      },
      messages: [
        {
          role: 'user',
          content: `Hãy đề xuất một từ tiếng Việt phù hợp để bắt đầu trò chơi nối từ.
                    Yêu cầu về từ:
                    1. Phải là từ tiếng Việt có nghĩa phổ biến, dễ hiểu
                    2. Độ dài từ 2-4 âm tiết
                    3. Không được là:
                       - Từ quá khó hoặc hiếm gặp
                       - Tên riêng (người, địa danh, thương hiệu)
                       - Từ mượn không phổ biến
                       - Từ có chứa các ký tự đặc biệt
                    4. Nên chọn từ có nhiều khả năng nối tiếp để trò chơi thú vị
                    
                    Trả về kết quả theo định dạng JSON:
                    {
                        "word": "từ được chọn",
                        "word_type": "loại từ",
                        "meaning": "nghĩa ngắn gọn của từ",
                        "syllables": ["các", "âm", "tiết", "tách", "riêng"],
                        "difficulty_level": "dễ/trung bình/khó"
                    }`,
        },
      ],
      temperature: 0.3,
    });

    console.log(response.choices[0].message.content);

    return JSON.parse(response.choices[0].message.content || '{}')?.word;
  } catch (error) {
    console.error('Error generating first word:', error);
    return '';
  }
}

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
