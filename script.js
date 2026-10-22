/**
 * IT-MEMO Comprehensive Script
 * - 마우스 패럴랙스 & 스크롤 리빌
 * - 상단 관리자 모드 실시간 토글 (홈 뷰 ↔ 대시보드 뷰)
 * - 초경량 Canvas 이미지 압축 & 드롭존 듀얼 탭
 * - 네이버 블로그 스타일 상단 툴바 에디터 (Tt, 정렬, 2색 형광펜, 본문 이미지 삽입)
 * - 팝업형 뉴스레터 구독 모달 & 대시보드 구독자 관리 테이블
 * - 1:1 정사각 (aspect-square) 상품 진열 & 풀스크린 수정 모달
 */

// 전역 상태
let activeProductCategory = 'all';
let registerCoverDataUrl = '';
let editCoverDataUrl = '';
let currentEditingProductId = null;

document.addEventListener('DOMContentLoaded', () => {
  // 1. Lucide 아이콘 초기화
  if (window.lucide) {
    lucide.createIcons();
  }

  // 2. 스크롤 진입 인터랙션
  initScrollReveal();

  // 3. 히어로 마우스 패럴랙스
  initHeroParallax();

  // 4. 관리자 모드 토글 및 뷰 동기화
  initAdminMode();

  // 5. 상품 렌더링 (홈 화면 1:1 정사각 & 대시보드 관리 테이블)
  renderClientProducts('all');
  renderAdminProducts();
  renderAdminSubscribers();

  // 6. 드롭존 및 블로그 툴바 에디터 초기화
  setupProductFormDropzone();
  setupEditFormDropzone();
  setupBlogToolbar('regToolbar', 'regEditor', 'regEditorImgInput');
  setupBlogToolbar('editToolbar', 'editEditor', 'editEditorImgInput');

  // 7. ESC 키 모달 닫기
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeModal('paymentModal');
      closeModal('loginModal');
      closeModal('newsletterModal');
      closeModal('editProductModal');
    }
  });

  // 8. URL 파라미터 확인 (?mode=admin)
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.get('mode') === 'admin') {
    switchView(true);
  }
});

/* ============================================================
   1. 관리자 모드 토글 (홈 ↔ 대시보드)
   ============================================================ */
function initAdminMode() {
  const isAdmin = window.itmemoDB ? itmemoDB.isAdminMode() : false;
  switchView(isAdmin);
}

function toggleAdminMode() {
  if (!window.itmemoDB) return;
  const current = itmemoDB.isAdminMode();
  const next = !current;
  itmemoDB.setAdminMode(next);
  switchView(next);
  
  if (next) {
    showToast('🛠️ 관리자 대시보드 모드로 전환되었습니다.');
  } else {
    showToast('🏠 일반 고객 메인 홈 화면으로 전환되었습니다.');
  }
}

function switchView(isAdmin) {
  const homeView = document.getElementById('clientHomeView');
  const dashView = document.getElementById('adminDashboardView');
  const toggleBtn = document.getElementById('adminToggleBtn');
  const toggleText = document.getElementById('adminToggleText');
  const toggleIcon = document.getElementById('adminToggleIcon');

  if (!homeView || !dashView) return;

  if (isAdmin) {
    homeView.classList.add('hidden');
    dashView.classList.remove('hidden');
    window.scrollTo({ top: 0, behavior: 'smooth' });

    if (toggleBtn) {
      toggleBtn.classList.remove('bg-slate-900', 'hover:bg-slate-800');
      toggleBtn.classList.add('bg-emerald-600', 'hover:bg-emerald-700', 'ring-2', 'ring-emerald-400/50');
      toggleText.textContent = '🏠 메인 홈 화면';
      toggleIcon.textContent = '👀';
    }
    renderAdminProducts();
    renderAdminSubscribers();
  } else {
    dashView.classList.add('hidden');
    homeView.classList.remove('hidden');
    window.scrollTo({ top: 0, behavior: 'smooth' });

    if (toggleBtn) {
      toggleBtn.classList.add('bg-slate-900', 'hover:bg-slate-800');
      toggleBtn.classList.remove('bg-emerald-600', 'hover:bg-emerald-700', 'ring-2', 'ring-emerald-400/50');
      toggleText.textContent = '관리자 모드';
      toggleIcon.textContent = '🛠️';
    }
    renderClientProducts(activeProductCategory);
  }

  if (window.lucide) lucide.createIcons();
}

/* ============================================================
   2. 고객용 상품 진열 (1:1 aspect-square 실시간 연동)
   ============================================================ */
function filterClientProducts(category) {
  activeProductCategory = category;
  
  // 탭 스타일 활성화
  const tabs = ['all', 'ebook', 'vod', 'free'];
  tabs.forEach(t => {
    const tabEl = document.getElementById(`tab-cat-${t}`);
    if (tabEl) {
      if (t === category) {
        tabEl.className = 'px-4 py-2 rounded-xl text-xs sm:text-sm font-bold bg-itmemoPrimary text-white shadow-sm transition-all';
      } else {
        tabEl.className = 'px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-white text-slate-600 hover:bg-slate-100 border border-slate-200 transition-all';
      }
    }
  });

  renderClientProducts(category);
}

function renderClientProducts(category = 'all') {
  const grid = document.getElementById('clientProductGrid');
  if (!grid || !window.itmemoDB) return;

  const products = itmemoDB.getProducts();
  const filtered = category === 'all' 
    ? products 
    : products.filter(p => p.category === category);

  if (filtered.length === 0) {
    grid.innerHTML = `
      <div class="col-span-full py-16 text-center text-slate-400 bg-white rounded-2xl border border-dashed border-slate-200">
        <i data-lucide="package-open" class="w-12 h-12 mx-auto text-slate-300 mb-3"></i>
        <p class="text-sm font-medium">등록된 상품이 없습니다.</p>
        <p class="text-xs text-slate-400 mt-1">상단 [🛠️ 관리자 모드]에서 새로운 콘텐츠를 등록해 보세요.</p>
      </div>
    `;
    if (window.lucide) lucide.createIcons();
    return;
  }

  grid.innerHTML = filtered.map(p => {
    // 뱃지 색상
    let badgeClass = 'bg-slate-900 text-white';
    if (p.category === 'vod') badgeClass = 'bg-blue-600 text-white';
    if (p.category === 'free') badgeClass = 'bg-emerald-600 text-white';

    // 가격 표시
    const isFree = p.salePrice === 0;
    const priceHtml = isFree 
      ? `<span class="text-xl font-extrabold text-emerald-600 font-mono">무료 배포</span>`
      : `
        <div class="flex items-baseline gap-1.5">
          <span class="text-xl font-extrabold text-itmemoTextMain font-mono">${p.salePrice.toLocaleString()}원</span>
          ${p.originalPrice > p.salePrice ? `<span class="text-xs text-slate-400 line-through font-mono">${p.originalPrice.toLocaleString()}원</span>` : ''}
        </div>
      `;

    return `
      <div class="card-lift bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-sm flex flex-col justify-between group">
        <div>
          <!-- 1:1 완벽 정사각 썸네일 (aspect-square object-cover) -->
          <div class="relative w-full aspect-square bg-slate-100 overflow-hidden border-b border-slate-100">
            <img src="${p.imageUrl}" alt="${escapeHtml(p.title)}" class="w-full h-full aspect-square object-cover group-hover:scale-105 transition-transform duration-300">
            <span class="absolute top-3 left-3 text-[11px] font-mono font-bold px-2.5 py-0.5 rounded-full shadow-sm ${badgeClass}">
              ${p.categoryName || '콘텐츠'}
            </span>
          </div>

          <div class="p-5">
            <div class="text-[11px] font-mono text-slate-400 mb-1">등록일: ${p.createdAt || '2026-10-22'}</div>
            <h3 class="text-base font-bold text-itmemoTextMain line-clamp-2 leading-snug group-hover:text-itmemoPrimary transition-colors mb-2">
              ${escapeHtml(p.title)}
            </h3>
            <p class="text-xs text-itmemoTextSub line-clamp-2 leading-relaxed mb-4">
              ${escapeHtml(p.summary || '')}
            </p>
          </div>
        </div>

        <div class="p-5 pt-0 border-t border-slate-50 mt-auto">
          <div class="flex items-center justify-between mb-4 pt-3">
            <span class="text-xs font-mono text-slate-400">판매가</span>
            ${priceHtml}
          </div>
          <div class="grid grid-cols-2 gap-2">
            <a href="product-detail.html?id=${p.id}" class="btn-lift py-2.5 rounded-xl border border-slate-200 hover:border-slate-300 bg-slate-50 hover:bg-slate-100 text-xs font-bold text-slate-700 flex items-center justify-center gap-1 transition-all">
              <span>자세히 보기</span>
              <i data-lucide="arrow-right" class="w-3.5 h-3.5"></i>
            </a>
            <button onclick="handleQuickBuy('${p.id}')" class="btn-lift py-2.5 rounded-xl bg-itmemoPrimary hover:bg-itmemoPrimaryHover text-xs font-bold text-white shadow-sm flex items-center justify-center gap-1 transition-all">
              <i data-lucide="${isFree ? 'download' : 'zap'}" class="w-3.5 h-3.5"></i>
              <span>${isFree ? '무료 받기' : '소장하기'}</span>
            </button>
          </div>
        </div>
      </div>
    `;
  }).join('');

  if (window.lucide) lucide.createIcons();
}

function handleQuickBuy(id) {
  const p = itmemoDB.getProductById(id);
  if (!p) return;
  if (p.salePrice === 0) {
    showToast(`'${p.title}' 무료 다운로드가 완료되었습니다.`);
    triggerDummyDownload(`${p.title}.pdf`);
  } else {
    window.location.href = `product-detail.html?id=${id}`;
  }
}

/* ============================================================
   3. 고품격 이미지 업로드(드롭존) & 초경량 Canvas 압축
   ============================================================ */
function switchCoverTab(type, mode = 'reg') {
  const isReg = mode === 'reg';
  const fileTab = document.getElementById(isReg ? 'regTabFile' : 'editTabFile');
  const linkTab = document.getElementById(isReg ? 'regTabLink' : 'editTabLink');
  const fileArea = document.getElementById(isReg ? 'regFileArea' : 'editFileArea');
  const linkArea = document.getElementById(isReg ? 'regLinkArea' : 'editLinkArea');

  if (type === 'file') {
    fileTab.className = 'flex-1 py-2 text-xs font-bold rounded-lg bg-white shadow-sm text-itmemoTextMain transition-all';
    linkTab.className = 'flex-1 py-2 text-xs font-semibold rounded-lg text-slate-500 hover:text-slate-800 transition-all';
    fileArea.classList.remove('hidden');
    linkArea.classList.add('hidden');
  } else {
    linkTab.className = 'flex-1 py-2 text-xs font-bold rounded-lg bg-white shadow-sm text-itmemoTextMain transition-all';
    fileTab.className = 'flex-1 py-2 text-xs font-semibold rounded-lg text-slate-500 hover:text-slate-800 transition-all';
    linkArea.classList.remove('hidden');
    fileArea.classList.add('hidden');
  }
}

function setupProductFormDropzone() {
  const dropzone = document.getElementById('regDropzone');
  const fileInput = document.getElementById('regFileInput');
  const previewBox = document.getElementById('regPreviewBox');
  const previewImg = document.getElementById('regPreviewImg');
  const sizeInfo = document.getElementById('regSizeInfo');
  const removeBtn = document.getElementById('regRemoveImgBtn');

  if (!dropzone || !fileInput) return;

  dropzone.addEventListener('click', () => fileInput.click());

  dropzone.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropzone.classList.add('dragover');
  });

  dropzone.addEventListener('dragleave', () => {
    dropzone.classList.remove('dragover');
  });

  dropzone.addEventListener('drop', async (e) => {
    e.preventDefault();
    dropzone.classList.remove('dragover');
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      await processCoverFile(e.dataTransfer.files[0], 'reg');
    }
  });

  fileInput.addEventListener('change', async (e) => {
    if (e.target.files && e.target.files[0]) {
      await processCoverFile(e.target.files[0], 'reg');
    }
  });

  if (removeBtn) {
    removeBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      registerCoverDataUrl = '';
      fileInput.value = '';
      previewBox.classList.add('hidden');
      dropzone.classList.remove('hidden');
    });
  }
}

function setupEditFormDropzone() {
  const dropzone = document.getElementById('editDropzone');
  const fileInput = document.getElementById('editFileInput');
  const previewBox = document.getElementById('editPreviewBox');
  const removeBtn = document.getElementById('editRemoveImgBtn');

  if (!dropzone || !fileInput) return;

  dropzone.addEventListener('click', () => fileInput.click());

  dropzone.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropzone.classList.add('dragover');
  });
  dropzone.addEventListener('dragleave', () => {
    dropzone.classList.remove('dragover');
  });
  dropzone.addEventListener('drop', async (e) => {
    e.preventDefault();
    dropzone.classList.remove('dragover');
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      await processCoverFile(e.dataTransfer.files[0], 'edit');
    }
  });
  fileInput.addEventListener('change', async (e) => {
    if (e.target.files && e.target.files[0]) {
      await processCoverFile(e.target.files[0], 'edit');
    }
  });

  if (removeBtn) {
    removeBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      editCoverDataUrl = '';
      fileInput.value = '';
      previewBox.classList.add('hidden');
      dropzone.classList.remove('hidden');
    });
  }
}

async function processCoverFile(file, mode = 'reg') {
  if (!file.type.startsWith('image/')) {
    alert('이미지 파일(JPG, PNG, WebP)만 업로드할 수 있습니다.');
    return;
  }

  showToast('이미지 자동 리사이징 & 70% 초경량 압축 중...');

  try {
    // 600px 리사이즈, JPEG 70% 압축
    const compressed = await itmemoDB.compressImage(file, 600, 0.7);
    const sizeKb = Math.round((compressed.length * 3 / 4) / 1024);

    if (mode === 'reg') {
      registerCoverDataUrl = compressed;
      const dropzone = document.getElementById('regDropzone');
      const previewBox = document.getElementById('regPreviewBox');
      const previewImg = document.getElementById('regPreviewImg');
      const sizeInfo = document.getElementById('regSizeInfo');

      previewImg.src = compressed;
      sizeInfo.textContent = `${sizeKb} KB (Canvas 초경량 압축 완료)`;
      dropzone.classList.add('hidden');
      previewBox.classList.remove('hidden');
    } else {
      editCoverDataUrl = compressed;
      const dropzone = document.getElementById('editDropzone');
      const previewBox = document.getElementById('editPreviewBox');
      const previewImg = document.getElementById('editPreviewImg');
      const sizeInfo = document.getElementById('editSizeInfo');

      previewImg.src = compressed;
      sizeInfo.textContent = `${sizeKb} KB (Canvas 초경량 압축 완료)`;
      dropzone.classList.add('hidden');
      previewBox.classList.remove('hidden');
    }

    showToast(`압축 성공! 가볍게 변환되었습니다 (${sizeKb} KB)`);
  } catch (err) {
    console.error(err);
    alert('이미지 압축 처리 중 오류가 발생했습니다.');
  }
}

/* ============================================================
   4. 네이버 블로그 스타일 상단 툴바 에디터
   ============================================================ */
function setupBlogToolbar(toolbarId, editorId, imgInputId) {
  const toolbar = document.getElementById(toolbarId);
  const editor = document.getElementById(editorId);
  const imgInput = document.getElementById(imgInputId);

  if (!toolbar || !editor) return;

  // 1) 글자 크기 (제목1 / 제목2 / 본문)
  const formatSelect = toolbar.querySelector('.toolbar-format');
  if (formatSelect) {
    formatSelect.addEventListener('change', (e) => {
      const tag = e.target.value;
      editor.focus();
      if (tag === 'p') {
        document.execCommand('formatBlock', false, '<p>');
      } else if (tag === 'h2') {
        document.execCommand('formatBlock', false, '<h2>');
      } else if (tag === 'h3') {
        document.execCommand('formatBlock', false, '<h3>');
      }
    });
  }

  // 2) 정렬 버튼 (좌측 / 중앙 / 우측)
  const alignBtns = toolbar.querySelectorAll('[data-align]');
  alignBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const align = btn.getAttribute('data-align');
      editor.focus();
      if (align === 'left') document.execCommand('justifyLeft', false, null);
      if (align === 'center') document.execCommand('justifyCenter', false, null);
      if (align === 'right') document.execCommand('justifyRight', false, null);
    });
  });

  // 3) 형광펜 강조 (파스텔 옐로우 #fef08a, 파스텔 그린 #bbf7d0)
  const highlightBtns = toolbar.querySelectorAll('[data-highlight]');
  highlightBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const color = btn.getAttribute('data-highlight');
      applyHighlight(editor, color);
    });
  });

  // 4) 📷 본문 이미지 업로드 (드래그앤드롭 및 파일 탐색)
  const imgBtn = toolbar.querySelector('.toolbar-img-btn');
  if (imgBtn && imgInput) {
    imgBtn.addEventListener('click', () => imgInput.click());

    imgInput.addEventListener('change', async (e) => {
      if (e.target.files && e.target.files[0]) {
        await insertImageIntoEditor(editor, e.target.files[0]);
        imgInput.value = '';
      }
    });
  }

  // 본문 에디터 자체에도 이미지 드래그앤드롭 지원
  editor.addEventListener('dragover', (e) => e.preventDefault());
  editor.addEventListener('drop', async (e) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.type.startsWith('image/')) {
        await insertImageIntoEditor(editor, file);
      }
    }
  });
}

/**
 * 형광펜 효과 적용
 */
function applyHighlight(editor, colorClass) {
  editor.focus();
  const selection = window.getSelection();
  if (!selection.rangeCount) return;

  const range = selection.getRangeAt(0);
  if (range.collapsed) {
    showToast('형광펜을 칠할 텍스트를 마우스로 드래그 선택해 주세요.');
    return;
  }

  const selectedText = range.extractContents();
  const span = document.createElement('span');
  span.className = colorClass === 'yellow' ? 'highlight-yellow' : 'highlight-green';
  span.appendChild(selectedText);
  range.insertNode(span);

  // 커서를 형광펜 뒤로 이동
  range.setStartAfter(span);
  range.collapse(true);
  selection.removeAllRanges();
  selection.addRange(range);
}

/**
 * 에디터 본문 내에 압축 이미지 삽입
 */
async function insertImageIntoEditor(editor, file) {
  showToast('본문 이미지 초경량 압축 중...');
  try {
    const compressed = await itmemoDB.compressImage(file, 600, 0.7);
    editor.focus();

    const img = document.createElement('img');
    img.src = compressed;
    img.alt = '본문 삽입 이미지';
    img.className = 'rounded-xl my-4 max-w-full shadow-md';

    const selection = window.getSelection();
    if (selection.rangeCount) {
      const range = selection.getRangeAt(0);
      range.collapse(false);
      range.insertNode(img);
      const br = document.createElement('p');
      br.innerHTML = '<br>';
      img.after(br);
      range.setStartAfter(br);
      range.collapse(true);
      selection.removeAllRanges();
      selection.addRange(range);
    } else {
      editor.appendChild(img);
    }

    showToast('📷 본문에 이미지가 깔끔하게 삽입되었습니다.');
  } catch (err) {
    console.error(err);
    alert('본문 이미지 삽입에 실패했습니다.');
  }
}

/* ============================================================
   5. 상품 등록 폼 제출 & 관리자 상품 테이블
   ============================================================ */
function handleCreateProduct(event) {
  event.preventDefault();

  const title = document.getElementById('regTitle').value.trim();
  const category = document.getElementById('regCategory').value;
  const originalPrice = document.getElementById('regOriginalPrice').value;
  const salePrice = document.getElementById('regSalePrice').value;
  const summary = document.getElementById('regSummary').value.trim();
  const linkUrl = document.getElementById('regLinkInput').value.trim();
  const editor = document.getElementById('regEditor');
  const detailContent = editor.innerHTML;

  if (!title) {
    alert('상품명을 입력해 주세요.');
    return;
  }

  // 대표 이미지 결정: 파일 업로드 DataUrl > 웹 링크 URL > 기본 카테고리 SVG
  let finalImageUrl = registerCoverDataUrl || linkUrl;

  const newProd = itmemoDB.addProduct({
    title,
    category,
    originalPrice,
    salePrice,
    summary,
    imageUrl: finalImageUrl,
    detailContent
  });

  showToast(`🎉 '${newProd.title}' 상품이 성공적으로 등록되었습니다!`);

  // 폼 리셋
  document.getElementById('productCreateForm').reset();
  editor.innerHTML = '';
  registerCoverDataUrl = '';
  document.getElementById('regPreviewBox').classList.add('hidden');
  document.getElementById('regDropzone').classList.remove('hidden');

  // 리렌더링
  renderAdminProducts();
  renderClientProducts(activeProductCategory);
}

function renderAdminProducts() {
  const tableBody = document.getElementById('adminProductTableBody');
  if (!tableBody || !window.itmemoDB) return;

  const products = itmemoDB.getProducts();

  if (products.length === 0) {
    tableBody.innerHTML = `
      <tr>
        <td colspan="6" class="py-12 text-center text-xs text-slate-400">
          등록된 상품이 없습니다. 위 등록 폼에서 첫 상품을 올려보세요.
        </td>
      </tr>
    `;
    return;
  }

  tableBody.innerHTML = products.map((p, idx) => {
    let catBadge = 'bg-slate-900 text-white';
    if (p.category === 'vod') catBadge = 'bg-blue-600 text-white';
    if (p.category === 'free') catBadge = 'bg-emerald-600 text-white';

    const priceText = p.salePrice === 0 
      ? '<span class="text-emerald-600 font-bold">무료배포</span>' 
      : `${p.salePrice.toLocaleString()}원`;

    return `
      <tr class="border-b border-slate-100 hover:bg-slate-50/80 transition-colors">
        <td class="py-3.5 px-4 text-xs font-mono text-slate-400">${idx + 1}</td>
        <td class="py-3.5 px-4">
          <!-- 1:1 정사각 썸네일 -->
          <div class="w-12 h-12 rounded-lg bg-slate-100 aspect-square overflow-hidden border border-slate-200 flex-shrink-0">
            <img src="${p.imageUrl}" alt="${escapeHtml(p.title)}" class="w-full h-full aspect-square object-cover">
          </div>
        </td>
        <td class="py-3.5 px-4">
          <span class="inline-block text-[10px] font-mono font-bold px-2 py-0.5 rounded-full mb-1 ${catBadge}">
            ${p.categoryName || '콘텐츠'}
          </span>
          <div class="font-bold text-xs sm:text-sm text-itmemoTextMain line-clamp-1 max-w-md">
            ${escapeHtml(p.title)}
          </div>
        </td>
        <td class="py-3.5 px-4 font-mono text-xs font-bold text-slate-800">
          ${priceText}
        </td>
        <td class="py-3.5 px-4 font-mono text-xs text-slate-400">
          ${p.createdAt || '2026-10-22'}
        </td>
        <td class="py-3.5 px-4 text-right space-x-1">
          <button onclick="openEditModal('${p.id}')" class="p-1.5 rounded-lg text-slate-500 hover:text-itmemoPrimary hover:bg-emerald-50 transition-colors" title="수정">
            <i data-lucide="edit-3" class="w-4 h-4"></i>
          </button>
          <button onclick="deleteProductAction('${p.id}')" class="p-1.5 rounded-lg text-slate-500 hover:text-rose-500 hover:bg-rose-50 transition-colors" title="삭제">
            <i data-lucide="trash-2" class="w-4 h-4"></i>
          </button>
        </td>
      </tr>
    `;
  }).join('');

  if (window.lucide) lucide.createIcons();
}

function deleteProductAction(id) {
  const p = itmemoDB.getProductById(id);
  if (!p) return;
  if (!confirm(`'${p.title}' 상품을 정말 삭제하시겠습니까?`)) return;

  itmemoDB.deleteProduct(id);
  showToast(`'${p.title}' 상품이 삭제되었습니다.`);
  renderAdminProducts();
  renderClientProducts(activeProductCategory);
}

/* ============================================================
   6. 상품 수정 풀스크린 모달
   ============================================================ */
function openEditModal(id) {
  const product = itmemoDB.getProductById(id);
  if (!product) return;

  currentEditingProductId = id;
  editCoverDataUrl = product.imageUrl || '';

  document.getElementById('editTitle').value = product.title;
  document.getElementById('editCategory').value = product.category;
  document.getElementById('editOriginalPrice').value = product.originalPrice;
  document.getElementById('editSalePrice').value = product.salePrice;
  document.getElementById('editSummary').value = product.summary || '';
  document.getElementById('editLinkInput').value = product.imageUrl.startsWith('http') ? product.imageUrl : '';

  const editor = document.getElementById('editEditor');
  editor.innerHTML = product.detailContent || '';

  // 썸네일 미리보기 채우기
  const previewBox = document.getElementById('editPreviewBox');
  const previewImg = document.getElementById('editPreviewImg');
  const dropzone = document.getElementById('editDropzone');
  const sizeInfo = document.getElementById('editSizeInfo');

  if (editCoverDataUrl) {
    previewImg.src = editCoverDataUrl;
    sizeInfo.textContent = '현재 등록된 이미지';
    previewBox.classList.remove('hidden');
    dropzone.classList.add('hidden');
  } else {
    previewBox.classList.add('hidden');
    dropzone.classList.remove('hidden');
  }

  openModal('editProductModal');
}

function handleUpdateProduct(event) {
  event.preventDefault();
  if (!currentEditingProductId) return;

  const title = document.getElementById('editTitle').value.trim();
  const category = document.getElementById('editCategory').value;
  const originalPrice = document.getElementById('editOriginalPrice').value;
  const salePrice = document.getElementById('editSalePrice').value;
  const summary = document.getElementById('editSummary').value.trim();
  const linkUrl = document.getElementById('editLinkInput').value.trim();
  const detailContent = document.getElementById('editEditor').innerHTML;

  let finalImageUrl = editCoverDataUrl || linkUrl;

  itmemoDB.updateProduct(currentEditingProductId, {
    title,
    category,
    originalPrice,
    salePrice,
    summary,
    imageUrl: finalImageUrl,
    detailContent
  });

  closeModal('editProductModal');
  showToast('✏️ 상품 정보가 성공적으로 수정되었습니다.');
  renderAdminProducts();
  renderClientProducts(activeProductCategory);
}

/* ============================================================
   7. 팝업형 뉴스레터 구독 기능 & 대시보드 구독자 관리 테이블
   ============================================================ */
function openNewsletterModal() {
  openModal('newsletterModal');
}

function closeNewsletterModal() {
  closeModal('newsletterModal');
}

function handleNewsletterSubmit(event) {
  event.preventDefault();

  const nameInput = document.getElementById('newsName');
  const phoneInput = document.getElementById('newsPhone');
  const emailInput = document.getElementById('newsEmail');

  const name = nameInput.value.trim();
  const phone = phoneInput.value.trim();
  const email = emailInput.value.trim();

  if (!name || !phone || !email) {
    alert('모든 항목을 입력해 주세요.');
    return;
  }

  itmemoDB.addSubscriber({ name, phone, email });

  closeNewsletterModal();

  // 안내 모달 또는 알림창 띄우기
  alert(`구독이 완료되었습니다!\n\n[구독 신청 정보]\n성함: ${name}\n전화번호: ${phone}\n이메일: ${email}\n\n신청하신 이메일로 IT-MEMO 실전 부업 인사이트가 주기적으로 발송됩니다.`);
  showToast(`'${name}'님, 뉴스레터 구독이 성공적으로 완료되었습니다!`);

  // 입력창 초기화
  nameInput.value = '';
  phoneInput.value = '';
  emailInput.value = '';

  // 관리자 대시보드 테이블 실시간 갱신
  renderAdminSubscribers();
}

function renderAdminSubscribers() {
  const tableBody = document.getElementById('adminSubscribersTableBody');
  const countBadge = document.getElementById('adminSubCountBadge');
  if (!tableBody || !window.itmemoDB) return;

  const subscribers = itmemoDB.getSubscribers();

  if (countBadge) {
    countBadge.textContent = `${subscribers.length}명`;
  }

  if (subscribers.length === 0) {
    tableBody.innerHTML = `
      <tr>
        <td colspan="6" class="py-12 text-center text-xs text-slate-400">
          신청된 뉴스레터 구독자가 없습니다. 메인 홈에서 첫 구독을 신청해 보세요.
        </td>
      </tr>
    `;
    return;
  }

  tableBody.innerHTML = subscribers.map((sub, idx) => `
    <tr class="border-b border-slate-100 hover:bg-slate-50/80 transition-colors">
      <td class="py-3.5 px-4 text-xs font-mono text-slate-400">${idx + 1}</td>
      <td class="py-3.5 px-4 font-bold text-xs sm:text-sm text-itmemoTextMain">
        ${escapeHtml(sub.name)}
      </td>
      <td class="py-3.5 px-4 font-mono text-xs text-slate-700">
        ${escapeHtml(sub.phone)}
      </td>
      <td class="py-3.5 px-4 font-mono text-xs text-slate-600">
        ${escapeHtml(sub.email)}
      </td>
      <td class="py-3.5 px-4 font-mono text-xs text-slate-400">
        ${sub.createdAt || '2026-10-22'}
      </td>
      <td class="py-3.5 px-4 text-right">
        <button onclick="deleteSubscriberAction('${sub.id}')" class="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 transition-colors" title="삭제">
          <i data-lucide="trash-2" class="w-4 h-4"></i>
        </button>
      </td>
    </tr>
  `).join('');

  if (window.lucide) lucide.createIcons();
}

function deleteSubscriberAction(id) {
  if (!confirm('해당 구독자를 목록에서 삭제하시겠습니까?')) return;
  itmemoDB.deleteSubscriber(id);
  showToast('구독자가 목록에서 삭제되었습니다.');
  renderAdminSubscribers();
}

/* ============================================================
   8. 유틸리티 & 기존 애니메이션 함수 보존
   ============================================================ */
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

  function resize() {
    width = canvas.width = hero.offsetWidth;
    height = canvas.height = hero.offsetHeight;
  }
  window.addEventListener('resize', resize);
  resize();

  window.addEventListener('mousemove', (e) => {
    const rect = hero.getBoundingClientRect();
    if (e.clientY >= rect.top && e.clientY <= rect.bottom) {
      mouseX = (e.clientX - rect.left) / width - 0.5;
      mouseY = (e.clientY - rect.top) / height - 0.5;
    }
  });

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

  function animate() {
    targetX += (mouseX - targetX) * 0.05;
    targetY += (mouseY - targetY) * 0.05;

    ctx.clearRect(0, 0, width, height);

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

    particles.forEach(p => {
      const px = p.x + targetX * p.speedFactor;
      const py = p.y + targetY * p.speedFactor;
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(px, py, p.size, 0, Math.PI * 2);
      ctx.fill();
    });

    if (float1) float1.style.transform = `translate(${targetX * -40}px, ${targetY * -40}px)`;
    if (float2) float2.style.transform = `translate(${targetX * 50}px, ${targetY * 50}px)`;

    requestAnimationFrame(animate);
  }
  animate();
}

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

function handleFreeLead(event) {
  event.preventDefault();
  const emailInput = document.getElementById('leadEmail');
  const submitBtn = document.getElementById('leadSubmitBtn');
  const email = emailInput.value.trim();

  if (!email) return;

  submitBtn.disabled = true;
  submitBtn.innerHTML = `
    <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
    <span>치트키 PDF 발송 중...</span>
  `;

  setTimeout(() => {
    triggerDummyDownload('IT-MEMO_무료_부업_스타터_치트키.pdf');
    showToast(`'${email}'으로 무료 치트키 PDF가 다운로드되었습니다!`);
    emailInput.value = '';
    submitBtn.disabled = false;
    submitBtn.innerHTML = `
      <i data-lucide="check" class="w-4 h-4"></i>
      <span>발송 완료! (다시 신청하기)</span>
    `;
    if (window.lucide) lucide.createIcons();
  }, 800);
}

function triggerDummyDownload(filename) {
  const dummyContent = `IT-MEMO 직장인 부업 스타터 가이드북\n본 파일은 IT-MEMO 실전 부업 시뮬레이션 PDF 파일입니다.`;
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

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
