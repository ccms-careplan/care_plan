from datetime import date

def generate_care_plan_content(assessment):
    data = assessment.structured_data or {}

    profile = data.get("resident_profile", {})
    mobility = data.get("mobility", {})
    nutrition = data.get("nutrition", {})
    adl = data.get("adl", {})
    risks = data.get("risks", [])
    care_focus = data.get("recommended_care_focus", [])

    return {
        "resident_profile": {
            "name": profile.get("name"),
            "dob": profile.get("date_of_birth"),
        },
        "functional_abilities": {
            "eating_and_diet": {
                "acuity_level": 3,
                "special_diet": nutrition.get("diet"),
                "caregiver_tasks": [
                    "Prepare and serve meals",
                    "Assist with feeding as needed",
                    "Monitor aspiration risk",
                    "Provide fluids every 2 hours",
                ],
                "goals": "Maintain nutrition and hydration",
            },
            "mobility": {
                "acuity_level": 4,
                "equipment": mobility.get("assistive_devices", []),
                "caregiver_tasks": [
                    "Assist with transfers",
                    "Wheelchair mobility support",
                    "Ensure resident safety",
                ],
                "goals": "Maintain safety and comfort",
            },
            "toileting": {
                "acuity_level": 4,
                "caregiver_tasks": [
                    "Catheter care",
                    "Incontinence care",
                    "Monitor urine and stool",
                ],
                "goals": "Maintain hygiene and dignity",
            },
        },
        "risks": risks,
        "recommended_focus": care_focus,
        "generated_at": date.today().isoformat(),
    }

















# import openai
# import json
# from assessments.models import Assessment
# from careplans.models import CarePlan


# def parse_plan_text_to_json(text):
#     return json.loads(text)


# def generate_careplan_options(assessment_id, created_by, num_options=3):
#     assessment = Assessment.objects.get(pk=assessment_id)
#     structured = assessment.structured_data or {}

#     plans = []

#     for i in range(num_options):
#         prompt = f"""
#         Return ONLY valid JSON.

#         {{
#           "goals": [
#             {{
#               "title": "string",
#               "objective": "string",
#               "interventions": ["string"]
#             }}
#           ]
#         }}

#         Assessment Data:
#         {structured}
#         """

#         resp = openai.ChatCompletion.create(
#             model="gpt-4o-mini",
#             messages=[
#                 {"role": "system", "content": "You generate structured care plans."},
#                 {"role": "user", "content": prompt},
#             ],
#             max_tokens=1500,
#         )

#         plan_json = parse_plan_text_to_json(
#             resp["choices"][0]["message"]["content"]
#         )

#         cp = CarePlan.objects.create(
#             company=assessment.company,
#             resident=assessment.resident,
#             assessment=assessment,
#             title=f"Care Plan Option {i+1}",
#             content=plan_json,
#             plan_type="ai",
#             created_by=created_by,
#         )

#         plans.append(cp)

#     return plans








# import openai
# from assessments.models import Assessment
# from careplans.models import CarePlan

# def generate_careplan_from_assessment(assessment_id, created_by):
#     assessment = Assessment.objects.get(pk=assessment_id)
#     structured = assessment.structured_data or {}
#     # Optionally fetch tenant-specific docs from Vector DB for RAG
#     context_docs = query_vector_db(assessment.tenant_id, structured)
#     prompt = build_prompt(structured, context_docs)
#     # call OpenAI (or other)
#     resp = openai.ChatCompletion.create(
#         model="gpt-4o-mini",
#         messages=[
#             {"role":"system","content":"You are a care-plan generator."},
#             {"role":"user","content": prompt}
#         ],
#         max_tokens=1500
#     )
#     plan_text = resp['choices'][0]['message']['content']
#     # convert plan_text into structured JSON (tasks, schedules)
#     plan_json = parse_plan_text_to_json(plan_text)
#     cp = CarePlan.objects.create(
#         tenant=assessment.tenant,
#         resident=assessment.resident,
#         assessment=assessment,
#         content=plan_json,
#         generated_by='ai',
#         created_by=created_by
#     )
#     return cp
