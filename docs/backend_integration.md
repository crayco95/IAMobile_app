# App Flow, UI and Backend Requirements

## App flow and screens
- `Home` → CTA “Start” opens `Capture`.
- `Capture` → pick/take image, validations (JPG/PNG format and ≤ 5MB), simulated upload; on success navigates to `Result`.
- `Result` → shows `{ id, label, confidence }` and preview.

## UI and platform behavior
- Background: white→gray gradient; centered cards with metallic style.
- Buttons: burgundy red with darker pressed state.
- Web: camera may fall back to file picker; gallery uses native browser file selector.
- Mobile: camera and gallery via `expo-image-picker`.

## Required endpoints
- POST `/analyze`: receives image (`multipart/form-data`) and returns JSON result.
- GET `/health`: service status.

## Requirements and questions
- Authentication: Bearer token in `Authorization` header? API Key?
- Limits: max image size, allowed formats (JPG/PNG), rate limit.
- Success response: `{ id, label, confidence, meta? }`.
- Error response: `{ code, message, details? }` with proper HTTP codes.
- CORS: enable for mobile/web origin.

## Request examples

### fetch (React Native)
```ts
const form = new FormData()
form.append('file', { uri, name: 'image.jpg', type: 'image/jpeg' } as any)
const res = await fetch(`${BASE_URL}/analyze`, {
  method: 'POST',
  headers: { Authorization: `Bearer ${TOKEN}` },
  body: form
})
const data = await res.json()
```

### axios
```ts
import axios from 'axios'
const form = new FormData()
form.append('file', { uri, name: 'image.jpg', type: 'image/jpeg' } as any)
const { data } = await axios.post(`${BASE_URL}/analyze`, form, {
  headers: { Authorization: `Bearer ${TOKEN}` }
})
```

## Flask integration
- Libraries: `flask`, `flask-cors`, `werkzeug` for `request.files`.
- Example:
```py
from flask import Flask, request, jsonify
from flask_cors import CORS
app = Flask(__name__)
CORS(app)

@app.route('/health')
def health():
    return jsonify({ 'status': 'ok' })

@app.route('/analyze', methods=['POST'])
def analyze():
    f = request.files.get('file')
    if not f:
        return jsonify({ 'code': 'NO_FILE', 'message': 'file required' }), 400
    return jsonify({ 'id': 'x1', 'label': 'Cat', 'confidence': 0.87 })
```

## Spring Boot integration
- Annotations: `@PostMapping`, `@RequestParam("file") MultipartFile file`.
- Example:
```java
@RestController
public class ApiController {
  @GetMapping("/health")
  public Map<String, String> health() { return Map.of("status", "ok"); }

  @PostMapping("/analyze")
  public Map<String, Object> analyze(@RequestParam("file") MultipartFile file) {
    if (file == null || file.isEmpty()) {
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "file required");
    }
    return Map.of("id", "x1", "label", "Cat", "confidence", 0.87);
  }
}
```

## Reusable modules
- Configurable API client (`baseUrl`, `authToken`) in `src/api/client.ts`.
- Development mock in `src/api/mock.ts`.
- Switch to `uploadImage` when backend is ready.

## Response states and validations
- States: `idle`, `loading`, `success`, `error` via `src/hooks/useRequest.ts`.
- Validations: `src/utils/image.ts` and size/format logic in `src/screens/CaptureScreen.tsx`.

## Platform notes and dependencies
- `expo-image-picker`, `expo-file-system`, `react-navigation`, `expo-linear-gradient`, `expo-blur`, `@expo/vector-icons`.
- On web, camera may not be supported; gallery uses the browser’s file selector.