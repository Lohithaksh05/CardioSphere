"""
OpenAI Service — generates workout plans, diet plans, and risk recommendations
using GPT-4o-mini with structured JSON output.
"""

import json
from openai import AsyncOpenAI
from config import get_settings

settings = get_settings()
client = AsyncOpenAI(api_key=settings.OPENAI_API_KEY)


async def generate_workout_plan(
    age: int,
    heart_risk: str,
    equipment: list[str],
    injuries: str,
    fitness_goal: str,
    fitness_level: str = "beginner",
) -> dict:
    """Generate a personalized weekly workout plan."""
    prompt = f"""You are an expert cardiac rehabilitation fitness trainer.
Create a detailed 7-day workout plan for a patient with these parameters:
- Age: {age}
- Heart Disease Risk Level: {heart_risk}
- Available Equipment: {', '.join(equipment) if equipment else 'None (bodyweight only)'}
- Injuries/Limitations: {injuries or 'None'}
- Fitness Goal: {fitness_goal}
- Fitness Level: {fitness_level}

IMPORTANT: This person has heart health concerns. Prioritize safety.
Return ONLY valid JSON with this structure:
{{
  "plan_name": "string",
  "description": "string",
  "weekly_plan": [
    {{
      "day": "Monday",
      "focus": "string",
      "exercises": [
        {{"name": "string", "sets": number, "reps": "string", "rest_seconds": number}}
      ],
      "duration_minutes": number,
      "notes": "string"
    }}
  ],
  "safety_notes": ["string"]
}}"""

    response = await client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[
            {"role": "system", "content": "You are a cardiac rehabilitation fitness expert. Always return valid JSON."},
            {"role": "user", "content": prompt},
        ],
        temperature=0.7,
        max_tokens=3000,
    )

    content = response.choices[0].message.content.strip()
    # Strip markdown code fences if present
    if content.startswith("```"):
        content = content.split("\n", 1)[1]
        content = content.rsplit("```", 1)[0]

    return json.loads(content)


async def generate_diet_plan(
    age: int,
    weight_kg: float,
    height_cm: float,
    heart_risk: str,
    dietary_restrictions: list[str],
    goal: str,
) -> dict:
    """Generate a heart-healthy daily meal plan."""
    prompt = f"""You are an expert cardiac nutritionist.
Create a detailed daily meal plan for a patient with these parameters:
- Age: {age}
- Weight: {weight_kg} kg
- Height: {height_cm} cm
- Heart Disease Risk Level: {heart_risk}
- Dietary Restrictions: {', '.join(dietary_restrictions) if dietary_restrictions else 'None'}
- Goal: {goal}

Focus on heart-healthy foods: omega-3 rich fish, whole grains, leafy greens, berries, nuts.
Return ONLY valid JSON with this structure:
{{
  "plan_name": "string",
  "daily_calories": number,
  "meals": [
    {{
      "meal_type": "Breakfast|Lunch|Dinner|Snack",
      "name": "string",
      "calories": number,
      "protein_g": number,
      "carbs_g": number,
      "fat_g": number,
      "ingredients": ["string"],
      "description": "string"
    }}
  ],
  "heart_healthy_tips": ["string"],
  "foods_to_avoid": ["string"]
}}"""

    response = await client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[
            {"role": "system", "content": "You are a cardiac nutrition expert. Always return valid JSON."},
            {"role": "user", "content": prompt},
        ],
        temperature=0.7,
        max_tokens=3000,
    )

    content = response.choices[0].message.content.strip()
    if content.startswith("```"):
        content = content.split("\n", 1)[1]
        content = content.rsplit("```", 1)[0]

    return json.loads(content)


# Age category mapping (matches the CDC BRFSS dataset encoding)
_AGE_LABELS = {
    1: "18-24", 2: "25-29", 3: "30-34", 4: "35-39",
    5: "40-44", 6: "45-49", 7: "50-54", 8: "55-59",
    9: "60-64", 10: "65-69", 11: "70-74", 12: "75-79", 13: "80+",
}

_GENERAL_HEALTH_LABELS = {
    1: "Excellent", 2: "Very Good", 3: "Good", 4: "Fair", 5: "Poor",
}


def _build_profile_text(inputs: dict) -> str:
    """Convert raw model inputs into a readable patient profile string for GPT."""
    lines = [
        f"- Sex: {'Male' if inputs.get('sex') == 1 else 'Female'}",
        f"- Age group: {_AGE_LABELS.get(int(inputs.get('age', 7)), 'Unknown')}",
        f"- BMI: {inputs.get('bmi')} ({'Obese' if inputs.get('bmi', 0) >= 30 else 'Overweight' if inputs.get('bmi', 0) >= 25 else 'Normal' if inputs.get('bmi', 0) >= 18.5 else 'Underweight'})",
        f"- High Blood Pressure: {'Yes' if inputs.get('high_bp') == 1 else 'No'}",
        f"- High Cholesterol: {'Yes' if inputs.get('high_cholesterol') == 1 else 'No'}",
        f"- Cholesterol Check in last 5 years: {'Yes' if inputs.get('cholesterol_check') == 1 else 'No'}",
        f"- Smoker (100+ cigarettes in lifetime): {'Yes' if inputs.get('smoker') == 1 else 'No'}",
        f"- History of Stroke: {'Yes' if inputs.get('stroke') == 1 else 'No'}",
        f"- Diabetes: {'Diabetic' if inputs.get('diabetes') == 2 else 'Pre-diabetic' if inputs.get('diabetes') == 1 else 'No'}",
        f"- Physically Active in past 30 days: {'Yes' if inputs.get('physical_activity') == 1 else 'No'}",
        f"- Eats Fruit daily: {'Yes' if inputs.get('fruits') == 1 else 'No'}",
        f"- Eats Vegetables daily: {'Yes' if inputs.get('veggies') == 1 else 'No'}",
        f"- Heavy Alcohol Consumer: {'Yes' if inputs.get('heavy_alcohol') == 1 else 'No'}",
        f"- General Health: {_GENERAL_HEALTH_LABELS.get(int(inputs.get('general_health', 3)), 'Good')}",
        f"- Difficulty Walking: {'Yes' if inputs.get('difficulty_walking') == 1 else 'No'}",
    ]
    return "\n".join(lines)


async def generate_risk_recommendations(
    inputs: dict,
    risk_category: str,
    risk_percentage: float,
) -> dict:
    """
    Generate personalized heart disease risk explanations and recommendations
    based on the patient's specific input values.
    """
    profile = _build_profile_text(inputs)

    prompt = f"""You are a cardiologist and preventive health expert analyzing a patient's heart disease risk assessment.

Patient Profile:
{profile}

ML Model Result: {risk_percentage:.1f}% heart disease risk — classified as **{risk_category}** risk.

Based ONLY on this patient's specific values above, provide a personalized analysis. Be direct and specific — reference the actual values (e.g. "Your BMI of 32 puts you in the obese range", not generic advice).

Return ONLY valid JSON in this exact structure:
{{
  "summary": "2-3 sentence personalized overview of their risk and top drivers",
  "risk_factors": [
    {{
      "factor": "Short factor name",
      "explanation": "1-2 sentences explaining why THIS patient's specific value is a concern"
    }}
  ],
  "positive_factors": [
    "One sentence celebrating something this patient is already doing right"
  ],
  "lifestyle_changes": [
    {{
      "action": "Specific actionable step",
      "impact": "Why this will help them specifically",
      "priority": "high | medium | low"
    }}
  ],
  "medical_recommendations": [
    "Specific medical advice or tests they should discuss with their doctor"
  ]
}}

Rules:
- Include 2-5 risk_factors (only list factors where this patient's value is concerning)
- Include 1-4 positive_factors (only if their values genuinely support it)
- Include 3-5 lifestyle_changes ordered by priority
- Include 2-4 medical_recommendations
- Be empathetic but honest
- Do NOT make up conditions not present in the profile"""

    response = await client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[
            {
                "role": "system",
                "content": "You are an expert cardiologist providing personalized heart health analysis. Always return valid JSON only.",
            },
            {"role": "user", "content": prompt},
        ],
        temperature=0.5,
        max_tokens=1500,
    )

    content = response.choices[0].message.content.strip()
    if content.startswith("```"):
        content = content.split("\n", 1)[1]
        content = content.rsplit("```", 1)[0]

    return json.loads(content)
