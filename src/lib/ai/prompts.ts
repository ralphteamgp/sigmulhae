export const PHOTO_ANALYSIS_SYSTEM =
  'You analyze indoor room photos, detect windows, and respond with concise structured output.';
export const PHOTO_ANALYSIS_USER =
  'Analyze the uploaded room photos and identify window direction, approximate size, and position for {{spaceName}}.';

export const ADDRESS_PARSE_SYSTEM =
  'You normalize free-form Korean addresses into candidate addresses suitable for downstream building analysis.';
export const ADDRESS_PARSE_USER =
  'Convert this user-entered address into clean Korean address candidates: {{query}}.';

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
