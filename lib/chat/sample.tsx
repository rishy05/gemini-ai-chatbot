import { VertexAI, HarmCategory, HarmBlockThreshold } from '@google-cloud/vertexai';
import * as fs from 'fs';

// Initialize Vertex with your Cloud project and location
const vertexAI = new VertexAI({ project: 'personal-411706', location: 'us-central1' });

const model = 'gemini-1.5-pro-preview-0514';

// Instantiate the generative model
const generativeModel = vertexAI.preview.getGenerativeModel({
  model: model,
  generationConfig: {
    'maxOutputTokens': 8192,
    'temperature': 1,
    'topP': 0.95,
  },
  safetySettings: [
    {
      category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
      threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE // Use HarmBlockThreshold enum to specify the threshold
    },
    {
      category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
      threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE
    },
    {
      category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
      threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE
    },
    {
      category: HarmCategory.HARM_CATEGORY_HARASSMENT,
      threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE
    }
  ],
});

// Function to encode file to base64
function encodeFileToBase64(filePath: string): string {
  const fileBuffer = fs.readFileSync(filePath);
  return fileBuffer.toString('base64');
}

// Function to generate content based on input text
async function generateContent(inputText: string): Promise<string> {
  try {
    const filePath = 'favicon-16x16.png'; // Example file path
    const fileExtension = filePath.split('.').pop();
    const base64String = encodeFileToBase64(filePath);

    const content = {
      inlineData: {
        mimeType: fileExtension === 'pdf' ? 'application/pdf' : 'image/jpeg',
        data: base64String
      }
    };

    const request = {
      contents: [
        { role: 'user', parts: [{ text: inputText }, content] }
      ],
    };

    const streamingResp = await generativeModel.generateContentStream(request);
    let txt = '';

    for await (const item of streamingResp.stream) {
  const texts = item.candidates?.map(candidate => candidate.content.parts.map(part => part.text)).flat();
  if (texts) {
    txt += texts[0];
  }
}
    return txt;
  } catch (error) {
    console.error('Error generating content:', error);
    return ''; // Return empty string in case of error
  }
}

// Example usage
(async () => {
  const inputText = 'Tell me more about this image';
  const generatedText = await generateContent(inputText);
  console.log(generatedText);
})();