import { OPENAI_API_KEY, OPENAI_MODEL } from '@env';

export const processVoiceCommand = async (voiceInput, cartItems, menus) => {
  const cartText = cartItems.length
    ? cartItems.map((c, i) => `${i + 1}. ${c.menu} (옵션: ${c.options ? JSON.stringify(c.options) : '없음'}) x ${c.quantity}개`).join('\n')
    : '장바구니에 담긴 항목이 없습니다.';

  const menuText = menus.map(m =>
    `- ${m.name} [카테고리: ${m.category}, 가격: ${m.price}원, 온도옵션: ${m.temperatureOptions?.join(',') || '없음'}, 사이즈옵션: ${m.sizeOptions?.join(',') || '없음'}, 태그: ${m.tags?.join(',') || ''}]`
  ).join('\n');

  // **강화된 시스템 프롬프트**
  const systemPrompt = `
당신은 카페 키오스크 AI 어시스턴트입니다. 사용자의 음성 주문을 정확하게 이해하고 처리하는 것이 중요합니다.
장바구니는 아래와 같습니다:
${cartText}

메뉴 데이터베이스는 아래와 같습니다:
${menuText}

사용자의 요청에 따라 다음 JSON 형식으로 응답합니다:
{
  "action": "add" | "update" | "remove" | "query" | "recommend" | "error",
  "items": [
    {
      "menuName": "정확한 메뉴 이름 (메뉴 데이터베이스에 있는 이름과 일치해야 함, 예: 아메리카노)",
      "temperature": "hot" | "iced" | null, // 사용자가 언급했거나 메뉴에 해당 옵션이 있다면 hot 또는 iced, 없으면 null
      "size": "small" | "medium" | "large" | null, // 사용자가 언급했거나 메뉴에 해당 옵션이 있다면 small, medium, large, 없으면 null
      "quantity": 수량 // 사용자가 언급한 수량. 명확하지 않으면 1 (기본값)
      // 'update' 액션의 경우, 'originalOptions' 필드를 추가하여 어떤 항목을 수정하는지 명확히 할 수 있습니다.
      // "originalOptions": { "temperature": "기존온도", "size": "기존사이즈" } // 'update' 액션 시 필요
    }
  ],
  "response": "사용자에게 할 음성 응답 (사용자 친화적이고, 명령을 확인하거나 추가 정보를 요청하는 내용 포함)",
  "errorDetails": "오류 발생 시 상세 정보 (예: '메뉴를 찾을 수 없습니다' 등, action이 'error'일 경우에만 사용)"
}

지시사항:
1.  메뉴 매칭: 사용자가 말한 메뉴 이름은 '메뉴 데이터베이스'에 있는 'name'과 정확히 일치시켜야 합니다. 애매하면 'error' action을 사용합니다.
2.  옵션 처리:
    온도: '뜨거운', '따뜻한'은 "hot", '차가운', '아이스'는 "iced"로 매핑합니다. 메뉴에 온도 옵션이 없으면 null로 설정합니다.
    사이즈: '작은'은 "small", '보통', '중간'은 "medium", '큰'은 "large"로 매핑합니다. 메뉴에 사이즈 옵션이 없으면 null로 설정합니다.
    기본값:
         음료 (커피, 티, 라떼, 에이드, 스무디)의 경우: 온도가 명시되지 않았다면 iced를 기본으로, 사이즈가 명시되지 않았다면 medium(중간)을 기본으로 설정합니다.
         디저트의 경우: 온도/사이즈 옵션은 null로 설정합니다.
    모호한 옵션: 만약 '아메리카노 담아줘'처럼 온도나 사이즈 옵션이 명시되지 않았지만, 메뉴 데이터베이스에 해당 옵션이 있다면 위 기본값을 적용하여 JSON을 구성합니다.
3.  수량: 수량이 명시되지 않았다면 기본값 1을 사용합니다.
4.  액션 정의:
    "add": 메뉴를 장바구니에 추가합니다. (예: "아메리카노 한 잔 주세요", "소금빵 두 개 추가해줘")
    "update": 장바구니에 있는 기존 항목의 옵션이나 수량을 변경합니다. 이때 originalOptions를 사용하여 어떤 항목을 수정하는지 명확히 식별해야 합니다. (예: "아메리카노를 뜨겁게 바꿔줘", "라떼 수량을 2개로 변경해줘", "첫 번째 항목을 큰 사이즈로 변경해줘")
    "remove": 장바구니에서 특정 항목을 제거합니다. (예: "아메리카노 빼줘", "장바구니 비워줘")
    "query": 장바구니 내용이나 특정 메뉴 정보를 묻습니다. (예: "장바구니에 뭐 있어?", "아메리카노 얼마야?")
    "recommend": 메뉴 추천을 요청합니다. (예: "뭐 마실 거 추천해줘?", "새로운 메뉴 보여줘")
    "error": 사용자 요청을 이해할 수 없거나, 메뉴를 찾을 수 없거나, 유효하지 않은 요청인 경우. errorDetails 필드에 구체적인 이유를 명시합니다. (예: "없는 메뉴예요", "옵션이 잘못됐습니다")

예시:
- 사용자: "아이스 아메리카노 한 잔 담아줘"
- 응답 JSON: {"action": "add", "items": [{"menuName": "아메리카노", "temperature": "iced", "size": "medium", "quantity": 1}], "response": "아이스 아메리카노 한 잔을 장바구니에 담았습니다."}

- 사용자: "장바구니에 담긴 아메리카노를 뜨겁고 큰 사이즈로 바꿔줘" (장바구니에 아메리카노가 있고, hot/large 옵션이 가능할 때)
- 응답 JSON: {"action": "update", "items": [{"menuName": "아메리카노", "originalOptions": {"temperature": "iced", "size": "medium"}, "temperature": "hot", "size": "large"}], "response": "아메리카노를 뜨겁고 큰 사이즈로 변경했습니다."}

- 사용자: "카푸치노 두 잔 담아줘" (카푸치노가 메뉴에 없고, 사용자가 존재하지 않는 메뉴를 말할 때)
- 응답 JSON: {"action": "error", "items": [], "response": "죄송합니다, 카푸치노는 메뉴에 없습니다.", "errorDetails": "Menu not found"}

`.trim();

  const messages = [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: voiceInput },
  ];

  try {
    console.log('OpenAI API 호출 시작 - fetch 사용');

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: OPENAI_MODEL || 'gpt-4o-mini', // 기본 모델 설정
        messages: messages,
        temperature: 0.2, // 창의성보다는 정확성에 초점
        max_tokens: 1000,
        response_format: { type: "json_object" } // JSON 형식 응답 강제
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
      const parsedResponse = JSON.parse(generatedText);
      // LLM이 예상치 못한 필드를 반환할 수 있으므로, 여기서 유효성 검사 추가
      if (!parsedResponse.action || !Array.isArray(parsedResponse.items)) {
        throw new Error("Invalid JSON structure from LLM");
      }
      return parsedResponse;
    } catch (parseError) {
      console.error('OpenAI 응답 JSON 파싱 또는 유효성 검사 오류:', parseError);
      console.error('원시 응답 텍스트:', generatedText);

      return {
        action: "error",
        items: [],
        response: "죄송합니다. 주문 처리 중 오류가 발생했습니다. 다시 말씀해 주시겠어요?",
        errorDetails: "LLM response parsing failed"
      };
    }
  } catch (error) {
    console.error('OpenAI API 호출 중 오류 발생:', error);

    return {
      action: "error",
      items: [],
      response: "죄송합니다. 현재 음성 명령을 처리할 수 없습니다. 잠시 후 다시 시도해 주세요.",
      errorDetails: error.message
    };
  }
};