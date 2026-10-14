const { ValidationError } = require('../errors/AppError');

class TikTokVideo {
  #id;
  #type;
  #title;
  #duration;
  #coverUrl;
  #author;
  #stats;
  #streams;
  #images;
  #createdAt;

  constructor({
    id,
    type = 'video',
    title,
    duration,
    coverUrl,
    author,
    stats,
    streams = {},
    images = [],
    createdAt
  }) {
    const isPhoto = type === 'photo' || (Array.isArray(images) && images.length > 0);

    if (!id) {
      throw new ValidationError('ID postingan TikTok tidak valid.');
    }

    if (!isPhoto && !streams?.noWatermarkUrl) {
      throw new ValidationError('Data video tidak lengkap atau tidak memiliki stream tanpa watermark.');
    }

    this.#id = String(id);
    this.#type = isPhoto ? 'photo' : 'video';
    this.#title = title ? String(title).trim() : 'TikTok Post';
    this.#duration = Number(duration) || 0;
    this.#coverUrl = coverUrl || '';
    this.#images = Array.isArray(images) ? [...images] : [];

    this.#author = {
      id: author?.id || '',
      uniqueId: author?.uniqueId || 'unknown',
      nickname: author?.nickname || 'TikTok User',
      avatarUrl: author?.avatarUrl || ''
    };

    this.#stats = {
      plays: Number(stats?.plays) || 0,
      likes: Number(stats?.likes) || 0,
      comments: Number(stats?.comments) || 0,
      shares: Number(stats?.shares) || 0,
      downloads: Number(stats?.downloads) || 0
    };

    this.#streams = {
      noWatermarkUrl: streams?.noWatermarkUrl || null,
      noWatermarkHdUrl: streams?.noWatermarkHdUrl || streams?.noWatermarkUrl || null,
      watermarkUrl: streams?.watermarkUrl || null,
      musicUrl: streams?.musicUrl || null
    };

    this.#createdAt = createdAt ? new Date(createdAt * 1000).toISOString() : new Date().toISOString();
  }

  get id() {
    return this.#id;
  }

  get type() {
    return this.#type;
  }

  get isPhoto() {
    return this.#type === 'photo';
  }

  get title() {
    return this.#title;
  }

  get author() {
    return { ...this.#author };
  }

  get streams() {
    return { ...this.#streams };
  }

  get images() {
    return [...this.#images];
  }

  getSafeFilename(type = 'video', index = 0) {
    const cleanAuthor = this.#author.uniqueId.replace(/[^a-zA-Z0-9_-]/g, '') || 'tiktok';

    if (type === 'photo') {
      return `tiktok_${cleanAuthor}_${this.#id}_photo_${Number(index) + 1}.jpeg`;
    }
    if (type === 'zip') {
      return `tiktok_${cleanAuthor}_${this.#id}_photos.zip`;
    }
    const ext = type === 'audio' ? 'mp3' : 'mp4';
    return `tiktok_${cleanAuthor}_${this.#id}.${ext}`;
  }

  toJSON() {
    return {
      id: this.#id,
      type: this.#type,
      title: this.#title,
      duration: this.#duration,
      coverUrl: this.#coverUrl,
      createdAt: this.#createdAt,
      images: [...this.#images],
      author: { ...this.#author },
      stats: { ...this.#stats },
      streams: { ...this.#streams },
      filenames: {
        video: this.getSafeFilename('video'),
        audio: this.getSafeFilename('audio'),
        zip: this.getSafeFilename('zip')
      }
    };
  }
}

module.exports = TikTokVideo;
