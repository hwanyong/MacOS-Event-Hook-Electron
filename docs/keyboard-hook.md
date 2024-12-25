# 키보드 이벤트 훅 가이드

## 개요
이 문서는 Electron 앱에서 전역 키보드 이벤트 훅의 구현, 시작, 종료 및 관련 고려사항을 설명합니다.

## 구현 방식
- `@futpib/node-global-key-listener` 라이브러리 사용
- MacOS의 경우 `CGEventTap` API를 내부적으로 사용
- Input Monitoring 권한 필요

## 이벤트 훅 시작
### 시작 시점
- 앱 실행 후 Input Monitoring 권한 확인
- 권한이 승인된 경우에만 이벤트 훅 시작

### 시작 코드
```typescript
const startKeyboardTracking = () => {
  if (!isTrackingEnabled || keyboardListener) return;
  
  keyboardListener = new GlobalKeyboardListener();
  keyboardListener.addListener((e, down) => {
    // 이벤트 처리
  });
};
```

### 권한 요구사항
- MacOS: Input Monitoring 권한 필요
- `entitlements.mac.plist`에 권한 설정 필요
- 사용자에게 권한 요청 다이얼로그 표시

## 이벤트 훅 종료
### 종료가 필요한 이유
1. 리소스 관리
   - 시스템 리소스 사용 최적화
   - 메모리 누수 방지
   
2. 안정성
   - 다른 프로그램과의 충돌 방지
   - 시스템 키보드 입력 처리 정상화

3. 보안
   - 불필요한 이벤트 캡처 방지
   - 사용자 프라이버시 보호

### 종료 시점
1. 정상 종료
   - 앱 종료 시
   - 창 닫기 시
   - 권한 취소 시

2. 비정상 종료
   - 크래시 발생 시
   - 강제 종료 시
   - 시스템 셧다운 시

### 종료 코드
```typescript
const stopKeyboardTracking = () => {
  if (keyboardListener) {
    keyboardListener.kill();
    keyboardListener = null;
  }
};
```

## 안전장치
### 다중 안전장치 구현
1. Window 이벤트
```typescript
mainWindow.on('closed', cleanup);
```

2. App 이벤트
```typescript
app.on('before-quit', cleanup);
```

3. Window Unload 이벤트
```typescript
window.addEventListener('unload', cleanup);
```

### 비정상 종료 시 처리
- 크래시나 강제 종료 시 cleanup 함수가 호출되지 않을 수 있음
- MacOS는 프로세스 종료 시 자동으로 이벤트 훅 해제
- 시스템 레벨에서 리소스 정리 수행

## 문제 해결
### 이벤트 훅 해제 실패 시 영향
1. 시스템 영향
   - 키보드 입력 처리 지연 가능성
   - 다른 앱의 키보드 이벤트 처리 방해 가능성

2. 보안 위험
   - 불필요한 키보드 이벤트 캡처 지속
   - 잠재적인 개인정보 유출 위험

### 디버깅
- 콘솔 로그를 통한 이벤트 훅 상태 모니터링
- DevTools를 통한 문제 분석
- 시스템 로그 확인

## 모범 사례
1. 권한 관리
   - 필요한 최소한의 권한만 요청
   - 권한 상태 변경 시 적절한 처리

2. 리소스 관리
   - 이벤트 리스너 적절한 해제
   - 메모리 누수 방지

3. 에러 처리
   - 예외 상황 대비
   - 사용자 친화적인 에러 메시지
