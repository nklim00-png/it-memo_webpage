-- ============================================================
-- IT-MEMO Supabase Database Schema Setup Script
-- Project: it-memo commercial knowledge-platform
-- Supabase URL: https://gkjpufztigyufkfdlzov.supabase.co
-- ============================================================

-- 1. UUID 확장 모듈 활성화 (PostgreSQL 내장 gen_random_uuid)
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================
-- 2. 'products' 테이블 생성
-- ============================================================
CREATE TABLE IF NOT EXISTS public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category TEXT NOT NULL,                  -- 'ebook', 'vod', 'free'
  title TEXT NOT NULL,                     -- 상품명
  price NUMERIC NOT NULL DEFAULT 0,        -- 판매가 (0원: 무료배포)
  description TEXT,                        -- 한줄 요약 설명
  image_url TEXT,                          -- 1:1 정사각 썸네일 이미지 (Base64 또는 URL)
  detail_content TEXT,                     -- 네이버 블로그 스타일 상세페이지 HTML 본문
  created_at TIMESTAMPTZ DEFAULT NOW()     -- 등록일시
);

-- ============================================================
-- 3. 'newsletter_subscribers' 테이블 생성
-- ============================================================
CREATE TABLE IF NOT EXISTS public.newsletter_subscribers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,                      -- 구독자 성함
  phone TEXT,                              -- 연락처
  email TEXT NOT NULL,                     -- 이메일 주소
  created_at TIMESTAMPTZ DEFAULT NOW()     -- 신청일시
);

-- ============================================================
-- 4. Row Level Security (RLS) 활성화 및 Anon 권한 허용 정책
-- ============================================================

-- 4-1. products 테이블 RLS 활성화
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- 기존 정책이 존재할 경우를 대비해 초기화
DROP POLICY IF EXISTS "Allow anon and auth full access to products" ON public.products;
DROP POLICY IF EXISTS "Allow anon read products" ON public.products;
DROP POLICY IF EXISTS "Allow anon insert products" ON public.products;
DROP POLICY IF EXISTS "Allow anon update products" ON public.products;
DROP POLICY IF EXISTS "Allow anon delete products" ON public.products;

-- Anon 및 Authenticated 사용자에게 SELECT, INSERT, UPDATE, DELETE 완전 허용
CREATE POLICY "Allow anon read products" 
  ON public.products 
  FOR SELECT 
  TO anon, authenticated 
  USING (true);

CREATE POLICY "Allow anon insert products" 
  ON public.products 
  FOR INSERT 
  TO anon, authenticated 
  WITH CHECK (true);

CREATE POLICY "Allow anon update products" 
  ON public.products 
  FOR UPDATE 
  TO anon, authenticated 
  USING (true) 
  WITH CHECK (true);

CREATE POLICY "Allow anon delete products" 
  ON public.products 
  FOR DELETE 
  TO anon, authenticated 
  USING (true);

-- 4-2. newsletter_subscribers 테이블 RLS 활성화
ALTER TABLE public.newsletter_subscribers ENABLE ROW LEVEL SECURITY;

-- 기존 정책 초기화
DROP POLICY IF EXISTS "Allow anon and auth full access to subscribers" ON public.newsletter_subscribers;
DROP POLICY IF EXISTS "Allow anon read subscribers" ON public.newsletter_subscribers;
DROP POLICY IF EXISTS "Allow anon insert subscribers" ON public.newsletter_subscribers;
DROP POLICY IF EXISTS "Allow anon update subscribers" ON public.newsletter_subscribers;
DROP POLICY IF EXISTS "Allow anon delete subscribers" ON public.newsletter_subscribers;

-- Anon 및 Authenticated 사용자에게 SELECT, INSERT, UPDATE, DELETE 완전 허용
CREATE POLICY "Allow anon read subscribers" 
  ON public.newsletter_subscribers 
  FOR SELECT 
  TO anon, authenticated 
  USING (true);

CREATE POLICY "Allow anon insert subscribers" 
  ON public.newsletter_subscribers 
  FOR INSERT 
  TO anon, authenticated 
  WITH CHECK (true);

CREATE POLICY "Allow anon update subscribers" 
  ON public.newsletter_subscribers 
  FOR UPDATE 
  TO anon, authenticated 
  USING (true) 
  WITH CHECK (true);

CREATE POLICY "Allow anon delete subscribers" 
  ON public.newsletter_subscribers 
  FOR DELETE 
  TO anon, authenticated 
  USING (true);

-- ============================================================
-- 5. 기본 시드(Seed) 데이터 주입 (최초 1회 실행용)
-- ============================================================

-- 기본 상품 3종 (전자책, VOD 강의, 무료배포) 시드 데이터
INSERT INTO public.products (category, title, price, description, image_url, detail_content)
VALUES 
(
  'ebook',
  '퇴근 후 하루 30분, 월 50만 원 달성 실전 부업 전자책 가이드북',
  29000,
  '직장인을 위한 무자본 지식 파이프라인 공식 & 복사해 쓰는 실무 템플릿 10종 풀패키지',
  'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="600" height="600" viewBox="0 0 600 600"><rect width="600" height="600" fill="%230f172a"/><circle cx="300" cy="300" r="180" fill="%2310b981" opacity="0.15"/><text x="300" y="270" font-family="sans-serif" font-weight="900" font-size="70" fill="%2310b981" text-anchor="middle">IT-MEMO</text><text x="300" y="340" font-family="sans-serif" font-weight="700" font-size="28" fill="%23f8fafc" text-anchor="middle">월 50만 원 실전 부업 전자책</text><text x="300" y="380" font-family="monospace" font-size="20" fill="%2394a3b8" text-anchor="middle">PDF 130P + 10종 템플릿</text></svg>',
  '<h2 style="font-size: 1.5rem; font-weight: 800; color: #0f172a; margin-bottom: 1rem;">퇴근 후 매달 50만 원이 통장에 들어오는 기적</h2><p style="line-height: 1.8; margin-bottom: 1.25rem;">월급날 스쳐 지나가는 통장 잔고를 보며 한숨 쉬던 시절이 있었습니다. <span class="highlight-yellow">"직장인에게 진짜 필요한 건 허황된 월 천만 원이 아니라, 매달 숨통을 틔워줄 확실한 50만 원이다."</span> 이 깨달음 하나로 1년간 직접 야근 후 30분씩 부딪히며 시스템을 완성했습니다.</p><h3 style="font-size: 1.25rem; font-weight: 700; color: #0f172a; margin-top: 1.5rem; margin-bottom: 0.75rem;">이 전자책이 다른 강의와 완전히 다른 3가지</h3><p style="line-height: 1.8; margin-bottom: 1rem;">첫째, <span class="highlight-green">초기 자본금이 단 1원도 들지 않습니다.</span><br>둘째, 퇴근길 지하철 15분, 귀가 후 15분으로 쪼개어 실천할 수 있습니다.<br>셋째, 오늘 밤 즉시 복사해서 쓰는 10종 실무 템플릿을 함께 드립니다.</p>'
),
(
  'vod',
  '직장인 무자본 지식 비즈니스 VOD 마스터 클래스',
  49000,
  '화면을 그대로 따라 하는 12단계 실습형 영상 강의 (평생 무제한 스트리밍)',
  'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="600" height="600" viewBox="0 0 600 600"><rect width="600" height="600" fill="%231e293b"/><polygon points="260,200 400,300 260,400" fill="%2310b981"/><text x="300" y="460" font-family="sans-serif" font-weight="800" font-size="30" fill="%23ffffff" text-anchor="middle">무자본 부업 VOD 풀코스</text><text x="300" y="500" font-family="monospace" font-size="20" fill="%23cbd5e1" text-anchor="middle">12강 스트리밍 실습</text></svg>',
  '<h2 style="font-size: 1.5rem; font-weight: 800; color: #0f172a; margin-bottom: 1rem;">복잡한 코딩 없이 클릭 몇 번으로 끝내는 판매 세팅</h2><p style="line-height: 1.8; margin-bottom: 1.25rem;">글로 읽는 것보다 화면을 보며 따라 하는 게 편한 직장인 수강생을 위해 준비했습니다. <span class="highlight-yellow">실제 마우스 클릭 하나하나를 화면 녹화로 보여드리며</span> 첫날 상품 등록부터 결제 연동까지 원스톱으로 끝냅니다.</p>'
),
(
  'free',
  '무자본 직장인 부업 스타터 3가지 치트키 PDF',
  0,
  '의심되신다면 먼저 읽어보세요! 출퇴근길 10분 만에 읽는 실전 가이드 요약본',
  'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="600" height="600" viewBox="0 0 600 600"><rect width="600" height="600" fill="%23064e3b"/><circle cx="300" cy="300" r="140" fill="%2334d399" opacity="0.2"/><text x="300" y="280" font-family="sans-serif" font-weight="900" font-size="60" fill="%2334d399" text-anchor="middle">FREE KIT</text><text x="300" y="340" font-family="sans-serif" font-weight="700" font-size="28" fill="%23ffffff" text-anchor="middle">부업 스타터 3가지 치트키</text><text x="300" y="380" font-family="monospace" font-size="20" fill="%23a7f3d0" text-anchor="middle">100% 무료 배포 PDF</text></svg>',
  '<h2 style="font-size: 1.5rem; font-weight: 800; color: #0f172a; margin-bottom: 1rem;">부업을 시작하기 전 반드시 피해야 할 3가지 함정</h2><p style="line-height: 1.8; margin-bottom: 1.25rem;">사기성 광고에 속아 시간을 낭비하지 않도록, <span class="highlight-green">100% 무료로 배포하는 스타터 치트키 요약본</span>입니다.</p>'
);

-- 뉴스레터 구독자 시드 데이터
INSERT INTO public.newsletter_subscribers (name, phone, email)
VALUES 
  ('이민호', '010-3841-2941', 'minho.lee@company.com'),
  ('정다은', '010-8291-0391', 'daeun.jung@naver.com'),
  ('박준혁', '010-5512-9902', 'junhyeok@kakao.com');
