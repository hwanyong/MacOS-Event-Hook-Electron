# Electron 투명 창 만들기 가이드

## 1. 신호등 버튼 제거하기

macOS에서 신호등 버튼(traffic light buttons)을 제거하기 위한 설정:

```typescript
const mainWindow = new BrowserWindow({
  // ... 다른 설정들
  titleBarStyle: 'hidden',  // 타이틀바 숨기기
});

// 신호등 버튼 숨기기
mainWindow.setWindowButtonVisibility(false);
```

## 2. 배경 투명하게 만들기

### 핵심 설정

`main.ts`에서 BrowserWindow 설정:

```typescript
const mainWindow = new BrowserWindow({
  width: 800,
  height: 600,
  frame: false,           // 프레임 제거
  transparent: true,      // 투명도 활성화
  hasShadow: false,      // 그림자 제거
  titleBarStyle: 'hidden',// 타이틀바 숨기기
  backgroundColor: '#00000000',  // 완전 투명 배경색
  webPreferences: {
    nodeIntegration: true,
    contextIsolation: false
  }
});
```

### 주의사항

1. `vibrancy` 설정을 완전히 제거해야 합니다 (null이나 undefined로 설정하지 않음)
2. `backgroundColor`는 반드시 알파 채널이 0이어야 합니다 (`#00000000`)
3. 불필요한 윈도우 효과 설정을 제거해야 합니다

### HTML/CSS 설정

`index.html`에서 배경 투명도 설정:

```css
html, body {
  margin: 0;
  padding: 0;
  background: transparent !important;
  height: 100vh;
  overflow: hidden;
  user-select: none;
}

/* 다른 요소들도 투명 배경 적용 */
.content {
  background: transparent !important;
}
```

## 3. 트러블슈팅

1. 배경이 완전히 투명하지 않을 때:
   - `vibrancy` 설정이 있는지 확인
   - `backgroundColor`가 정확히 `#00000000`인지 확인
   - 불필요한 윈도우 효과 설정 제거

2. 신호등 버튼이 보일 때:
   - `titleBarStyle: 'hidden'` 확인
   - `setWindowButtonVisibility(false)` 호출 확인

## 4. 최종 코드

성공적인 투명 창을 위한 최소 설정:

```typescript
const mainWindow = new BrowserWindow({
  frame: false,
  transparent: true,
  hasShadow: false,
  titleBarStyle: 'hidden',
  backgroundColor: '#00000000',
  webPreferences: {
    nodeIntegration: true,
    contextIsolation: false
  }
});

mainWindow.setWindowButtonVisibility(false);
```
