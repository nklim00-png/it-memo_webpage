/**
 * IT-MEMO Local Database, Storage & Image Compression Engine
 * 브라우저 LocalStorage 기반의 실시간 DB & 초경량 Canvas 압축 엔진
 */

const DB_KEYS = {
  PRODUCTS: 'itmemo_products',
  SUBSCRIBERS: 'itmemo_subscribers',
  ORDERS: 'itmemo_orders',
  CURRENT_USER: 'itmemo_current_user',
  ADMIN_MODE: 'itmemo_admin_mode_active'
};

// 기본 샘플 이미지 (정사각 SVG Base64)
const DEFAULT_COVERS = {
  ebook: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="600" height="600" viewBox="0 0 600 600"><rect width="600" height="600" fill="%230f172a"/><circle cx="300" cy="300" r="180" fill="%2310b981" opacity="0.15"/><text x="300" y="270" font-family="sans-serif" font-weight="900" font-size="70" fill="%2310b981" text-anchor="middle">IT-MEMO</text><text x="300" y="340" font-family="sans-serif" font-weight="700" font-size="28" fill="%23f8fafc" text-anchor="middle">월 50만 원 실전 부업 전자책</text><text x="300" y="380" font-family="monospace" font-size="20" fill="%2394a3b8" text-anchor="middle">PDF 130P + 10종 템플릿</text></svg>',
  vod: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="600" height="600" viewBox="0 0 600 600"><rect width="600" height="600" fill="%231e293b"/><polygon points="260,200 400,300 260,400" fill="%2310b981"/><text x="300" y="460" font-family="sans-serif" font-weight="800" font-size="30" fill="%23ffffff" text-anchor="middle">무자본 부업 VOD 풀코스</text><text x="300" y="500" font-family="monospace" font-size="20" fill="%23cbd5e1" text-anchor="middle">12강 스트리밍 실습</text></svg>',
  free: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="600" height="600" viewBox="0 0 600 600"><rect width="600" height="600" fill="%23064e3b"/><circle cx="300" cy="300" r="140" fill="%2334d399" opacity="0.2"/><text x="300" y="280" font-family="sans-serif" font-weight="900" font-size="60" fill="%2334d399" text-anchor="middle">FREE KIT</text><text x="300" y="340" font-family="sans-serif" font-weight="700" font-size="28" fill="%23ffffff" text-anchor="middle">부업 스타터 3가지 치트키</text><text x="300" y="380" font-family="monospace" font-size="20" fill="%23a7f3d0" text-anchor="middle">100% 무료 배포 PDF</text></svg>'
};

/**
 * HTML5 Canvas 기반 초경량 이미지 압축 엔진
 * 가로/세로 최대 600px 리사이즈, JPEG 70% 압축 (30KB~50KB 내외 경량화)
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

        // 종횡비 유지하며 최대 600px 크기로 다운스케일
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
        // 부드러운 이미지 리샘플링
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, width, height);

        // JPEG 70% 압축 (용량 최적화)
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

// 데이터베이스 초기화 및 시딩
function initDatabase() {
  // 1. 상품 목록 시드 (3대 카테고리: 전자책, VOD, 무료배포)
  if (!localStorage.getItem(DB_KEYS.PRODUCTS)) {
    const seedProducts = [
      {
        id: 'prod_ebook_01',
        category: 'ebook', // ebook, vod, free
        categoryName: '전자책',
        title: '퇴근 후 하루 30분, 월 50만 원 달성 실전 부업 전자책 가이드북',
        originalPrice: 50000,
        salePrice: 29000,
        summary: '직장인을 위한 무자본 지식 파이프라인 공식 & 복사해 쓰는 실무 템플릿 10종 풀패키지',
        imageUrl: DEFAULT_COVERS.ebook,
        detailContent: `
          <h2 style="font-size: 1.5rem; font-weight: 800; color: #0f172a; margin-bottom: 1rem;">퇴근 후 매달 50만 원이 통장에 들어오는 기적</h2>
          <p style="line-height: 1.8; margin-bottom: 1.25rem;">
            월급날 스쳐 지나가는 통장 잔고를 보며 한숨 쉬던 시절이 있었습니다. <span class="highlight-yellow">"직장인에게 진짜 필요한 건 허황된 월 천만 원이 아니라, 매달 숨통을 틔워줄 확실한 50만 원이다."</span> 이 깨달음 하나로 1년간 직접 야근 후 30분씩 부딪히며 시스템을 완성했습니다.
          </p>
          <h3 style="font-size: 1.25rem; font-weight: 700; color: #0f172a; margin-top: 1.5rem; margin-bottom: 0.75rem;">이 전자책이 다른 강의와 완전히 다른 3가지</h3>
          <p style="line-height: 1.8; margin-bottom: 1rem;">
            첫째, <span class="highlight-green">초기 자본금이 단 1원도 들지 않습니다.</span><br>
            둘째, 퇴근길 지하철 15분, 귀가 후 15분으로 쪼개어 실천할 수 있습니다.<br>
            셋째, 오늘 밤 즉시 복사해서 쓰는 10종 실무 템플릿을 함께 드립니다.
          </p>
        `,
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
        detailContent: `
          <h2 style="font-size: 1.5rem; font-weight: 800; color: #0f172a; margin-bottom: 1rem;">복잡한 코딩 없이 클릭 몇 번으로 끝내는 판매 세팅</h2>
          <p style="line-height: 1.8; margin-bottom: 1.25rem;">
            글로 읽는 것보다 화면을 보며 따라 하는 게 편한 직장인 수강생을 위해 준비했습니다. <span class="highlight-yellow">실제 마우스 클릭 하나하나를 화면 녹화로 보여드리며</span> 첫날 상품 등록부터 결제 연동까지 원스톱으로 끝냅니다.
          </p>
        `,
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
        detailContent: `
          <h2 style="font-size: 1.5rem; font-weight: 800; color: #0f172a; margin-bottom: 1rem;">부업을 시작하기 전 반드시 피해야 할 3가지 함정</h2>
          <p style="line-height: 1.8; margin-bottom: 1.25rem;">
            사기성 광고에 속아 시간을 낭비하지 않도록, <span class="highlight-green">100% 무료로 배포하는 스타터 치트키 요약본</span>입니다.
          </p>
        `,
        createdAt: '2026-10-22'
      }
    ];
    localStorage.setItem(DB_KEYS.PRODUCTS, JSON.stringify(seedProducts));
  }

  // 2. 뉴스레터 구독자 시드 데이터
  if (!localStorage.getItem(DB_KEYS.SUBSCRIBERS)) {
    const seedSubscribers = [
      { id: 'sub_1', name: '이민호', phone: '010-3841-2941', email: 'minho.lee@company.com', createdAt: '2026-10-22 20:30' },
      { id: 'sub_2', name: '정다은', phone: '010-8291-0391', email: 'daeun.jung@naver.com', createdAt: '2026-10-22 19:15' },
      { id: 'sub_3', name: '박준혁', phone: '010-5512-9902', email: 'junhyeok@kakao.com', createdAt: '2026-10-21 22:40' }
    ];
    localStorage.setItem(DB_KEYS.SUBSCRIBERS, JSON.stringify(seedSubscribers));
  }
}

initDatabase();

// DB 제어 및 스토리지 API
window.itmemoDB = {
  // 1. 상품 관리 (CRUD)
  getProducts() {
    return JSON.parse(localStorage.getItem(DB_KEYS.PRODUCTS) || '[]');
  },

  getProductById(id) {
    const products = this.getProducts();
    return products.find(p => p.id === id) || null;
  },

  addProduct(productData) {
    const products = this.getProducts();
    const newProduct = {
      id: 'prod_' + Date.now(),
      category: productData.category || 'ebook',
      categoryName: productData.category === 'vod' ? 'VOD 강의' : (productData.category === 'free' ? '무료배포' : '전자책'),
      title: productData.title,
      originalPrice: Number(productData.originalPrice) || 0,
      salePrice: Number(productData.salePrice) || 0,
      summary: productData.summary || '',
      imageUrl: productData.imageUrl || DEFAULT_COVERS[productData.category || 'ebook'],
      detailContent: productData.detailContent || '',
      createdAt: new Date().toISOString().split('T')[0]
    };
    products.unshift(newProduct);
    localStorage.setItem(DB_KEYS.PRODUCTS, JSON.stringify(products));
    return newProduct;
  },

  updateProduct(id, updates) {
    const products = this.getProducts();
    const index = products.findIndex(p => p.id === id);
    if (index !== -1) {
      if (updates.category) {
        updates.categoryName = updates.category === 'vod' ? 'VOD 강의' : (updates.category === 'free' ? '무료배포' : '전자책');
      }
      products[index] = { ...products[index], ...updates, updatedAt: new Date().toISOString().split('T')[0] };
      localStorage.setItem(DB_KEYS.PRODUCTS, JSON.stringify(products));
      return products[index];
    }
    return null;
  },

  deleteProduct(id) {
    let products = this.getProducts();
    products = products.filter(p => p.id !== id);
    localStorage.setItem(DB_KEYS.PRODUCTS, JSON.stringify(products));
    return true;
  },

  // 2. 뉴스레터 구독자 관리
  getSubscribers() {
    return JSON.parse(localStorage.getItem(DB_KEYS.SUBSCRIBERS) || '[]');
  },

  addSubscriber({ name, phone, email }) {
    const subscribers = this.getSubscribers();
    const newSub = {
      id: 'sub_' + Date.now(),
      name: name.trim(),
      phone: phone.trim(),
      email: email.trim(),
      createdAt: new Date().toLocaleString('ko-KR')
    };
    subscribers.unshift(newSub);
    localStorage.setItem(DB_KEYS.SUBSCRIBERS, JSON.stringify(subscribers));
    return newSub;
  },

  deleteSubscriber(id) {
    let subscribers = this.getSubscribers();
    subscribers = subscribers.filter(s => s.id !== id);
    localStorage.setItem(DB_KEYS.SUBSCRIBERS, JSON.stringify(subscribers));
    return true;
  },

  // 3. 관리자 모드 토글 상태
  isAdminMode() {
    return localStorage.getItem(DB_KEYS.ADMIN_MODE) === 'true';
  },

  setAdminMode(isActive) {
    localStorage.setItem(DB_KEYS.ADMIN_MODE, isActive ? 'true' : 'false');
  },

  // 4. 주문 및 결제 내역 관리 (Orders)
  getOrders() {
    return JSON.parse(localStorage.getItem(DB_KEYS.ORDERS) || '[]');
  },

  addOrder({ orderId, productId, productTitle, amount, customerName, customerEmail, customerPhone, paymentMethod }) {
    const orders = this.getOrders();
    const newOrder = {
      id: orderId || 'ORD-' + Date.now(),
      productId: productId || 'prod_ebook_01',
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

  // 5. 이미지 압축 헬퍼 노출
  compressImage: compressImageToDataUrl
};
