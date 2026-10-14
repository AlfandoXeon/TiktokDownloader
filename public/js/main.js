/**
 * Frontend Client TikTok Downloader (Mendukung Video & Carousel Foto)
 * Menggunakan pendekatan OOP (Object-Oriented Programming)
 */
class TikTokDownloaderClient {
  constructor() {
    // Form & Status Elements
    this.form = document.getElementById('extractForm');
    this.urlInput = document.getElementById('tiktokUrlInput');
    this.pasteBtn = document.getElementById('pasteBtn');
    this.submitBtn = document.getElementById('submitBtn');
    this.submitBtnText = document.getElementById('submitBtnText');
    this.submitSpinner = document.getElementById('submitSpinner');
    this.alertBox = document.getElementById('alertBox');
    this.resultContainer = document.getElementById('resultContainer');

    // Author & Shared Metadata
    this.authorAvatar = document.getElementById('authorAvatar');
    this.authorNickname = document.getElementById('authorNickname');
    this.authorUsername = document.getElementById('authorUsername');
    this.mediaBadge = document.getElementById('mediaBadge');
    this.videoTitle = document.getElementById('videoTitle');

    this.statPlays = document.getElementById('statPlays');
    this.statLikes = document.getElementById('statLikes');
    this.statComments = document.getElementById('statComments');
    this.statShares = document.getElementById('statShares');

    // Video Elements
    this.videoPreviewWrapper = document.getElementById('videoPreviewWrapper');
    this.videoPreview = document.getElementById('videoPreview');
    this.videoActions = document.getElementById('videoActions');
    this.btnDownloadSd = document.getElementById('btnDownloadSd');
    this.btnDownloadHd = document.getElementById('btnDownloadHd');
    this.btnDownloadMp3 = document.getElementById('btnDownloadMp3');

    // Photo Carousel Elements
    this.photoCarouselWrapper = document.getElementById('photoCarouselWrapper');
    this.carouselMainImg = document.getElementById('carouselMainImg');
    this.carouselPrevBtn = document.getElementById('carouselPrevBtn');
    this.carouselNextBtn = document.getElementById('carouselNextBtn');
    this.carouselCurrentIndex = document.getElementById('carouselCurrentIndex');
    this.carouselTotalCount = document.getElementById('carouselTotalCount');
    this.btnDownloadCurrentPhoto = document.getElementById('btnDownloadCurrentPhoto');

    this.photoActions = document.getElementById('photoActions');
    this.selectAllCheckbox = document.getElementById('selectAllCheckbox');
    this.photoSelectionStatus = document.getElementById('photoSelectionStatus');
    this.photoGrid = document.getElementById('photoGrid');
    this.btnDownloadSelectedZip = document.getElementById('btnDownloadSelectedZip');
    this.btnDownloadSelectedText = document.getElementById('btnDownloadSelectedText');
    this.btnDownloadAllZip = document.getElementById('btnDownloadAllZip');
    this.btnDownloadPhotoAudio = document.getElementById('btnDownloadPhotoAudio');

    // State
    this.currentData = null;
    this.currentUrl = '';
    this.activePhotoIndex = 0;
    this.selectedPhotoIndices = new Set();

    this.bindEvents();
  }

  bindEvents() {
    this.form.addEventListener('submit', (e) => this.handleExtract(e));
    this.pasteBtn.addEventListener('click', () => this.handleClipboardPaste());

    // Carousel Navigation
    this.carouselPrevBtn.addEventListener('click', () => this.navigateCarousel(-1));
    this.carouselNextBtn.addEventListener('click', () => this.navigateCarousel(1));

    // Selection Events
    this.selectAllCheckbox.addEventListener('change', (e) => this.handleSelectAll(e.target.checked));
    this.btnDownloadSelectedZip.addEventListener('click', () => this.handleDownloadSelectedZip());
  }

  async handleClipboardPaste() {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        this.urlInput.value = text.trim();
        this.urlInput.focus();
      }
    } catch {
      this.showAlert('Gagal membaca clipboard. Silakan tempel tautan secara manual (Ctrl+V).', 'error');
    }
  }

  setLoading(isLoading) {
    this.submitBtn.disabled = isLoading;
    if (isLoading) {
      this.submitBtnText.textContent = 'Memproses...';
      this.submitSpinner.classList.remove('hidden');
    } else {
      this.submitBtnText.textContent = 'Download';
      this.submitSpinner.classList.add('hidden');
    }
  }

  showAlert(message, type = 'error') {
    this.alertBox.classList.remove(
      'hidden',
      'bg-rose-500/10',
      'border-rose-500/30',
      'text-rose-300',
      'bg-emerald-500/10',
      'border-emerald-500/30',
      'text-emerald-300'
    );

    if (type === 'error') {
      this.alertBox.classList.add('bg-rose-500/10', 'border-rose-500/30', 'text-rose-300');
    } else {
      this.alertBox.classList.add('bg-emerald-500/10', 'border-emerald-500/30', 'text-emerald-300');
    }

    this.alertBox.textContent = message;
  }

  hideAlert() {
    this.alertBox.classList.add('hidden');
  }

  formatNumber(num) {
    return new Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 1 }).format(
      num || 0
    );
  }

  formatDuration(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  }

  async handleExtract(event) {
    event.preventDefault();
    this.hideAlert();

    const rawUrl = this.urlInput.value.trim();
    if (!rawUrl) {
      this.showAlert('Masukkan tautan video atau foto TikTok.');
      return;
    }

    this.setLoading(true);
    this.resultContainer.classList.add('hidden');
    this.videoPreview.pause();

    try {
      const response = await fetch('/api/v1/tiktok/extract', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: rawUrl })
      });

      const payload = await response.json();

      if (!response.ok || !payload.success) {
        throw new Error(payload?.error?.message || 'Gagal memproses tautan TikTok.');
      }

      this.renderResult(rawUrl, payload.data);
    } catch (error) {
      this.showAlert(error.message, 'error');
    } finally {
      this.setLoading(false);
    }
  }

  renderResult(originalUrl, data) {
    this.currentData = data;
    this.currentUrl = originalUrl;

    // Set Creator Info
    this.authorAvatar.src =
      data.author.avatarUrl || 'https://ui-avatars.com/api/?name=TT&background=18181b&color=ffffff';
    this.authorNickname.textContent = data.author.nickname || 'TikTok User';
    this.authorUsername.textContent = `@${data.author.uniqueId}`;
    this.videoTitle.textContent = data.title || 'Tidak ada deskripsi.';

    // Metrics
    this.statPlays.textContent = this.formatNumber(data.stats.plays);
    this.statLikes.textContent = this.formatNumber(data.stats.likes);
    this.statComments.textContent = this.formatNumber(data.stats.comments);
    this.statShares.textContent = this.formatNumber(data.stats.shares);

    const encodedUrl = encodeURIComponent(originalUrl);

    if (data.type === 'photo' && Array.isArray(data.images) && data.images.length > 0) {
      // TAMPILAN FOTO CAROUSEL
      this.videoPreviewWrapper.classList.add('hidden');
      this.videoActions.classList.add('hidden');
      this.photoCarouselWrapper.classList.remove('hidden');
      this.photoActions.classList.remove('hidden');

      this.mediaBadge.textContent = `${data.images.length} Foto`;
      this.initPhotoCarousel();
    } else {
      // TAMPILAN VIDEO
      this.photoCarouselWrapper.classList.add('hidden');
      this.photoActions.classList.add('hidden');
      this.videoPreviewWrapper.classList.remove('hidden');
      this.videoActions.classList.remove('hidden');

      this.mediaBadge.textContent = this.formatDuration(data.duration);
      this.videoPreview.poster = data.coverUrl || '';
      this.videoPreview.src = data.streams?.noWatermarkUrl || '';

      this.btnDownloadSd.href = `/api/v1/tiktok/download?url=${encodedUrl}&quality=sd`;
      this.btnDownloadHd.href = `/api/v1/tiktok/download?url=${encodedUrl}&quality=hd`;
      this.btnDownloadMp3.href = `/api/v1/tiktok/download?url=${encodedUrl}&quality=audio`;
    }

    this.resultContainer.classList.remove('hidden');
  }

  /* ========================================================
   * PHOTO CAROUSEL LOGIC
   * ======================================================== */

  initPhotoCarousel() {
    this.activePhotoIndex = 0;
    const totalPhotos = this.currentData.images.length;

    // Default: Semua foto terpilih
    this.selectedPhotoIndices = new Set(this.currentData.images.map((_, i) => i));

    this.updateCarouselView();
    this.renderPhotoGrid();
    this.updateSelectionState();

    const encodedUrl = encodeURIComponent(this.currentUrl);
    this.btnDownloadAllZip.href = `/api/v1/tiktok/download-zip?url=${encodedUrl}&indices=all`;

    if (this.currentData.streams?.musicUrl) {
      this.btnDownloadPhotoAudio.href = `/api/v1/tiktok/download?url=${encodedUrl}&quality=audio`;
      this.btnDownloadPhotoAudio.classList.remove('hidden');
    } else {
      this.btnDownloadPhotoAudio.classList.add('hidden');
    }
  }

  navigateCarousel(direction) {
    const total = this.currentData.images.length;
    if (total <= 1) return;

    this.activePhotoIndex = (this.activePhotoIndex + direction + total) % total;
    this.updateCarouselView();
  }

  setActivePhoto(index) {
    if (index >= 0 && index < this.currentData.images.length) {
      this.activePhotoIndex = index;
      this.updateCarouselView();
    }
  }

  updateCarouselView() {
    const images = this.currentData.images;
    const currentImageUrl = images[this.activePhotoIndex];

    this.carouselMainImg.src = currentImageUrl;
    this.carouselCurrentIndex.textContent = this.activePhotoIndex + 1;
    this.carouselTotalCount.textContent = images.length;

    const encodedUrl = encodeURIComponent(this.currentUrl);
    this.btnDownloadCurrentPhoto.href = `/api/v1/tiktok/download?url=${encodedUrl}&quality=photo&index=${this.activePhotoIndex}`;

    // Highlight thumbnail aktif di grid
    const allCards = this.photoGrid.querySelectorAll('.photo-thumb-card');
    allCards.forEach((card, idx) => {
      if (idx === this.activePhotoIndex) {
        card.classList.add('ring-2', 'ring-white', 'border-transparent');
      } else {
        card.classList.remove('ring-2', 'ring-white', 'border-transparent');
      }
    });
  }

  renderPhotoGrid() {
    this.photoGrid.innerHTML = '';
    const images = this.currentData.images;
    const encodedUrl = encodeURIComponent(this.currentUrl);

    images.forEach((imgUrl, idx) => {
      const card = document.createElement('div');
      card.className =
        'photo-thumb-card relative group aspect-square rounded-lg overflow-hidden border border-zinc-800 bg-zinc-900 cursor-pointer transition';

      // Gambar thumbnail
      const img = document.createElement('img');
      img.src = imgUrl;
      img.alt = `Foto ${idx + 1}`;
      img.className = 'w-full h-full object-cover select-none';

      // Gradient overlay
      const overlay = document.createElement('div');
      overlay.className = 'absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30 pointer-events-none';

      // Checkbox
      const checkboxWrapper = document.createElement('div');
      checkboxWrapper.className = 'absolute top-1.5 left-1.5 z-10';
      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.checked = this.selectedPhotoIndices.has(idx);
      checkbox.className =
        'w-4 h-4 rounded bg-zinc-900/90 border-zinc-700 text-zinc-300 accent-white cursor-pointer';

      checkbox.addEventListener('change', (e) => {
        e.stopPropagation();
        if (checkbox.checked) {
          this.selectedPhotoIndices.add(idx);
        } else {
          this.selectedPhotoIndices.delete(idx);
        }
        this.updateSelectionState();
      });

      checkboxWrapper.appendChild(checkbox);

      // Label nomor foto
      const badge = document.createElement('span');
      badge.className = 'absolute bottom-1 left-1.5 text-[10px] font-mono font-bold text-zinc-200 select-none';
      badge.textContent = `#${idx + 1}`;

      // Tombol download satuan
      const downloadBtn = document.createElement('a');
      downloadBtn.href = `/api/v1/tiktok/download?url=${encodedUrl}&quality=photo&index=${idx}`;
      downloadBtn.title = `Download Foto #${idx + 1}`;
      downloadBtn.className =
        'absolute bottom-1 right-1.5 z-10 w-5 h-5 rounded bg-zinc-800/90 hover:bg-white hover:text-black text-zinc-300 flex items-center justify-center text-[10px] transition';
      downloadBtn.innerHTML = '&#8595;';
      downloadBtn.addEventListener('click', (e) => e.stopPropagation());

      // Klik thumbnail untuk membuka di preview carousel
      card.addEventListener('click', () => this.setActivePhoto(idx));

      card.appendChild(img);
      card.appendChild(overlay);
      card.appendChild(checkboxWrapper);
      card.appendChild(badge);
      card.appendChild(downloadBtn);

      this.photoGrid.appendChild(card);
    });
  }

  handleSelectAll(isChecked) {
    const images = this.currentData.images;
    if (isChecked) {
      this.selectedPhotoIndices = new Set(images.map((_, i) => i));
    } else {
      this.selectedPhotoIndices.clear();
    }

    // Update semua input checkbox di grid
    const checkboxes = this.photoGrid.querySelectorAll('input[type="checkbox"]');
    checkboxes.forEach((cb) => (cb.checked = isChecked));

    this.updateSelectionState();
  }

  updateSelectionState() {
    const total = this.currentData.images.length;
    const selectedCount = this.selectedPhotoIndices.size;

    this.photoSelectionStatus.textContent = `${selectedCount} / ${total} foto`;

    // Update status Select All Checkbox
    this.selectAllCheckbox.checked = selectedCount === total;
    this.selectAllCheckbox.indeterminate = selectedCount > 0 && selectedCount < total;

    // Update teks & status tombol download terpilih
    this.btnDownloadSelectedText.textContent = `Download Foto Terpilih (${selectedCount}) - ZIP`;
    this.btnDownloadSelectedZip.disabled = selectedCount === 0;
  }

  handleDownloadSelectedZip() {
    const count = this.selectedPhotoIndices.size;
    if (count === 0) {
      this.showAlert('Pilih minimal satu foto untuk diunduh.', 'error');
      return;
    }

    const sortedIndices = Array.from(this.selectedPhotoIndices)
      .sort((a, b) => a - b)
      .join(',');

    const encodedUrl = encodeURIComponent(this.currentUrl);
    const downloadZipUrl = `/api/v1/tiktok/download-zip?url=${encodedUrl}&indices=${sortedIndices}`;

    // Arahkan browser untuk mengunduh berkas ZIP
    window.location.href = downloadZipUrl;
  }
}

document.addEventListener('DOMContentLoaded', () => {
  new TikTokDownloaderClient();
});
