# Electron Test

A modern cross-platform desktop automation framework built with Electron and TypeScript. This native-like desktop application provides powerful system-wide keyboard listening and UI automation capabilities.

[한국어 문서](#한국어)

## Introduction

This Electron desktop application combines TypeScript's robust type safety with advanced automation features. It's designed as a comprehensive desktop automation tool that enables system-wide keyboard macro creation and mouse automation, making it perfect for workflow automation and UI testing.

## Demo Video

Watch our desktop automation tool in action:

[![Desktop Automation Demo](https://img.youtube.com/vi/hO8gianvkLk/0.jpg)](https://youtu.be/hO8gianvkLk)

Key highlights of this cross-platform automation framework:
- **Native Performance**: Built on Electron for native-like desktop application experience
- **Type-Safe Development**: Leveraging TypeScript for robust code quality
- **Modern Architecture**: Using ESM (ECMAScript Modules) for better code organization
- **Cross-Platform Support**: Works on Windows, macOS, and Linux

> **Note**: Currently, this desktop automation tool has only been tested on macOS. Additional testing and modifications may be required for other operating systems (Windows, Linux).

### Features
- **Transparent Frameless Window**: Create modern, native-like desktop applications with custom-designed windows
- **Global Keyboard Hook**: Implement system-wide keyboard listener for advanced macro capabilities
- **UI Automation**: Comprehensive mouse and keyboard automation through nut-js
- **Screen Capture**: Automated screen capture and image recognition capabilities
- **Background Processing**: Run automation tasks seamlessly in the background
- **Type-Safe Codebase**: Enterprise-grade development with TypeScript

## Use Cases

### 1. Gaming Automation
- Auto-farming in MMO games
- Game macro creation and management
- Multi-account game operation
- Custom hotkey combinations for gaming

### 2. Business Process Automation
- Data entry automation
- Form filling automation
- Repetitive click sequence automation
- Multi-window operation automation

### 3. Development & Testing
- UI testing automation
- Application behavior testing
- Development environment setup automation
- Build and deployment automation

### 4. Content Creation
- Streaming setup automation
- Video editing shortcuts
- Social media posting automation
- Content management automation

## Key Functions

### 1. Global Key Event Detection & Macro Support
- Advanced system-wide keyboard hook implementation
- Customizable keyboard macro creation
- Background process automation support
- Multi-key combination detection

### 2. Desktop Automation Features
- Precise mouse movement and click automation
- Keyboard input simulation and automation
- Automated screen capture and image recognition
- Custom automation scenario builder
- UI element interaction automation

## Technical Stack

- Electron
- TypeScript
- ESM (ECMAScript Modules)
- Node.js

## Installation

### Prerequisites

- Node.js 18.0.0 or higher
- pnpm 8.0.0 or higher
- Windows, macOS, or Linux OS

### Installation Steps

1. Clone Repository
```bash
git clone https://github.com/hwanyong/MacOS-Event-Hook-Electron.git
cd electron-test
```

2. Install Dependencies
```bash
pnpm install
```

3. Development Environment Setup
- Check TypeScript configuration (`tsconfig.json`)
- Set environment variables (if needed)

## Usage

### Development Mode

```bash
pnpm dev
```
- Auto-restart on source code changes
- Developer tools open automatically

### Debug Mode

```bash
pnpm debug
```
- Remote debugging via Chrome DevTools (port: 9223)
- Set breakpoints and inspect variables

### Production Build

1. Build
```bash
pnpm build
```

2. Run Production
```bash
pnpm start
```

### Create Distribution Package

```bash
pnpm dist
```
- Windows: Creates `.exe` file
- macOS: Creates `.dmg` file
- Linux: Creates `.AppImage` file

Distribution files can be found in the `release` directory.

## Development Guide

### Project Structure
```
electron-test/
├── src/           # Source code
├── dist/          # Built files
├── docs/          # Documentation
└── release/       # Distribution files
```

### Documentation

Detailed documentation can be found in the `docs` directory:

#### Implementation Guides
- [Transparent Frameless Implementation Guide](docs/01.transparent-frameless-implementation.md)
  - How to implement transparent frameless windows
  - Mouse event handling and drag functionality
  - Performance optimization tips

#### Archive Documents
- [Distribution Guide](docs/0.archive/distribution-guide.md)
  - Distribution package creation for each OS
  - Code signing and update process
  - Distribution settings optimization

- [ESM Preload Issue](docs/0.archive/esm-preload-issue.md)
  - Preload script issues when using ESM modules
  - Solutions and alternatives

- [Frameless Window Troubleshooting](docs/0.archive/frameless-window-troubleshooting.md)
  - Common issues with frameless windows
  - OS-specific considerations and solutions

- [Keyboard Hook Guide](docs/0.archive/keyboard-hook.md)
  - System-wide keyboard event detection implementation
  - Key combination handling and event handling
  - Security and permission settings

- [Transparent Window Guide](docs/0.archive/transparent-window-guide.md)
  - Creating and configuring transparent windows
  - Applying background blur effects
  - Performance considerations

## License

GNU General Public License v3.0 (GPLv3)

This project is free software, distributed under the terms of the GNU General Public License version 3:

- **Free Use, Modification, Distribution**: Anyone can freely use, modify, and distribute this software. You can create modified versions or include parts of this software in other software.

- **Commercial Use Allowed**: This software can be used for commercial purposes. For example, you can sell products or provide services based on this software.

- **Source Code Disclosure Required (Copyleft)**: When distributing this project or modified versions, you must release the source code under the same GPLv3 license. This ensures that derivative works maintain the same freedoms.

- **Patent Grant**: Contributors explicitly grant permission to use their patents. If you initiate patent litigation, all rights granted under the GPL license will be terminated.

- **License and Copyright Notice Required**: You must maintain the original license and copyright information when using this software. When modifying or distributing, you must include the original license file and acknowledge the original author's copyright.

- **No Warranty**: This software is provided "as is" without any warranty for quality or performance. All risks and responsibilities from using this software lie with the user.

For the complete license text, please refer to the [LICENSE](LICENSE) file.

---

# 한국어

Electron과 TypeScript로 구축된 현대적인 크로스 플랫폼 데스크톱 자동화 프레임워크입니다. 이 네이티브급 데스크톱 애플리케이션은 시스템 전역 키보드 감지와 UI 자동화 기능을 제공합니다.

## 소개

이 Electron 데스크톱 애플리케이션은 TypeScript의 강력한 타입 안정성과 고급 자동화 기능을 결합했습니다. 시스템 전역 키보드 매크로 생성과 마우스 자동화를 지원하는 종합적인 데스크톱 자동화 도구로 설계되어, 워크플로우 자동화와 UI 테스트에 완벽한 솔루션을 제공합니다.

## 데모 영상

데스크톱 자동화 도구의 실제 동작 모습을 확인해보세요:

[![데스크톱 자동화 데모](https://img.youtube.com/vi/hO8gianvkLk/0.jpg)](https://youtu.be/hO8gianvkLk)

크로스 플랫폼 자동화 프레임워크의 주요 특징:
- **네이티브급 성능**: Electron 기반으로 네이티브급 데스크톱 애플리케이션 경험 제공
- **타입 안전 개발**: TypeScript를 활용한 견고한 코드 품질 보장
- **현대적 아키텍처**: ESM(ECMAScript Modules)을 사용한 효율적인 코드 구성
- **크로스 플랫폼 지원**: Windows, macOS, Linux 지원

> **참고**: 현재 이 데스크톱 자동화 도구는 macOS에서만 테스트되었습니다. 다른 운영체제(Windows, Linux)에서는 추가 테스트와 수정이 필요할 수 있습니다.

### 특징
- **투명 프레임리스 윈도우**: 현대적이고 네이티브급 데스크톱 애플리케이션을 위한 커스텀 디자인 윈도우 구현
- **글로벌 키보드 후크**: 고급 매크로 기능을 위한 시스템 전역 키보드 리스너 구현
- **UI 자동화**: nut-js를 통한 포괄적인 마우스 및 키보드 자동화
- **화면 캡처**: 자동화된 화면 캡처 및 이미지 인식 기능
- **백그라운드 처리**: 백그라운드에서 원활한 자동화 작업 실행
- **타입 안전 코드베이스**: TypeScript를 활용한 기업급 개발 환경

## 사용 사례

### 1. 게임 자동화
- MMO 게임의 자동 팜
- 게임 매크로 생성 및 관리
- 멀티 계정 게임 운영
- 게임 전용 커스텀 핫키 조합

### 2. 비즈니스 프로세스 자동화
- 데이터 입력 자동화
- 양식 자동화
- 반복 클릭 시퀀스 자동화
- 멀티 윈도우 운영 자동화

### 3. 개발 및 테스트
- UI 테스트 자동화
- 애플리케이션 동작 테스트
- 개발 환경 설정 자동화
- 빌드 및 배포 자동화

### 4. 콘텐츠 제작
- 스트리밍 설정 자동화
- 비디오 편집 단축키
- 소셜 미디어 게시 자동화
- 콘텐츠 관리 자동화

## 주요 기능

### 1. 글로벌 키 이벤트 감지 및 매크로 지원
- 고급 시스템 전역 키보드 후크 구현
- 커스터마이즈 가능한 키보드 매크로 생성
- 백그라운드 프로세스 자동화 지원
- 멀티 키 조합 감지

### 2. 데스크톱 자동화 기능
- 정밀한 마우스 움직임 및 클릭 자동화
- 키보드 입력 시뮬레이션 및 자동화
- 자동화된 화면 캡처 및 이미지 인식
- 커스텀 자동화 시나리오 빌더
- UI 요소 상호작용 자동화

## 기술 스택

- Electron
- TypeScript
- ESM (ECMAScript Modules)
- Node.js

## 설치 방법

### 필요 조건

- Node.js 18.0.0 이상
- pnpm 8.0.0 이상
- Windows, macOS, 또는 Linux 운영체제

### 설치 단계

1. 저장소 클론
```bash
git clone https://github.com/hwanyong/MacOS-Event-Hook-Electron.git
cd electron-test
```

2. 의존성 설치
```bash
pnpm install
```

3. 개발 환경 설정
- TypeScript 설정 확인 (`tsconfig.json`)
- 환경 변수 설정 (필요한 경우)

## 사용 방법

### 개발 모드

```bash
pnpm dev
```
- 소스 코드 변경 시 자동으로 재시작됩니다.
- 개발자 도구가 자동으로 열립니다.

### 디버그 모드

```bash
pnpm debug
```
- 크롬 개발자 도구를 통한 원격 디버깅이 가능합니다 (포트: 9223).
- 브레이크포인트 설정 및 변수 검사가 가능합니다.

### 프로덕션 빌드

1. 빌드 실행
```bash
pnpm build
```

2. 프로덕션 실행
```bash
pnpm start
```

### 배포 패키지 생성

```bash
pnpm dist
```
- Windows: `.exe` 파일 생성
- macOS: `.dmg` 파일 생성
- Linux: `.AppImage` 파일 생성

생성된 배포 파일은 `release` 디렉토리에서 확인할 수 있습니다.

## 개발 가이드

### 프로젝트 구조
```
electron-test/
├── src/           # 소스 코드
├── dist/          # 빌드된 파일
├── docs/          # 문서
└── release/       # 배포 파일
```

### 문서

프로젝트와 관련된 자세한 문서는 `docs` 디렉토리에서 확인할 수 있습니다:

#### 구현 가이드
- [투명 프레임리스 구현 가이드](docs/01.transparent-frameless-implementation.md)
  - 투명한 배경의 프레임리스 윈도우 구현 방법
  - 마우스 이벤트 처리 및 드래그 기능 구현
  - 성능 최적화 팁

#### 아카이브 문서
- [배포 가이드](docs/0.archive/distribution-guide.md)
  - 각 운영체제별 배포 패키지 생성 방법
  - 코드 서명 및 업데이트 프로세스
  - 배포 설정 최적화

- [ESM Preload 이슈](docs/0.archive/esm-preload-issue.md)
  - ESM 모듈 사용 시 발생하는 preload 스크립트 관련 이슈
  - 해결 방법 및 대안 제시

- [프레임리스 윈도우 문제해결](docs/0.archive/frameless-window-troubleshooting.md)
  - 프레임리스 윈도우 사용 시 발생할 수 있는 문제점
  - 운영체제별 특이사항 및 해결 방법

- [키보드 후크 가이드](docs/0.archive/keyboard-hook.md)
  - 시스템 전역 키보드 이벤트 감지 구현 방법
  - 키 조합 처리 및 이벤트 핸들링
  - 보안 및 권한 설정

- [투명 윈도우 가이드](docs/0.archive/transparent-window-guide.md)
  - 투명 윈도우 생성 및 설정
  - 배경 블러 효과 적용
  - 성능 고려사항

## 라이선스

GNU General Public License v3.0 (GPLv3)

이 프로젝트는 자유 소프트웨어로, GNU General Public License version 3 조건에 따라 배포됩니다:

- **자유로운 사용, 수정, 배포**: 이 소프트웨어를 누구나 자유롭게 사용, 수정, 배포할 수 있습니다. 수정된 버전을 만들거나 이 소프트웨어의 일부를 다른 소프트웨어에 포함시킬 수 있습니다.

- **상업적 사용 가능**: 이 소프트웨어를 상업적 목적으로 사용할 수 있습니다. 예를 들어, 이 소프트웨어를 기반으로 한 제품을 판매하거나 서비스를 제공할 수 있습니다.

- **소스 코드 공개 필수 (Copyleft)**: 본 프로젝트를 사용하거나 수정하여 배포할 경우, 반드시 동일한 GPLv3 라이선스로 소스 코드를 공개해야 합니다. 이는 파생 저작물도 모두 동일한 자유를 보장받을 수 있도록 하기 위함입니다.

- **특허 사용 허가**: 기여자가 보유한 특허를 사용할 수 있는 명시적인 권한이 부여됩니다. 만약 특허 소송을 제기하면 GPL 라이선스에 의해 부여된 모든 권한이 종료됩니다.

- **라이선스 및 저작권 고지 필수**: 이 소프트웨어를 사용할 때는 원본 라이선스와 저작권 정보를 유지해야 합니다. 수정하거나 배포할 때도 원본 라이선스 파일을 포함시켜야 하며, 원작자의 저작권을 명시해야 합니다.

- **보증 책임 없음**: 이 소프트웨어는 "있는 그대로" 제공되며, 소프트웨어의 품질이나 성능에 대한 어떠한 보증도 제공하지 않습니다. 소프트웨어 사용으로 인한 모든 위험과 책임은 사용자에게 있습니다.

전체 라이선스 내용은 [LICENSE](LICENSE) 파일을 참조하세요.
