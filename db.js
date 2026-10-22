/**
 * IT-MEMO Database & Remote Cloud Transaction Engine
 * - Supabase Cloud PostgreSQL DB 마이그레이션 연동
 * - URL: https://gkjpufztigyufkfdlzov.supabase.co
 * - Key: sb_publishable_W1CUAPR6rGcUSeQWV_SFMg_lDyuNONa
 * - HTML5 Canvas 초경량 이미지 압축 (600px, 70% 품질)
 * - 네트워크 예외 방어형 LocalStorage 캐시/Fallback 하이브리드 지원
 */

// 1. Supabase 접속 인증 환경 구성
const SUPABASE_CONFIG = {
  URL: 'https://gkjpufztigyufkfdlzov.supabase.co',
  ANON_KEY: 'sb_publishable_W1CUAPR6rGcUSeQWV_SFMg_lDyuNONa'
};

const DB_KEYS = {
  PRODUCTS: 'itmemo_products',
  SUBSCRIBERS: 'itmemo_subscribers',
  ORDERS: 'itmemo_orders',
  CURRENT_USER: 'itmemo_current_user',
  ADMIN_MODE: 'itmemo_admin_mode_active'
};

// Supabase 클라이언트 인스턴스 초기화
let supabaseClient = null;

function getSupabase() {
  if (!supabaseClient && window.supabase && typeof window.supabase.createClient === 'function') {
    supabaseClient = window.supabase.createClient(SUPABASE_CONFIG.URL, SUPABASE_CONFIG.ANON_KEY);
  }
  return supabaseClient;
}

// 기본 샘플 이미지 (정사각 SVG Base64)
const DEFAULT_COVERS = {
  ebook: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="600" height="600" viewBox="0 0 600 600"><rect width="600" height="600" fill="%230f172a"/><circle cx="300" cy="300" r="180" fill="%2310b981" opacity="0.15"/><text x="300" y="270" font-family="sans-serif" font-weight="900" font-size="70" fill="%2310b981" text-anchor="middle">IT-MEMO</text><text x="300" y="340" font-family="sans-serif" font-weight="700" font-size="28" fill="%23f8fafc" text-anchor="middle">월 50만 원 실전 부업 전자책</text><text x="300" y="380" font-family="monospace" font-size="20" fill="%2394a3b8" text-anchor="middle">PDF 130P + 10종 템플릿</text></svg>',
  vod: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="600" height="600" viewBox="0 0 600 600"><rect width="600" height="600" fill="%231e293b"/><polygon points="260,200 400,300 260,400" fill="%2310b981"/><text x="300" y="460" font-family="sans-serif" font-weight="800" font-size="30" fill="%23ffffff" text-anchor="middle">무자본 부업 VOD 풀코스</text><text x="300" y="500" font-family="monospace" font-size="20" fill="%23cbd5e1" text-anchor="middle">12강 스트리밍 실습</text></svg>',
  free: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="600" height="600" viewBox="0 0 600 600"><rect width="600" height="600" fill="%23064e3b"/><circle cx="300" cy="300" r="140" fill="%2334d399" opacity="0.2"/><text x="300" y="280" font-family="sans-serif" font-weight="900" font-size="60" fill="%2334d399" text-anchor="middle">FREE KIT</text><text x="300" y="340" font-family="sans-serif" font-weight="700" font-size="28" fill="%23ffffff" text-anchor="middle">부업 스타터 3가지 치트키</text><text x="300" y="380" font-family="monospace" font-size="20" fill="%23a7f3d0" text-anchor="middle">100% 무료 배포 PDF</text></svg>'
};

/**
 * Supabase DB row 객체 ➔ 프론트엔드 모델 변환 헬퍼
 */
function mapProductFromDB(row) {
  if (!row) return null;
  const catNames = {
    ebook: '전자책',
    vod: 'VOD 강의',
    free: '무료배포'
  };

  return {
    id: String(row.id),
    category: row.category || 'ebook',
    categoryName: catNames[row.category] || '디지털 콘텐츠',
    title: row.title || '무제 상품',
    originalPrice: Number(row.price) > 0 ? Math.round(Number(row.price) * 1.7) : 0, // 정가 비율 가이드
    salePrice: Number(row.price) || 0,
    summary: row.description || '',
    imageUrl: row.image_url || DEFAULT_COVERS[row.category || 'ebook'],
    detailContent: row.detail_content || '',
    createdAt: row.created_at ? new Date(row.created_at).toISOString().split('T')[0] : '2026-10-22'
  };
}

/**
 * HTML5 Canvas 기반 초경량 이미지 압축 엔진 (600px 다운스케일, JPEG 70%)
 */
async function compressImageToDataUrl(file, maxDimension = 600, quality = 0.7) {
  return new Promise((resolve, reject) => {
    if (!file || !file.type.startsWith('image/')) {
      reject(new Error('유효한 이미지 파일이 아닙니다.'));
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxDimension) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          }
        } else {
          if (height > maxDimension) {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, width, height);

        const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
        resolve(compressedDataUrl);
      };
      img.onerror = () => reject(new Error('이미지 로드에 실패했습니다.'));
      img.src = e.target.result;
    };
    reader.onerror = () => reject(new Error('파일 읽기 오류가 발생했습니다.'));
    reader.readAsDataURL(file);
  });
}

/**
 * 로컬 캐시 초기화 (네트워크 단절 대비)
 */
function initLocalFallback() {
  if (!localStorage.getItem(DB_KEYS.PRODUCTS)) {
    const seedProducts = [
      {
        id: 'prod_ebook_01',
        category: 'ebook',
        categoryName: '전자책',
        title: '퇴근 후 하루 30분, 월 50만 원 달성 실전 부업 전자책 가이드북',
        originalPrice: 50000,
        salePrice: 29000,
        summary: '직장인을 위한 무자본 지식 파이프라인 공식 & 복사해 쓰는 실무 템플릿 10종 풀패키지',
        imageUrl: DEFAULT_COVERS.ebook,
        detailContent: '<h2 style="font-size: 1.5rem; font-weight: 800; color: #0f172a; margin-bottom: 1rem;">퇴근 후 매달 50만 원이 통장에 들어오는 기적</h2><p style="line-height: 1.8; margin-bottom: 1.25rem;">월급날 스쳐 지나가는 통장 잔고를 보며 한숨 쉬던 시절이 있었습니다. <span class="highlight-yellow">"직장인에게 진짜 필요한 건 허황된 월 천만 원이 아니라, 매달 숨통을 틔워줄 확실한 50만 원이다."</span> 이 깨달음 하나로 1년간 직접 야근 후 30분씩 부딪히며 시스템을 완성했습니다.</p>',
        createdAt: '2026-10-22'
      },
      {
        id: 'prod_vod_01',
        category: 'vod',
        categoryName: 'VOD 강의',
        title: '직장인 무자본 지식 비즈니스 VOD 마스터 클래스',
        originalPrice: 89000,
        salePrice: 49000,
        summary: '화면을 그대로 따라 하는 12단계 실습형 영상 강의 (평생 무제한 스트리밍)',
        imageUrl: DEFAULT_COVERS.vod,
        detailContent: '<h2 style="font-size: 1.5rem; font-weight: 800; color: #0f172a; margin-bottom: 1rem;">복잡한 코딩 없이 클릭 몇 번으로 끝내는 판매 세팅</h2>',
        createdAt: '2026-10-22'
      },
      {
        id: 'prod_free_01',
        category: 'free',
        categoryName: '무료배포',
        title: '무자본 직장인 부업 스타터 3가지 치트키 PDF',
        originalPrice: 0,
        salePrice: 0,
        summary: '의심되신다면 먼저 읽어보세요! 출퇴근길 10분 만에 읽는 실전 가이드 요약본',
        imageUrl: DEFAULT_COVERS.free,
        detailContent: '<h2 style="font-size: 1.5rem; font-weight: 800; color: #0f172a; margin-bottom: 1rem;">부업을 시작하기 전 반드시 피해야 할 3가지 함정</h2>',
        createdAt: '2026-10-22'
      }
    ];
    localStorage.setItem(DB_KEYS.PRODUCTS, JSON.stringify(seedProducts));
  }
}
initLocalFallback();

/**
 * window.itmemoDB: Supabase 비동기 원격 DB 트랜잭션 API
 */
window.itmemoDB = {
  // ==========================================
  // 1. 상품 관리 (Remote Supabase 'products')
  // ==========================================
  async getProducts() {
    const sb = getSupabase();
    if (sb) {
      try {
        const { data, error } = await sb
          .from('products')
          .select('*')
          .order('created_at', { ascending: false });

        if (!error && data && data.length > 0) {
          const mapped = data.map(mapProductFromDB);
          // 로컬 캐시 동기화
          localStorage.setItem(DB_KEYS.PRODUCTS, JSON.stringify(mapped));
          return mapped;
        } else if (error) {
          console.warn('[Supabase] products 조회 오류, 로컬 캐시를 사용합니다:', error.message);
        }
      } catch (err) {
        console.warn('[Supabase] 네트워크 통신 예외, 로컬 캐시를 사용합니다:', err);
      }
    }
    // Fallback: 로컬 스토리지 데이터 반환
    return JSON.parse(localStorage.getItem(DB_KEYS.PRODUCTS) || '[]');
  },

  async getProductById(id) {
    if (!id) return null;
    const sb = getSupabase();
    if (sb) {
      try {
        const { data, error } = await sb
          .from('products')
          .select('*')
          .eq('id', id)
          .maybeSingle();

        if (!error && data) {
          return mapProductFromDB(data);
        }
      } catch (err) {
        console.warn('[Supabase] getProductById 예외:', err);
      }
    }
    // Fallback
    const cached = JSON.parse(localStorage.getItem(DB_KEYS.PRODUCTS) || '[]');
    return cached.find(p => p.id === String(id)) || null;
  },

  async addProduct(productData) {
    const sb = getSupabase();
    const payload = {
      category: productData.category || 'ebook',
      title: productData.title,
      price: Number(productData.salePrice) || 0,
      description: productData.summary || '',
      image_url: productData.imageUrl || DEFAULT_COVERS[productData.category || 'ebook'],
      detail_content: productData.detailContent || ''
    };

    if (sb) {
      try {
        const { data, error } = await sb
          .from('products')
          .insert([payload])
          .select()
          .single();

        if (!error && data) {
          const newProduct = mapProductFromDB(data);
          // 로컬 캐시 업데이트
          const cached = JSON.parse(localStorage.getItem(DB_KEYS.PRODUCTS) || '[]');
          cached.unshift(newProduct);
          localStorage.setItem(DB_KEYS.PRODUCTS, JSON.stringify(cached));
          return newProduct;
        } else if (error) {
          console.error('[Supabase] 상품 등록 실패:', error.message);
        }
      } catch (err) {
        console.error('[Supabase] 상품 등록 통신 오류:', err);
      }
    }

    // Fallback 로컬 등록
    const fallbackProduct = {
      id: 'prod_' + Date.now(),
      category: payload.category,
      categoryName: payload.category === 'vod' ? 'VOD 강의' : (payload.category === 'free' ? '무료배포' : '전자책'),
      title: payload.title,
      originalPrice: Number(productData.originalPrice) || payload.price,
      salePrice: payload.price,
      summary: payload.description,
      imageUrl: payload.image_url,
      detailContent: payload.detail_content,
      createdAt: new Date().toISOString().split('T')[0]
    };
    const cached = JSON.parse(localStorage.getItem(DB_KEYS.PRODUCTS) || '[]');
    cached.unshift(fallbackProduct);
    localStorage.setItem(DB_KEYS.PRODUCTS, JSON.stringify(cached));
    return fallbackProduct;
  },

  async updateProduct(id, updates) {
    const sb = getSupabase();
    const payload = {};
    if (updates.category) payload.category = updates.category;
    if (updates.title) payload.title = updates.title;
    if (updates.salePrice !== undefined) payload.price = Number(updates.salePrice);
    if (updates.summary !== undefined) payload.description = updates.summary;
    if (updates.imageUrl) payload.image_url = updates.imageUrl;
    if (updates.detailContent !== undefined) payload.detail_content = updates.detailContent;

    if (sb) {
      try {
        const { data, error } = await sb
          .from('products')
          .update(payload)
          .eq('id', id)
          .select()
          .maybeSingle();

        if (!error && data) {
          const updated = mapProductFromDB(data);
          const cached = JSON.parse(localStorage.getItem(DB_KEYS.PRODUCTS) || '[]');
          const idx = cached.findIndex(p => p.id === String(id));
          if (idx !== -1) {
            cached[idx] = updated;
            localStorage.setItem(DB_KEYS.PRODUCTS, JSON.stringify(cached));
          }
          return updated;
        }
      } catch (err) {
        console.error('[Supabase] 상품 수정 오류:', err);
      }
    }

    // Fallback
    const cached = JSON.parse(localStorage.getItem(DB_KEYS.PRODUCTS) || '[]');
    const idx = cached.findIndex(p => p.id === String(id));
    if (idx !== -1) {
      cached[idx] = { ...cached[idx], ...updates, updatedAt: new Date().toISOString().split('T')[0] };
      localStorage.setItem(DB_KEYS.PRODUCTS, JSON.stringify(cached));
      return cached[idx];
    }
    return null;
  },

  async deleteProduct(id) {
    const sb = getSupabase();
    if (sb) {
      try {
        const { error } = await sb
          .from('products')
          .delete()
          .eq('id', id);

        if (error) {
          console.error('[Supabase] 상품 삭제 오류:', error.message);
        }
      } catch (err) {
        console.error('[Supabase] 상품 삭제 통신 예외:', err);
      }
    }

    // 로컬 캐시 삭제
    let cached = JSON.parse(localStorage.getItem(DB_KEYS.PRODUCTS) || '[]');
    cached = cached.filter(p => p.id !== String(id));
    localStorage.setItem(DB_KEYS.PRODUCTS, JSON.stringify(cached));
    return true;
  },

  // ==========================================
  // 2. 뉴스레터 구독자 관리 (Remote 'newsletter_subscribers')
  // ==========================================
  async getSubscribers() {
    const sb = getSupabase();
    if (sb) {
      try {
        const { data, error } = await sb
          .from('newsletter_subscribers')
          .select('*')
          .order('created_at', { ascending: false });

        if (!error && data) {
          const mapped = data.map(s => ({
            id: String(s.id),
            name: s.name,
            phone: s.phone || '',
            email: s.email,
            createdAt: s.created_at ? new Date(s.created_at).toLocaleString('ko-KR') : '2026-10-22'
          }));
          localStorage.setItem(DB_KEYS.SUBSCRIBERS, JSON.stringify(mapped));
          return mapped;
        }
      } catch (err) {
        console.warn('[Supabase] 구독자 목록 조회 예외:', err);
      }
    }
    return JSON.parse(localStorage.getItem(DB_KEYS.SUBSCRIBERS) || '[]');
  },

  async addSubscriber({ name, phone, email }) {
    const sb = getSupabase();
    const payload = {
      name: name.trim(),
      phone: phone ? phone.trim() : '',
      email: email.trim()
    };

    if (sb) {
      try {
        const { data, error } = await sb
          .from('newsletter_subscribers')
          .insert([payload])
          .select()
          .single();

        if (!error && data) {
          const newSub = {
            id: String(data.id),
            name: data.name,
            phone: data.phone,
            email: data.email,
            createdAt: new Date(data.created_at).toLocaleString('ko-KR')
          };
          const cached = JSON.parse(localStorage.getItem(DB_KEYS.SUBSCRIBERS) || '[]');
          cached.unshift(newSub);
          localStorage.setItem(DB_KEYS.SUBSCRIBERS, JSON.stringify(cached));
          return newSub;
        }
      } catch (err) {
        console.error('[Supabase] 구독자 추가 오류:', err);
      }
    }

    // Fallback
    const newSub = {
      id: 'sub_' + Date.now(),
      name: payload.name,
      phone: payload.phone,
      email: payload.email,
      createdAt: new Date().toLocaleString('ko-KR')
    };
    const cached = JSON.parse(localStorage.getItem(DB_KEYS.SUBSCRIBERS) || '[]');
    cached.unshift(newSub);
    localStorage.setItem(DB_KEYS.SUBSCRIBERS, JSON.stringify(cached));
    return newSub;
  },

  async deleteSubscriber(id) {
    const sb = getSupabase();
    if (sb) {
      try {
        const { error } = await sb
          .from('newsletter_subscribers')
          .delete()
          .eq('id', id);

        if (error) console.error('[Supabase] 구독자 삭제 오류:', error.message);
      } catch (err) {
        console.error('[Supabase] 구독자 삭제 예외:', err);
      }
    }

    let cached = JSON.parse(localStorage.getItem(DB_KEYS.SUBSCRIBERS) || '[]');
    cached = cached.filter(s => s.id !== String(id));
    localStorage.setItem(DB_KEYS.SUBSCRIBERS, JSON.stringify(cached));
    return true;
  },

  // ==========================================
  // 3. 주문 및 결제 관리
  // ==========================================
  getOrders() {
    return JSON.parse(localStorage.getItem(DB_KEYS.ORDERS) || '[]');
  },

  addOrder({ orderId, productId, productTitle, amount, customerName, customerEmail, customerPhone, paymentMethod }) {
    const orders = this.getOrders();
    const newOrder = {
      id: orderId || 'ORD-' + Date.now(),
      productId: String(productId || 'prod_ebook_01'),
      productTitle: productTitle || 'IT-MEMO 실전 전자책',
      amount: Number(amount) || 0,
      customerName: customerName ? customerName.trim() : '직장인 수강생',
      customerEmail: customerEmail ? customerEmail.trim() : 'buyer@company.com',
      customerPhone: customerPhone ? customerPhone.trim() : '010-0000-0000',
      paymentMethod: paymentMethod || '토스페이먼츠 간편결제',
      status: 'DONE',
      paidAt: new Date().toLocaleString('ko-KR')
    };
    orders.unshift(newOrder);
    localStorage.setItem(DB_KEYS.ORDERS, JSON.stringify(orders));
    return newOrder;
  },

  // ==========================================
  // 4. 관리자 상태 & 이미지 압축 유틸리티
  // ==========================================
  isAdminMode() {
    return localStorage.getItem(DB_KEYS.ADMIN_MODE) === 'true';
  },

  setAdminMode(isActive) {
    localStorage.setItem(DB_KEYS.ADMIN_MODE, isActive ? 'true' : 'false');
  },

  compressImage: compressImageToDataUrl
};
