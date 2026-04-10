/**
 * Cloudflare Pages Function: POST /api/scan
 *
 * Receives Pokemon GO screenshots, sends them to Claude Vision API,
 * and returns an array of detected Pokemon names.
 */

interface Env {
  ANTHROPIC_API_KEY: string;
}

const MAX_FILES = 2;
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

export const onRequestPost: PagesFunction<Env> = async (context) => {
  try {
    const formData = await context.request.formData();

    // Collect image files from the form data
    const files: File[] = [];
    for (const [, value] of formData.entries()) {
      if (value instanceof File && value.type.startsWith("image/")) {
        files.push(value);
      }
    }

    if (files.length === 0) {
      return Response.json(
        { error: "No image files provided" },
        { status: 400 },
      );
    }

    if (files.length > MAX_FILES) {
      return Response.json(
        { error: "Max 2 screenshots" },
        { status: 400 },
      );
    }

    // Validate sizes and convert to base64
    const imageBlocks: Array<{
      type: "image";
      source: { type: "base64"; media_type: string; data: string };
    }> = [];

    for (const file of files) {
      if (file.size > MAX_FILE_SIZE) {
        return Response.json(
          { error: "File too large (max 5MB)" },
          { status: 400 },
        );
      }

      const buffer = await file.arrayBuffer();
      const bytes = new Uint8Array(buffer);
      let binary = "";
      for (let i = 0; i < bytes.length; i++) {
        binary += String.fromCharCode(bytes[i]);
      }
      const base64 = btoa(binary);

      imageBlocks.push({
        type: "image",
        source: {
          type: "base64",
          media_type: file.type,
          data: base64,
        },
      });
    }

    // Build the Claude API request
    const content = [
      ...imageBlocks,
      {
        type: "text" as const,
        text: 'List every Pokemon visible in this Pokemon GO storage screenshot. Return ONLY a JSON array of Pokemon names, e.g. ["Dragonite", "Venusaur"]. Include every visible Pokemon. Do not include any other text.',
      },
    ];

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": context.env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 1024,
        messages: [
          {
            role: "user",
            content,
          },
        ],
      }),
    });

    if (!response.ok) {
      console.error("Claude API error:", response.status, await response.text());
      return Response.json(
        { error: "Screenshot analysis failed" },
        { status: 502 },
      );
    }

    const result = (await response.json()) as {
      content: Array<{ type: string; text?: string }>;
    };

    // Extract the text response
    const textBlock = result.content.find((block) => block.type === "text");
    const text = textBlock?.text ?? "";

    // Parse the JSON array from the response
    const match = text.match(/\[[\s\S]*\]/);
    if (!match) {
      console.error("Could not parse Pokemon list from:", text);
      return Response.json(
        { error: "Could not parse Pokemon list" },
        { status: 502 },
      );
    }

    const pokemon: string[] = JSON.parse(match[0]);

    return Response.json({ pokemon });
  } catch (error) {
    console.error("Scan error:", error);
    return Response.json(
      { error: "Internal error" },
      { status: 500 },
    );
  }
};
