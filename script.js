/**
 * IT-MEMO Interaction & Parallax Script
 */

document.addEventListener('DOMContentLoaded', () => {
  // 1. Lucide 아이콘 렌더링
  if (window.lucide) {
    lucide.createIcons();
  }

  // 2. 스크롤 진입 인터랙션 (Intersection Observer)
  initScrollReveal();

  // 3. 마우스 패럴랙스 캔버스 & 오브젝트 애니메이션
  initHeroParallax();

  // 4. ESC 키 모달 닫기
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeModal('paymentModal');
      closeModal('loginModal');
    }
  });
});

/**
 * 스크롤 시 요소 페이드인 효과
 */
function initScrollReveal() {
  const reveals = document.querySelectorAll('.reveal');
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('active');
      }
    });
  }, {
    threshold: 0.12,
    rootMargin: '0px 0px -40px 0px'
  });

  reveals.forEach(el => observer.observe(el));
}

/**
 * 히어로 마우스 패럴랙스 (Canvas + Floating Layers)
 */
function initHeroParallax() {
  const hero = document.getElementById('hero');
  const canvas = document.getElementById('parallaxCanvas');
  const float1 = document.getElementById('parallaxFloating1');
  const float2 = document.getElementById('parallaxFloating2');

  if (!canvas || !hero) return;
  const ctx = canvas.getContext('2d');

  let width, height;
  let mouseX = 0, mouseY = 0;
  let targetX = 0, targetY = 0;

  // 캔버스 크기 리사이징
  function resize() {
    width = canvas.width = hero.offsetWidth;
    height = canvas.height = hero.offsetHeight;
  }
  window.addEventListener('resize', resize);
  resize();

  // 마우스 좌표 추적
  window.addEventListener('mousemove', (e) => {
    const rect = hero.getBoundingClientRect();
    if (e.clientY >= rect.top && e.clientY <= rect.bottom) {
      mouseX = (e.clientX - rect.left) / width - 0.5;
      mouseY = (e.clientY - rect.top) / height - 0.5;
    }
  });

  // 기하학적 파티클 생성
  const particles = [];
  const particleCount = 28;

  for (let i = 0; i < particleCount; i++) {
    particles.push({
      x: Math.random() * width,
      y: Math.random() * height,
      size: Math.random() * 2.5 + 1,
      speedFactor: Math.random() * 35 + 10,
      color: Math.random() > 0.5 ? 'rgba(16, 185, 129, 0.45)' : 'rgba(100, 116, 139, 0.25)'
    });
  }

  // 캔버스 렌더 루프
  function animate() {
    // 부드러운 가감속 (Lerp)
    targetX += (mouseX - targetX) * 0.05;
    targetY += (mouseY - targetY) * 0.05;

    ctx.clearRect(0, 0, width, height);

    // 은은한 그리드 라인 그리기
    const gridSize = 48;
    ctx.strokeStyle = 'rgba(241, 245, 249, 0.7)';
    ctx.lineWidth = 1;

    const offsetX = targetX * 15;
    const offsetY = targetY * 15;

    for (let x = (offsetX % gridSize); x < width; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    for (let y = (offsetY % gridSize); y < height; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    // 파티클 시차 이동
    particles.forEach(p => {
      const px = p.x + targetX * p.speedFactor;
      const py = p.y + targetY * p.speedFactor;

      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(px, py, p.size, 0, Math.PI * 2);
      ctx.fill();
    });

    // 배경 블러 오브젝트 패럴랙스 변위
    if (float1) {
      float1.style.transform = `translate(${targetX * -40}px, ${targetY * -40}px)`;
    }
    if (float2) {
      float2.style.transform = `translate(${targetX * 50}px, ${targetY * 50}px)`;
    }

    requestAnimationFrame(animate);
  }
  animate();
}

/**
 * 아코디언 토글 (목차 & FAQ)
 */
function toggleAccordion(id) {
  const content = document.getElementById(`content-${id}`);
  const icon = document.getElementById(`icon-${id}`);

  if (!content) return;

  const isHidden = content.classList.contains('hidden');

  if (isHidden) {
    content.classList.remove('hidden');
    if (icon) icon.style.transform = 'rotate(180deg)';
  } else {
    content.classList.add('hidden');
    if (icon) icon.style.transform = 'rotate(0deg)';
  }
}

/**
 * 모달 열기 / 닫기
 */
function openModal(id) {
  const modal = document.getElementById(id);
  if (modal) {
    modal.classList.remove('hidden');
    modal.classList.add('flex');
    document.body.style.overflow = 'hidden';
  }
}

function closeModal(id) {
  const modal = document.getElementById(id);
  if (modal) {
    modal.classList.add('hidden');
    modal.classList.remove('flex');
    document.body.style.overflow = 'auto';
  }
}

function openPaymentModal() {
  openModal('paymentModal');
}

/**
 * 무료 리드 마그넷 이메일 폼 처리
 */
function handleFreeLead(event) {
  event.preventDefault();
  const emailInput = document.getElementById('leadEmail');
  const submitBtn = document.getElementById('leadSubmitBtn');
  const email = emailInput.value.trim();

  if (!email) return;

  // 로딩 상태 피드백
  submitBtn.disabled = true;
  submitBtn.innerHTML = `
    <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
    <span>치트키 PDF 발송 중...</span>
  `;

  setTimeout(() => {
    // Local DB에 실제 리드 저장
    if (window.itmemoDB) {
      itmemoDB.addLead(email);
    }

    // 가상의 다운로드 트리거
    triggerDummyDownload('IT-MEMO_무료_부업_스타터_치트키.pdf');
    showToast(`'${email}'으로 무료 치트키 PDF가 발송되었으며 DB에 저장되었습니다!`);
    
    // 폼 초기화
    emailInput.value = '';
    submitBtn.disabled = false;
    submitBtn.innerHTML = `
      <i data-lucide="check" class="w-4 h-4"></i>
      <span>발송 완료! (다시 신청하기)</span>
    `;
    if (window.lucide) lucide.createIcons();
  }, 1000);
}

/**
 * 로그인 폼 처리 시뮬레이션
 */
function handleLogin(event) {
  event.preventDefault();
  closeModal('loginModal');
  if (window.itmemoDB) {
    itmemoDB.login('user@company.com', 'user1234');
  }
  showToast('로그인되었습니다. 마이페이지로 이동합니다.');
  setTimeout(() => {
    window.location.href = 'mypage.html';
  }, 800);
}

/**
 * 테스트 결제 승인 시뮬레이션 (주문 DB 생성 & 성공 페이지 이동)
 */
function simulatePaymentSuccess() {
  closeModal('paymentModal');
  if (window.itmemoDB) {
    itmemoDB.addOrder({
      email: 'user@company.com',
      name: '직장인 수강생',
      amount: 29000,
      method: '토스 간편결제'
    });
  }
  showToast('토스 결제 승인 완료! 결제 성공 페이지로 이동합니다.');
  setTimeout(() => {
    window.location.href = 'payment-success.html';
  }, 800);
}

/**
 * 가상 파일 다운로드 트리거
 */
function triggerDummyDownload(filename) {
  const dummyContent = `IT-MEMO 전자책 가이드북\n본 파일은 IT-MEMO의 정규 전자책 가이드북 시뮬레이션 파일입니다.\n구매해 주셔서 감사합니다.`;
  const blob = new Blob([dummyContent], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * 토스트 메시지 띄우기
 */
function showToast(message) {
  const toast = document.getElementById('toastMessage');
  const text = document.getElementById('toastText');
  if (!toast || !text) return;

  text.textContent = message;
  toast.classList.remove('translate-y-20', 'opacity-0');
  toast.classList.add('translate-y-0', 'opacity-100');

  setTimeout(() => {
    toast.classList.remove('translate-y-0', 'opacity-100');
    toast.classList.add('translate-y-20', 'opacity-0');
  }, 3500);
}
