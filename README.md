# ⚡ IT-MEMO (아이티 메모)

> **퇴근 후 하루 30분, 이번 달 통장에 50만 원을 더하는 현실적인 직장인 부업 플랫폼**  
> 기획서: [`itmemo_Web_Plan.md`](./itmemo_Web_Plan.md)

---

## 📖 프로젝트 개요
**IT-MEMO**는 허황된 '월 천만 원 신화' 대신, 평범한 30대 직장인이 야근 후 직접 부딪히며 검증한 무자본 실무 파이프라인 공식과 10종 실전 템플릿을 제공하는 1인 지식 비즈니스 웹 플랫폼입니다.

* **타겟**: 퇴근 후 현실적인 부업으로 월 50만 원의 추가 소득을 원하는 30대 직장인
* **핵심 가치**: 
  1. **직장인 맞춤 현실성** (하루 30분 단계별 실천 로드맵)
  2. **과장 없는 투명한 신뢰** (실제 부업 정산 및 수강생 후기 인증)
  3. **복사해 쓰는 실천 템플릿** (즉시 활용 가능한 노션/엑셀 치트키 10종)
* **비즈니스 모델**: 토스페이먼츠 결제위젯 기반 **단건 결제 (One-time: 29,000원 얼리버드)**

---

## 🎨 디자인 시스템 (Design Tokens)
* **전체 분위기**: 스마트한 전문가의 현대식 오피스 (Modern & Professional)
* **기본 모드**: 라이트 모드 (Light Mode)
* **Primary Color**: `#10b981` (선명한 에메랄드 그린)
* **Background**: `#ffffff` (오프화이트)
* **Surface**: `#f8fafc` (슬레이트 라이트 그레이)
* **Text Main / Sub**: `#0f172a` (딥 슬레이트 차콜) / `#64748b` (슬레이트 미디엄)
* **Typography**: `Inter` / `Pretendard` (본문) + `JetBrains Mono` (로고/배지/수치)
* **인터랙션**:
  - 히어로 섹션 마우스 패럴랙스 캔버스 엔진
  - 수강생 검증 후기 무한 마퀴(Marquee) 슬라이더 (호버 시 일시 정지)
  - 카드·버튼 호버 리프트 효과 (`translateY(-4px)` + 그림자)

---

## 📂 페이지 구성 (Site Map)
1. [`index.html`](./index.html): 메인 홈 롱스크롤 (패럴랙스 히어로, 3대 가치, 무료 리드 마그넷 폼, 전자책 프리뷰, 후기 마퀴, 스토리, FAQ, 결제 모달)
2. [`products.html`](./products.html): 전자책 풀패키지(130p) 상세 커리큘럼, 10종 실무 템플릿 안내, 추천/비추천 필터
3. [`about.html`](./about.html): IT-MEMO 브랜드 스토리 & 강사의 진솔한 1년 부업 정산 타임라인
4. [`mypage.html`](./mypage.html): 수강생 전용 마이페이지 (PDF 1클릭 다운로드, 템플릿 다운로드, 1:1 Q&A 오픈채팅 링크)
5. [`payment-success.html`](./payment-success.html): 토스페이먼츠 결제 완료 승인 영수증 및 즉시 다운로드 화면
6. [`payment-fail.html`](./payment-fail.html): 결제 실패 원인 안내 및 재시도 화면
7. [`admin.html`](./admin.html): **비즈니스 관제탑 대시보드** (4대 KPI 지표, 실시간 주문 관리, 전자책 가격 수정, 무료 리드 CSV 내보내기)
8. [`login.html`](./login.html) / [`register.html`](./register.html): 1초 데모 계정 로그인 및 수강생 회원가입

---

## 🛠 실행 방법
정적 웹 서버(Python, Live Server 등)로 프로젝트 루트를 실행합니다.

```bash
# Python 내장 서버로 실행
python -m http.server 8080
```
브라우저에서 `http://localhost:8080/index.html`로 접속하여 확인하실 수 있습니다.

---

## 📜 기획 문서 히스토리
- `Concept_partner.md`: 컨셉 기획 파트너 지침
- `Payment_partner.md`: 결제 시스템 설계 파트너 지침
- `Brand_Design_Setup_Template.md`: 브랜드 디자인 토큰 생성 템플릿
- `Web_Plan_Template.md`: 원본 기획 템플릿 (보존)
- **`itmemo_Web_Plan.md`**: 최종 통합 웹 기획서 및 바이브코딩 명세서

---
© 2026 IT-MEMO. All rights reserved.
