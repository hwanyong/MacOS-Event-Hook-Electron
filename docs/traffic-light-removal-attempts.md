# Electron MacOS 신호등 버튼 제거 시도 목록

## 시도 1: titleBarStyle만 사용
- [x] `titleBarStyle: 'hidden'`
- [x] `titleBarStyle: 'hiddenInset'`
- [x] `titleBarStyle: 'customButtonsOnHover'`
- [ ] 결과: 모두 실패

## 시도 2: frame 옵션만 사용
- [x] `frame: false`
- [x] `transparent: true` 추가
- [x] `backgroundColor: 'transparent'` 또는 `'#00000000'` 추가
- [ ] 결과: 실패

## 시도 3: titleBarOverlay 사용
- [x] `titleBarOverlay: { color: 'transparent', symbolColor: 'transparent', height: 0 }`
- [x] `titleBarStyle: 'hidden'`과 함께 사용
- [ ] 결과: 실패

## 시도 4: 이벤트와 메서드 사용
- [x] `setWindowButtonVisibility(false)` 직접 호출
- [x] `ready-to-show` 이벤트에서 호출
- [x] `setTimeout`으로 지연 후 호출
- [ ] 결과: 실패

## 시도 5: trafficLight 관련 설정
- [x] `trafficLightPosition` 설정
- [x] 화면 밖으로 이동 시도 (`x: -20, y: -20`)
- [ ] 결과: 실패

## 시도 6: webPreferences 설정 변경
- [x] `nodeIntegration: true`
- [x] `contextIsolation: true/false`
- [x] `enableRemoteModule: true`
- [ ] 결과: 실패

## 시도 7: 타입 관련 수정
- [x] `@types/node` 설치
- [ ] 결과: 타입 오류는 해결되었으나 기능은 여전히 실패

## 시도 8: 기본부터 시작해서 점진적 추가
- [ ] 가장 기본 설정으로 시작
  ```typescript
  {
    width: 800,
    height: 600,
    titleBarStyle: 'hidden'
  }
  ```
- [ ] 결과 확인 후 다음 조합 시도 예정:
  1. `titleBarStyle: 'hidden'` + `vibrancy: 'fullscreen'`
  2. `titleBarStyle: 'hidden'` + `frame: false` + `hasShadow: false`
  3. `titleBarStyle: 'hiddenInset'` + `movable: false`
  4. `titleBarStyle: 'hidden'` + CSS로 `-webkit-app-region: no-drag`

## 시도 9: 새로운 조합 시도
- [ ] `vibrancy` + `transparent` 조합
  ```typescript
  {
    titleBarStyle: 'hidden',
    vibrancy: 'fullscreen',
    transparent: true,
    backgroundColor: '#00000000'
  }
  ```
- [ ] `hasShadow` + `frame` 조합
  ```typescript
  {
    titleBarStyle: 'hidden',
    frame: false,
    hasShadow: false,
    transparent: true
  }
  ```
- [ ] `movable` + CSS 스타일 조합
  ```typescript
  {
    titleBarStyle: 'hidden',
    movable: false,
    transparent: true
  }
  ```
  ```css
  body {
    -webkit-app-region: no-drag;
  }
  ```

## 시도 10: MacOS 트래픽 라이트 버튼 제거 시도 기록
- [ ] 기본 설정
  - `frame: false`
  - `transparent: true`
  결과: 실패 - 버튼이 여전히 표시됨
- [ ] titleBarStyle 설정
  - `titleBarStyle: 'hidden'`
  - `titleBarOverlay: false`
  - `setWindowButtonVisibility(false)`
  - `setVibrancy('under-window')`
  - `setBackgroundColor('#00000000')`
  결과: 실패 - 버튼이 여전히 표시됨
- [ ] 세부 설정 추가
  - `hasShadow: false`
  - `roundedCorners: false`
  - `titleBarStyle: 'customButtonsOnHover'`
  - `trafficLightPosition: { x: -999, y: -999 }`
  - `setRepresentedFilename('')`
  - `setDocumentEdited(false)`
  결과: 실패 - 버튼이 여전히 표시됨
- [ ] CSS 시도
  ```css
  .titlebar {
    background: transparent;
    -webkit-app-region: drag;
    -webkit-user-select: none;
    z-index: 1000;
  }

  :root {
    --webkit-app-region-no-drag: none !important;
  }

  * {
    -webkit-app-region: inherit;
  }
  ```
  결과: 실패 - 버튼이 여전히 표시됨

## 현재까지의 결론
1. 공식 문서에서 제시하는 모든 방법을 시도해봤으나 실패
2. 각 옵션들의 다양한 조합을 시도했으나 실패
3. 이벤트 핸들링과 메서드 호출 시점을 다양하게 시도했으나 실패

## 다음 시도 예정
- [ ] Electron 버전 확인 및 업데이트 고려
- [ ] MacOS 버전별 동작 차이 확인
- [ ] 다른 사용자들의 해결 사례 조사
- [ ] 네이티브 macOS API 활용 검토
- [ ] Electron 커뮤니티의 다른 해결책 조사
- [ ] 대체 윈도우 관리 방식 검토
