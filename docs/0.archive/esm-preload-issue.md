# Electron ESM 프리로드 스크립트 문제 해결

## 문제 상황
1. ESM으로 작성된 TypeScript 프리로드 스크립트가 컴파일 후에도 ESM 형식을 유지해야 함
2. 기존 에러 메시지:
```
Error: require() of ES Module /dist/preload.js not supported.
Instead change the require of preload.js in null to a dynamic import() which is available in all CommonJS modules.
```

## 원인 분석
1. TypeScript는 `.ts` 파일을 `.js`로 컴파일하지만, 이 `.js` 파일은 여전히 ESM 문법을 포함
2. Electron은 기본적으로 `.js` 확장자 파일을 CommonJS로 인식하려고 시도
3. 따라서 ESM으로 작성된 `.js` 파일을 `require()`로 로드하려다 실패

## 해결 방법
1. 프리로드 스크립트의 확장자를 `.mjs`로 변경하여 명시적으로 ESM임을 표시
   - `package.json`의 build 스크립트 수정:
   ```json
   "build": "tsc && mv dist/preload.js dist/preload.mjs"
   ```

2. `main.ts`에서 프리로드 스크립트 경로 수정:
   ```typescript
   preload: fileURLToPath(new URL('./preload.mjs', import.meta.url))
   ```

## 교훈
1. Node.js/Electron 환경에서 ESM을 사용할 때는 파일 확장자가 중요
   - `.js`: 기본적으로 CommonJS로 취급
   - `.mjs`: 명시적으로 ESM으로 취급
2. TypeScript 설정만으로는 불충분하며, 빌드 후 파일 확장자도 고려해야 함
