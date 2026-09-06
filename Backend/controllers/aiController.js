const ai = require("../config/gemini");
const DEPARTMENTS = require("../constants/departments");

const testGemini = async (req, res) => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: "Explain what a hospital department is in one sentence.",
    });

    return res.status(200).json({
      success: true,
      response: response.text,
    });

  } catch (error) {
    console.error("Gemini Error:", error);

    return res.status(500).json({
      success: false,
      message: "Gemini API failed",
      error: error.message,
    });
  }
};


const suggestDepartment = async (req, res) => {
  try {
    const { problem } = req.body;

    // =========================================
    // 1. Validate patient problem
    // =========================================

    if (!problem || typeof problem !== "string") {
      return res.status(400).json({
        success: false,
        message: "Problem description is required",
      });
    }

    const trimmedProblem = problem.trim();

    if (trimmedProblem.length < 5) {
      return res.status(400).json({
        success: false,
        message: "Please describe your problem in more detail",
      });
    }

    // =========================================
    // 2. Create prompt
    // =========================================

    const prompt = `
You are an AI department-routing assistant for a healthcare
appointment application.

Your ONLY task is to understand the patient's problem and suggest
the most appropriate medical department.

IMPORTANT RULES:

1. You must select EXACTLY ONE department.
2. The department MUST be one of the departments listed below.
3. Do NOT create a new department.
4. Do NOT modify the department name.
5. Do NOT diagnose the patient.
6. Do NOT prescribe medicines or treatments.
7. Give a short and simple description/summary of the patient's
   complaint.
8. If the symptoms are unclear, choose the most appropriate
   general department from the list.

AVAILABLE DEPARTMENTS:

${DEPARTMENTS.map((dept, index) => `${index + 1}. ${dept}`).join("\n")}

Return ONLY valid JSON in exactly this format:

{
  "department": "EXACT department name from the list",
  "description": "Short summary of the patient's complaint"
}

Patient's problem:

${trimmedProblem}
`;

    // =========================================
    // 3. Call Gemini
    // =========================================

    const interaction = await ai.interactions.create({
      model: "gemini-3.6-flash",
      input: prompt,
    });

    // =========================================
    // 4. Get Gemini output
    // =========================================

    let aiText = interaction.output_text;

    if (!aiText) {
      return res.status(500).json({
        success: false,
        message: "AI returned an empty response",
      });
    }

    // Sometimes AI may return ```json ... ```
    aiText = aiText
      .replace(/^```json\s*/i, "")
      .replace(/^```\s*/i, "")
      .replace(/\s*```$/i, "")
      .trim();

    // =========================================
    // 5. Parse JSON
    // =========================================

    let result;

    try {
      result = JSON.parse(aiText);
    } catch (error) {
      console.error("Invalid AI JSON:", aiText);

      return res.status(500).json({
        success: false,
        message: "AI returned invalid response format",
      });
    }

    // =========================================
    // 6. Validate department
    // =========================================

    if (!DEPARTMENTS.includes(result.department)) {
      console.error(
        "Invalid department from AI:",
        result.department
      );

      return res.status(500).json({
        success: false,
        message: "AI returned an invalid department",
      });
    }

    // =========================================
    // 7. Validate description
    // =========================================

    if (
      !result.description ||
      typeof result.description !== "string"
    ) {
      return res.status(500).json({
        success: false,
        message: "AI returned an invalid description",
      });
    }

    // =========================================
    // 8. Return response
    // =========================================

    return res.status(200).json({
      success: true,

      suggestion: {
        department: result.department,
        description: result.description.trim(),
      },
    });

  } catch (error) {

    console.error(
      "AI DEPARTMENT SUGGESTION ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Unable to generate department suggestion",
      error: error.message,
    });
  }
};



module.exports = {
  testGemini,
  suggestDepartment
};