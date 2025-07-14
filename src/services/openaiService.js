import OpenAI from 'openai';
import { OPENAI_API_KEY, OPENAI_MODEL } from '@env'; // react-native-dotenv 사용 시

const openai = new OpenAI({
  apiKey: OPENAI_API_KEY,
  // ★ 중요: OpenAI API의 공식 baseURL을 명시적으로 설정합니다.
  // 이 설정은 다른 환경 변수나 숨겨진 설정이 OpenAI 요청에 영향을 미치는 것을 방지합니다.
  baseURL: 'https://api.openai.com/v1', 
});

export const processVoiceCommand = async (voiceInput, cartItems, menus) => {
   const cartText = cartItems.length
     ? cartItems.map((c,i) => `${i+1}. ${c.menu} (${c.size}/${c.temperature}) x ${c.quantity}`).join('\n')
     : '장바구니에 담긴 항목이 없습니다.';
 
   // 2) menus → 텍스트로 변환
  const menuText = menus.map(m =>
    `- ${m.name} [카테고리: ${m.category}, 가격: ${m.price}원, 태그: ${m.tags.join(',')}]`
  ).join('\n');
 
   // 3) system prompt 작성 (장바구니 + 메뉴 DB 포함)
   const systemPrompt = `
 당신은 카페 키오스크 AI 어시스턴트입니다.
 아래는 현재 장바구니 정보입니다:
 ${cartText}
 
 아래는 메뉴 데이터베이스 전체 목록입니다:
 ${menuText}
 
 사용자의 음성 주문을 분석하여, 장바구니를 갱신하거나 조회·취소·수정하는 작업을 JSON으로 반환해주세요.
 응답 형식(JSON)은 다음과 같습니다:
 
 {
   "action": "주문/수정/취소/조회",
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
사용자가 “어르신을 위한 메뉴를 추천해줘” 와 같은 요청을 하면,
tags 배열에 따라 알맞은 메뉴를 선택해 JSON으로 내려주세요.
tags 중 하나인 어르신과 비슷한 나이 많은 사람, 노인 등 유사한 정보가 담기면 해당 tags에 알맞는 메뉴를 JSON으로 내려주세요.
   `.trim();
 
   const messages = [
     { role: 'system', content: systemPrompt },
     { role: 'user',   content: voiceInput },
   ];

  try {
    const completion = await openai.chat.completions.create({
      model: OPENAI_MODEL || 'gpt-4o', // .env에서 가져온 모델 사용, 없으면 'gpt-4o' 기본값
      messages,
      temperature: 0.2,
      max_tokens: 1000,
    });

    const generatedText = completion.choices[0].message.content;
    
    // LLM 응답이 JSON 형식이라고 가정하고 파싱합니다.
    // JSON 파싱 오류에 대비하여 try-catch 블록을 추가합니다.
    try {
      return JSON.parse(generatedText);
    } catch (parseError) {
      console.error('OpenAI 응답 JSON 파싱 오류:', parseError);
      console.error('원시 응답 텍스트:', generatedText);
      // JSON 파싱에 실패하면, 기본 응답 형식에 맞춰 변환하여 반환합니다.
      return {
        action: "오류",
        items: [],
        response: "죄송합니다. AI 응답을 처리하는 데 문제가 발생했습니다."
      };
    }
  } catch (error) {
    console.error('OpenAI API 호출 중 오류 발생:', error);
    
    // API 호출 자체에서 오류가 발생했을 때 상세 정보 로깅
    if (error.response) { // axios 같은 라이브러리를 사용할 때 유용
      console.error('OpenAI API Error Response Data:', error.response.data);
      console.error('OpenAI API Error Response Status:', error.response.status);
      console.error('OpenAI API Error Response Headers:', error.response.headers);
    } else if (error.message) { // 일반적인 Error 객체일 경우
        console.error('OpenAI API Error Message:', error.message);
    }

    // 기본 응답 반환
    return {
      action: "오류",
      items: [],
      response: "죄송합니다. 주문을 다시 말씀해 주세요."
    };
  }
};