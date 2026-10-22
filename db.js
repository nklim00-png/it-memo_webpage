/**
 * IT-MEMO Local Database & Authentication Engine
 * 브라우저 LocalStorage 기반의 실시간 DB & 인증 시스템
 */

const DB_KEYS = {
  USERS: 'itmemo_users',
  PRODUCT: 'itmemo_product',
  ORDERS: 'itmemo_orders',
  LEADS: 'itmemo_leads',
  CURRENT_USER: 'itmemo_current_user'
};

// 초기 시드 데이터 설정
function initDatabase() {
  // 1. 사용자 시드 데이터 (관리자 & 일반 회원)
  if (!localStorage.getItem(DB_KEYS.USERS)) {
    const defaultUsers = [
      {
        id: 'usr_admin',
        email: 'admin@it-memo.kr',
        password: 'admin1234',
        name: '최고관리자',
        role: 'admin',
        createdAt: '2026-10-01'
      },
      {
        id: 'usr_001',
        email: 'user@company.com',
        password: 'user1234',
        name: '김대리',
        role: 'user',
        createdAt: '2026-10-22'
      }
    ];
    localStorage.setItem(DB_KEYS.USERS, JSON.stringify(defaultUsers));
  }

  // 2. 전자책 상품 시드 데이터
  if (!localStorage.getItem(DB_KEYS.PRODUCT)) {
    const defaultProduct = {
      id: 'prod_ebook_01',
      slug: 'itmemo-ebook-50',
      title: '퇴근 후 하루 30분, 월 50만 원 달성 실전 부업 전자책 가이드북',
      originalPrice: 50000,
      salePrice: 29000,
      discountRate: 42,
      pageCount: 130,
      templateCount: 10,
      isActive: true,
      updatedAt: '2026-10-22'
    };
    localStorage.setItem(DB_KEYS.PRODUCT, JSON.stringify(defaultProduct));
  }

  // 3. 주문 내역 시드 데이터
  if (!localStorage.getItem(DB_KEYS.ORDERS)) {
    const defaultOrders = [
      {
        id: 'ITMEMO-20261022-9842',
        userEmail: 'user@company.com',
        userName: '김대리',
        productName: 'IT-MEMO 실전 전자책 풀패키지',
        amount: 29000,
        paymentMethod: '토스 간편결제',
        status: 'PAID',
        paidAt: '2026-10-22 19:42:10'
      },
      {
        id: 'ITMEMO-20261022-8711',
        userEmail: 'park.sy@kakao.com',
        userName: '박수영',
        productName: 'IT-MEMO 실전 전자책 풀패키지',
        amount: 29000,
        paymentMethod: '신용카드',
        status: 'PAID',
        paidAt: '2026-10-22 17:15:22'
      },
      {
        id: 'ITMEMO-20261021-4102',
        userEmail: 'lee.jh@naver.com',
        userName: '이정호',
        productName: 'IT-MEMO 실전 전자책 풀패키지',
        amount: 29000,
        paymentMethod: '카카오페이',
        status: 'PAID',
        paidAt: '2026-10-21 21:03:45'
      },
      {
        id: 'ITMEMO-20261020-1983',
        userEmail: 'choi.mk@gmail.com',
        userName: '최민경',
        productName: 'IT-MEMO 실전 전자책 풀패키지',
        amount: 29000,
        paymentMethod: '네이버페이',
        status: 'PAID',
        paidAt: '2026-10-20 22:30:11'
      }
    ];
    localStorage.setItem(DB_KEYS.ORDERS, JSON.stringify(defaultOrders));
  }

  // 4. 무료 리드 신청자 시드 데이터
  if (!localStorage.getItem(DB_KEYS.LEADS)) {
    const defaultLeads = [
      { id: 'lead_1', email: 'worker30@company.com', createdAt: '2026-10-22 20:10:00' },
      { id: 'lead_2', email: 'sidebiz@naver.com', createdAt: '2026-10-22 18:45:12' },
      { id: 'lead_3', email: 'developer.kim@gmail.com', createdAt: '2026-10-22 14:20:30' },
      { id: 'lead_4', email: 'growth.marketer@daum.net', createdAt: '2026-10-21 23:12:00' }
    ];
    localStorage.setItem(DB_KEYS.LEADS, JSON.stringify(defaultLeads));
  }
}

// 초기화 실행
initDatabase();

// DB 제어 객체
window.itmemoDB = {
  // 인증 관련
  login(email, password) {
    const users = JSON.parse(localStorage.getItem(DB_KEYS.USERS) || '[]');
    const user = users.find(u => u.email === email && u.password === password);
    if (user) {
      localStorage.setItem(DB_KEYS.CURRENT_USER, JSON.stringify(user));
      return { success: true, user };
    }
    return { success: false, message: '이메일 또는 비밀번호가 올바르지 않습니다.' };
  },

  register(email, password, name) {
    const users = JSON.parse(localStorage.getItem(DB_KEYS.USERS) || '[]');
    if (users.some(u => u.email === email)) {
      return { success: false, message: '이미 등록된 이메일 주소입니다.' };
    }
    const newUser = {
      id: 'usr_' + Date.now(),
      email,
      password,
      name: name || '수강생',
      role: 'user',
      createdAt: new Date().toISOString().split('T')[0]
    };
    users.push(newUser);
    localStorage.setItem(DB_KEYS.USERS, JSON.stringify(users));
    localStorage.setItem(DB_KEYS.CURRENT_USER, JSON.stringify(newUser));
    return { success: true, user: newUser };
  },

  logout() {
    localStorage.removeItem(DB_KEYS.CURRENT_USER);
  },

  getCurrentUser() {
    const data = localStorage.getItem(DB_KEYS.CURRENT_USER);
    return data ? JSON.parse(data) : null;
  },

  requireAuth(requiredRole = null) {
    const user = this.getCurrentUser();
    if (!user) {
      window.location.href = 'login.html?redirect=' + encodeURIComponent(window.location.pathname);
      return null;
    }
    if (requiredRole && user.role !== requiredRole) {
      alert('접근 권한이 없습니다. (관리자 전용)');
      window.location.href = 'index.html';
      return null;
    }
    return user;
  },

  // 상품 관련
  getProduct() {
    return JSON.parse(localStorage.getItem(DB_KEYS.PRODUCT) || '{}');
  },

  updateProduct(updates) {
    const current = this.getProduct();
    const updated = { ...current, ...updates, updatedAt: new Date().toISOString().split('T')[0] };
    localStorage.setItem(DB_KEYS.PRODUCT, JSON.stringify(updated));
    return updated;
  },

  // 주문 관련
  getOrders() {
    return JSON.parse(localStorage.getItem(DB_KEYS.ORDERS) || '[]');
  },

  addOrder(orderData) {
    const orders = this.getOrders();
    const newOrder = {
      id: 'ITMEMO-' + Date.now().toString().slice(-8),
      userEmail: orderData.email || 'guest@company.com',
      userName: orderData.name || '직장인',
      productName: 'IT-MEMO 실전 전자책 풀패키지',
      amount: orderData.amount || 29000,
      paymentMethod: orderData.method || '토스 간편결제',
      status: 'PAID',
      paidAt: new Date().toLocaleString('ko-KR')
    };
    orders.unshift(newOrder);
    localStorage.setItem(DB_KEYS.ORDERS, JSON.stringify(orders));
    return newOrder;
  },

  // 리드 관련
  getLeads() {
    return JSON.parse(localStorage.getItem(DB_KEYS.LEADS) || '[]');
  },

  addLead(email) {
    const leads = this.getLeads();
    const newLead = {
      id: 'lead_' + Date.now(),
      email,
      createdAt: new Date().toLocaleString('ko-KR')
    };
    leads.unshift(newLead);
    localStorage.setItem(DB_KEYS.LEADS, JSON.stringify(leads));
    return newLead;
  }
};
