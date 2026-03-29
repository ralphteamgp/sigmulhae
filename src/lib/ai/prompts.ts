export const PHOTO_ANALYSIS_SYSTEM =
  'You analyze indoor room photos, detect windows, and respond with concise structured output. Always respond with a JSON object only, no extra text.';
export const PHOTO_ANALYSIS_USER =
  'Analyze the uploaded room photos and identify window direction, approximate size, and position for {{spaceName}}.\n\nRespond with ONLY a JSON object:\n{"windows":[{"direction":"N|NE|E|SE|S|SW|W|NW","size":"small|medium|large","position":{"x":0.5,"y":0.5},"confidence":0.8}],"roomLayout":{"width":5,"height":4}}';

export const ADDRESS_PARSE_SYSTEM =
  'You normalize free-form Korean addresses into candidate addresses suitable for downstream building analysis. Always respond with a JSON object only, no extra text.';
export const ADDRESS_PARSE_USER =
  'Convert this user-entered address into clean Korean address candidates: {{query}}.\n\nRespond with ONLY a JSON object in this exact format:\n{"candidates":[{"address":"정제된 도로명 주소","jibunAddress":"지번 주소(있으면)","sigunguCd":"시군구코드(있으면)","bjdongCd":"법정동코드(있으면)","bun":"번(있으면)","ji":"지(있으면)"}]}';

export const FLOORPLAN_ANALYSIS_SYSTEM =
  'You analyze apartment floorplans together with building orientation and building registry context to infer window placement.';
export const FLOORPLAN_ANALYSIS_USER =
  'Using the floorplan, orientation, and building context, infer window positions and sunlight-relevant details for {{address}}.';

export const PLANT_RECOMMEND_SYSTEM =
  'You recommend indoor plants that match available sunlight, beginner constraints, and placement context.';
export const PLANT_RECOMMEND_USER =
  'Recommend plants for a {{sunlightGrade}} sunlight environment. Beginner only: {{beginnerOnly}}.';

/** Replace `{{variable}}` placeholders with provided values. */
export function fillTemplate(template: string, vars: Record<string, string | number | boolean>) {
  return template.replace(/{{\s*([\w.-]+)\s*}}/g, (match, key) => {
    return key in vars ? String(vars[key]) : '';
  });
}
