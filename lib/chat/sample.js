"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __asyncValues = (this && this.__asyncValues) || function (o) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var m = o[Symbol.asyncIterator], i;
    return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i);
    function verb(n) { i[n] = o[n] && function (v) { return new Promise(function (resolve, reject) { v = o[n](v), settle(resolve, reject, v.done, v.value); }); }; }
    function settle(resolve, reject, d, v) { Promise.resolve(v).then(function(v) { resolve({ value: v, done: d }); }, reject); }
};
Object.defineProperty(exports, "__esModule", { value: true });
var vertexai_1 = require("@google-cloud/vertexai");
var fs = require("fs");
// Initialize Vertex with your Cloud project and location
var vertexAI = new vertexai_1.VertexAI({ project: 'personal-411706', location: 'us-central1' });
var model = 'gemini-1.5-pro-preview-0514';
// Instantiate the generative model
var generativeModel = vertexAI.preview.getGenerativeModel({
    model: model,
    generationConfig: {
        'maxOutputTokens': 8192,
        'temperature': 1,
        'topP': 0.95,
    },
    safetySettings: [
        {
            category: vertexai_1.HarmCategory.HARM_CATEGORY_HATE_SPEECH,
            threshold: vertexai_1.HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE // Use HarmBlockThreshold enum to specify the threshold
        },
        {
            category: vertexai_1.HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
            threshold: vertexai_1.HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE
        },
        {
            category: vertexai_1.HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
            threshold: vertexai_1.HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE
        },
        {
            category: vertexai_1.HarmCategory.HARM_CATEGORY_HARASSMENT,
            threshold: vertexai_1.HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE
        }
    ],
});
// Function to encode file to base64
function encodeFileToBase64(filePath) {
    var fileBuffer = fs.readFileSync(filePath);
    return fileBuffer.toString('base64');
}
// Function to generate content based on input text
function generateContent(inputText) {
    return __awaiter(this, void 0, void 0, function () {
        var filePath, fileExtension, base64String, content, request, streamingResp, txt, _a, _b, _c, item, texts, e_1_1, error_1;
        var _d, e_1, _e, _f;
        var _g;
        return __generator(this, function (_h) {
            switch (_h.label) {
                case 0:
                    _h.trys.push([0, 14, , 15]);
                    filePath = 'favicon-16x16.png';
                    fileExtension = filePath.split('.').pop();
                    base64String = encodeFileToBase64(filePath);
                    content = {
                        inlineData: {
                            mimeType: fileExtension === 'pdf' ? 'application/pdf' : 'image/jpeg',
                            data: base64String
                        }
                    };
                    request = {
                        contents: [
                            { role: 'user', parts: [{ text: inputText }, content] }
                        ],
                    };
                    return [4 /*yield*/, generativeModel.generateContentStream(request)];
                case 1:
                    streamingResp = _h.sent();
                    txt = '';
                    _h.label = 2;
                case 2:
                    _h.trys.push([2, 7, 8, 13]);
                    _a = true, _b = __asyncValues(streamingResp.stream);
                    _h.label = 3;
                case 3: return [4 /*yield*/, _b.next()];
                case 4:
                    if (!(_c = _h.sent(), _d = _c.done, !_d)) return [3 /*break*/, 6];
                    _f = _c.value;
                    _a = false;
                    item = _f;
                    texts = (_g = item.candidates) === null || _g === void 0 ? void 0 : _g.map(function (candidate) { return candidate.content.parts.map(function (part) { return part.text; }); }).flat();
                    if (texts) {
                        txt += texts[0];
                    }
                    _h.label = 5;
                case 5:
                    _a = true;
                    return [3 /*break*/, 3];
                case 6: return [3 /*break*/, 13];
                case 7:
                    e_1_1 = _h.sent();
                    e_1 = { error: e_1_1 };
                    return [3 /*break*/, 13];
                case 8:
                    _h.trys.push([8, , 11, 12]);
                    if (!(!_a && !_d && (_e = _b.return))) return [3 /*break*/, 10];
                    return [4 /*yield*/, _e.call(_b)];
                case 9:
                    _h.sent();
                    _h.label = 10;
                case 10: return [3 /*break*/, 12];
                case 11:
                    if (e_1) throw e_1.error;
                    return [7 /*endfinally*/];
                case 12: return [7 /*endfinally*/];
                case 13: return [2 /*return*/, txt];
                case 14:
                    error_1 = _h.sent();
                    console.error('Error generating content:', error_1);
                    return [2 /*return*/, '']; // Return empty string in case of error
                case 15: return [2 /*return*/];
            }
        });
    });
}
// Example usage
(function () { return __awaiter(void 0, void 0, void 0, function () {
    var inputText, generatedText;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                inputText = 'Tell me more about this image';
                return [4 /*yield*/, generateContent(inputText)];
            case 1:
                generatedText = _a.sent();
                console.log(generatedText);
                return [2 /*return*/];
        }
    });
}); })();
