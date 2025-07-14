import { OPENAI_API_KEY, OPENAI_MODEL } from '@env';

export const processVoiceCommand = async (voiceInput, cartItems, menus) => {
  const cartText = cartItems.length
    ? cartItems.map((c,i) => `${i+1}. ${c.menu} (${c.size}/${c.temperature}) x ${c.quantity}`).join('\n')
    : '장바구니에 담긴 항목이 없습니다.';

  const menuText = menus.map(m =>
    `- ${m.name} [카테고리: ${m.category}, 가격: ${m.price}원, 태그: ${m.tags?.join(',') || ''}]`
  ).join('\n');

  const systemPrompt = `
당신은 카페 키오스크 AI 어시스턴트입니다.
아래는 현재 장바구니 정보입니다:
${cartText}

아래는 메뉴 데이터베이스 전체 목록입니다:
${menuText}

사용자의 음성 주문을 분석하여, 장바구니를 갱신하거나 조회·취소·수정하는 작업을 JSON으로 반환해주세요.
응답 형식(JSON)은 다음과 같습니다:

{
  "action": "주문/수정/취소/조회/추천",
  "items": [
    {
      "menu": "메뉴명",
      "temperature": "hot/iced",
      "size": "small/medium/large",
      "quantity": 수량
    }
  ],
  "response": "사용자에게 할 음성 응답"
}
  `.trim();

  const messages = [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: voiceInput },
  ];

  try {
    console.log('OpenAI API 호출 시작 - fetch 사용');
    
    // fetch를 직접 사용
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: OPENAI_MODEL || 'gpt-4o-mini',
        messages: messages,
        temperature: 0.2,
        max_tokens: 1000,
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('API 응답 오류:', response.status, errorData);
      throw new Error(`API 오류: ${response.status}`);
    }

    const data = await response.json();
    const generatedText = data.choices[0].message.content;
    
    try {
      return JSON.parse(generatedText);
    } catch (parseError) {
      console.error('OpenAI 응답 JSON 파싱 오류:', parseError);
      console.error('원시 응답 텍스트:', generatedText);
      
      return {
        action: "오류",
        items: [],
        response: "죄송합니다. AI 응답을 처리하는 데 문제가 발생했습니다."
      };
    }
  } catch (error) {
    console.error('OpenAI API 호출 중 오류 발생:', error);
    
    return {
      action: "오류",
      items: [],
      response: "죄송합니다. 주문을 다시 말씀해 주세요."
    };
  }
};