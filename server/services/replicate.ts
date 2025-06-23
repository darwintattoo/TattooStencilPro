import Replicate from "replicate";

if (!process.env.REPLICATE_API_TOKEN) {
  throw new Error("REPLICATE_API_TOKEN environment variable is required");
}

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
});

export interface GenerationSettings {
  guidanceScale?: number;
  steps?: number;
  aspectRatio?: string;
  style?: string;
  lineWeight?: string;
}

export async function generateTattooStencil(
  prompt: string,
  referenceImageUrl?: string,
  settings: GenerationSettings = {}
): Promise<string> {
  const {
    guidanceScale = 7.5,
    steps = 30,
    aspectRatio = "4:3",
    style = "traditional",
    lineWeight = "medium"
  } = settings;

  // Enhance prompt for tattoo stencil generation
  const enhancedPrompt = `Professional tattoo stencil design, ${prompt}, black and white line art, bold clean lines, ${style} tattoo style, ${lineWeight} line weight, high contrast, suitable for tattooing, detailed line work, professional tattoo flash art style`;

  const input: any = {
    prompt: enhancedPrompt,
    guidance_scale: guidanceScale,
    num_inference_steps: steps,
    aspect_ratio: aspectRatio,
    output_format: "png",
    output_quality: 90,
  };

  if (referenceImageUrl) {
    input.image = referenceImageUrl;
    input.prompt_strength = 0.7; // Allow for significant modification while maintaining reference
  }

  try {
    const output = await replicate.run(
      "black-forest-labs/flux-kontext-pro",
      { input }
    );

    if (Array.isArray(output) && output.length > 0) {
      return output[0] as string;
    } else if (typeof output === 'string') {
      return output;
    } else {
      throw new Error("Unexpected output format from Replicate");
    }
  } catch (error) {
    console.error("Replicate generation error:", error);
    throw new Error(`Failed to generate image: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export async function checkGenerationStatus(predictionId: string): Promise<{
  status: string;
  output?: string[];
  error?: string;
}> {
  try {
    const prediction = await replicate.predictions.get(predictionId);
    return {
      status: prediction.status,
      output: prediction.output,
      error: prediction.error,
    };
  } catch (error) {
    console.error("Error checking prediction status:", error);
    throw error;
  }
}
