# Electron 앱 배포 가이드

이 문서는 Electron 앱의 배포 프로세스를 상세히 설명합니다.

## 목차
1. [준비 사항](#준비-사항)
2. [기본 설정](#기본-설정)
3. [배포 설정](#배포-설정)
4. [빌드 및 배포](#빌드-및-배포)
5. [버전 관리](#버전-관리)
6. [고급 설정](#고급-설정)

## 준비 사항

### 필수 패키지
- electron-builder: `pnpm add -D electron-builder`
- electron은 반드시 devDependencies에 있어야 함

### 버전 관리 설정
배포 관련 파일들을 Git에서 제외하기 위해 .gitignore에 다음 항목을 추가:

```gitignore
# Electron distribution
/release
*.dmg
*.exe
*.deb
*.AppImage
*.snap
*.blockmap
latest-mac.yml
latest-linux.yml
latest-version.yml
```

## 기본 설정

### package.json 스크립트
```json
{
  "scripts": {
    "build": "tsc && mv dist/preload.js dist/preload.mjs",
    "dist": "pnpm run build && electron-builder"
  }
}
```

### electron-builder 설정
```json
{
  "build": {
    "appId": "com.your.app",
    "productName": "Your App Name",
    "directories": {
      "output": "release"
    },
    "files": [
      "dist/**/*",
      "index.html"
    ],
    "mac": {
      "category": "public.app-category.utilities",
      "target": ["dmg", "zip"]
    }
  }
}
```

## 배포 설정

### 1. 기본 배포
```bash
pnpm run dist
```
- `release` 디렉토리에 다음 파일들이 생성됨:
  - `{productName}-{version}-arm64.dmg`: 설치 파일
  - `{productName}-{version}-arm64-mac.zip`: 압축 파일

### 2. 멀티 플랫폼 배포
```json
{
  "build": {
    "mac": {
      "target": ["dmg", "zip"]
    },
    "win": {
      "target": ["nsis", "zip"]
    },
    "linux": {
      "target": ["AppImage", "deb"]
    }
  }
}
```

## 고급 설정

### 1. 앱 아이콘 설정
1. 아이콘 파일 준비:
   - macOS: `.icns` 파일 (1024x1024)
   - Windows: `.ico` 파일
   - Linux: `.png` 파일 (512x512)

2. package.json 설정:
```json
{
  "build": {
    "mac": {
      "icon": "build/icon.icns"
    },
    "win": {
      "icon": "build/icon.ico"
    },
    "linux": {
      "icon": "build/icon.png"
    }
  }
}
```

### 2. 코드 서명

#### macOS 코드 서명
1. Apple Developer Program 가입
2. Xcode에서 인증서 생성:
   - Xcode > Preferences > Accounts
   - Apple ID 추가
   - "Developer ID Application" 인증서 생성

3. package.json 설정:
```json
{
  "build": {
    "mac": {
      "identity": "Developer ID Application: Your Name (Team ID)"
    }
  }
}
```

#### Windows 코드 서명
1. 코드 서명 인증서 구매/획득
2. 환경 변수 설정:
```bash
export CSC_LINK=path/to/certificate.pfx
export CSC_KEY_PASSWORD=your-password
```

3. package.json 설정:
```json
{
  "build": {
    "win": {
      "certificateFile": "path/to/certificate.pfx",
      "certificatePassword": "your-password"
    }
  }
}
```

## 자동화된 배포

### GitHub Actions 예시
```yaml
name: Build and Release
on:
  push:
    tags:
      - 'v*'

jobs:
  release:
    runs-on: ${{ matrix.os }}
    strategy:
      matrix:
        os: [macos-latest, windows-latest, ubuntu-latest]

    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
      - run: pnpm install
      - run: pnpm run dist

      - name: Release
        uses: softprops/action-gh-release@v1
        with:
          files: "release/**"
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

## 문제 해결

### 일반적인 문제들

1. electron이 dependencies에 있는 경우:
   - electron을 devDependencies로 이동
   ```bash
   pnpm remove electron
   pnpm add -D electron
   ```

2. pnpm 사용 시 의존성 문제
   이 문제는 pnpm의 엄격한 의존성 관리 방식과 electron-builder의 호환성 문제로 발생할 수 있습니다.

   해결 방법:
   1. `.npmrc` 파일 생성 및 설정
   ```text:.npmrc
   node-linker=hoisted
   shamefully-hoist=true
   ```

   2. package.json에 resolutions 추가
   ```json
   {
     "resolutions": {
       "aws4": "^1.12.0",
       "aws-sign2": "^0.7.0",
       "asn1": "^0.2.6"
     }
   }
   ```

   3. 의존성 재설치
   ```bash
   # 기존 의존성 제거
   rm -rf node_modules
   rm pnpm-lock.yaml

   # store 정리
   pnpm store prune

   # 의존성 재설치
   pnpm install
   ```

   > **설명**:
   > - `node-linker=hoisted`: node_modules 구조를 npm과 유사하게 평탄화합니다.
   > - `shamefully-hoist=true`: 모든 의존성을 루트 node_modules에 호이스팅합니다.
   > - `resolutions`: 특정 패키지의 버전을 명시적으로 고정합니다.

3. 코드 서명 오류:
   - 개발 중에는 코드 서명을 비활성화할 수 있음
   ```json
   {
     "build": {
       "mac": {
         "identity": null
       }
     }
   }
   ```
