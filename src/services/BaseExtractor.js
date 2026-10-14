const { ValidationError } = require('../errors/AppError');

class BaseExtractor {
  constructor() {
    if (new.target === BaseExtractor) {
      throw new TypeError('BaseExtractor adalah abstract class dan tidak dapat diinstansiasi secara langsung.');
    }
  }

  /**
   * Memvalidasi apakah URL merupakan URL TikTok yang sah
   * @param {string} rawUrl
   * @returns {string} URL yang sudah dibersihkan
   */
  validateTikTokUrl(rawUrl) {
    if (!rawUrl || typeof rawUrl !== 'string') {
      throw new ValidationError('URL TikTok wajib diisi.');
    }

    const trimmed = rawUrl.trim();
    let parsedUrl;
    try {
      parsedUrl = new URL(trimmed);
    } catch {
      throw new ValidationError('Format URL tidak valid. Pastikan menyertakan http:// atau https://');
    }

    const allowedHosts = [
      'tiktok.com',
      'www.tiktok.com',
      'm.tiktok.com',
      'vt.tiktok.com',
      'vm.tiktok.com'
    ];

    const isAllowed = allowedHosts.some(
      (host) => parsedUrl.hostname === host || parsedUrl.hostname.endsWith(`.${host}`)
    );

    if (!isAllowed) {
      throw new ValidationError('Bukan URL TikTok yang valid. Gunakan tautan dari tiktok.com atau vt.tiktok.com.');
    }

    return parsedUrl.toString();
  }

  /**
   * Abstract method yang wajib diimplementasikan oleh subclass
   * @param {string} url
   * @returns {Promise<import('../models/TikTokVideo')>}
   */
  async extract(url) {
    throw new Error(`Method extract(${url}) harus diimplementasikan oleh subclass.`);
  }
}

module.exports = BaseExtractor;
