const {VertexAI} = require('@google-cloud/vertexai');

// Initialize Vertex with your Cloud project and location
const vertex_ai = new VertexAI({project: 'personal-411706', location: 'us-central1'});
const model = 'gemini-1.5-pro-preview-0514';

// Instantiate the models
const generativeModel = vertex_ai.preview.getGenerativeModel({
  model: model,
  generationConfig: {
    'maxOutputTokens': 8192,
    'temperature': 1,
    'topP': 0.95,
  },
  safetySettings: [
    {
        'category': 'HARM_CATEGORY_HATE_SPEECH',
        'threshold': 'BLOCK_MEDIUM_AND_ABOVE'
    },
    {
        'category': 'HARM_CATEGORY_DANGEROUS_CONTENT',
        'threshold': 'BLOCK_MEDIUM_AND_ABOVE'
    },
    {
        'category': 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
        'threshold': 'BLOCK_MEDIUM_AND_ABOVE'
    },
    {
        'category': 'HARM_CATEGORY_HARASSMENT',
        'threshold': 'BLOCK_MEDIUM_AND_ABOVE'
    }
  ],
});


// generateContent();
const fs = require('fs');

function encodeFileToBase64(filePath) {
  const fileBuffer = fs.readFileSync(filePath);
  const base64String = fileBuffer.toString('base64');
  return base64String;
}

// Usage example
const filePath = 'favicon-16x16.png';
t = filePath.split('.')[-1]
const base64String = encodeFileToBase64(filePath);


if (t == 'pdf'){
var con = {
  inlineData: {
    mimeType: 'application/pdf',
    data: base64String
  }
}
}else{
  var con = {
    inlineData: {
      mimeType: 'image/jpeg',
      data: base64String
    }
  }
}
async function generateContent(contentt) {
  const req = {
    contents: [
      {role: 'user', parts: [{text: contentt}, con]}
    ],
  };

  const streamingResp = await generativeModel.generateContentStream(req);
  var txt = ''
  for await (const item of streamingResp.stream) {
    const texts = item.candidates.map(candidate => candidate.content.parts.map(part => part.text)).flat();
    txt += texts[0];
  }
  return txt;
}

(async () => {
  const h = await generateContent('Tell me more about this image');
  console.log(h);
})();
