const axios = require('axios');
const BaseExtractor = require('./BaseExtractor');
const TikTokVideo = require('../models/TikTokVideo');
const config = require('../config/Config');
const { NotFoundError, UpstreamError } = require('../errors/AppError');

class TikWmExtractor extends BaseExtractor {
  #httpClient;

  constructor() {
    super();
    this.#httpClient = axios.create({
      baseURL: config.get('tikwmApiBaseUrl'),
      timeout: config.get('requestTimeoutMs'),
      headers: {
        'User-Agent': config.get('userAgent'),
        Accept: 'application/json, text/plain, */*',
        'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
      }
    });
  }

  #resolveFullMediaUrl(pathOrUrl) {
    if (!pathOrUrl) return null;
    if (pathOrUrl.startsWith('http://') || pathOrUrl.startsWith('https://')) {
      return pathOrUrl;
    }
    return `https://www.tikwm.com${pathOrUrl.startsWith('/') ? '' : '/'}${pathOrUrl}`;
  }

  async extract(rawUrl) {
    const validUrl = this.validateTikTokUrl(rawUrl);

    let response;
    try {
      const params = new URLSearchParams();
      params.append('url', validUrl);
      params.append('hd', '1');

      response = await this.#httpClient.post('', params.toString());
    } catch (error) {
      throw new UpstreamError(
        `Koneksi ke provider ekstraktor gagal: ${error.message || 'Timeout / Network Error'}`
      );
    }

    const payload = response.data;
    if (!payload || payload.code !== 0 || !payload.data) {
      throw new NotFoundError(
        payload?.msg || 'Postingan tidak ditemukan. Pastikan tautan benar dan akun tidak diprivat.'
      );
    }

    const data = payload.data;
    const rawImages = Array.isArray(data.images) ? data.images : [];
    const images = rawImages.map((img) => this.#resolveFullMediaUrl(img)).filter(Boolean);
    const isPhoto = images.length > 0;

    return new TikTokVideo({
      id: data.id,
      type: isPhoto ? 'photo' : 'video',
      title: data.title,
      duration: data.duration,
      coverUrl: this.#resolveFullMediaUrl(data.cover || (images.length > 0 ? images[0] : null)),
      createdAt: data.create_time,
      images,
      author: {
        id: data.author?.id,
        uniqueId: data.author?.unique_id,
        nickname: data.author?.nickname,
        avatarUrl: this.#resolveFullMediaUrl(data.author?.avatar)
      },
      stats: {
        plays: data.play_count,
        likes: data.digg_count,
        comments: data.comment_count,
        shares: data.share_count,
        downloads: data.download_count
      },
      streams: {
        noWatermarkUrl: isPhoto ? null : this.#resolveFullMediaUrl(data.play),
        noWatermarkHdUrl: isPhoto ? null : this.#resolveFullMediaUrl(data.hdplay || data.play),
        watermarkUrl: isPhoto ? null : this.#resolveFullMediaUrl(data.wmplay),
        musicUrl: this.#resolveFullMediaUrl(data.music || (isPhoto ? data.play : null))
      }
    });
  }
}

module.exports = TikWmExtractor;
