const { ValidationError } = require('../errors/AppError');
const config = require('../config/Config');

class TikTokController {
  #extractorService;
  #streamService;

  /**
   * Dependency Injection via Constructor
   * @param {import('../services/BaseExtractor')} extractorService
   * @param {import('../services/StreamService')} streamService
   */
  constructor(extractorService, streamService) {
    this.#extractorService = extractorService;
    this.#streamService = streamService;
  }

  renderHome = (req, res) => {
    res.render('index', {
      title: 'TikTok Downloader - Download Videos & Photos (No Watermark)',
      siteUrl: config.get('siteUrl'),
      googleSiteVerification: config.get('googleSiteVerification')
    });
  };

  getHealth = (req, res) => {
    return res.status(200).json({
      status: 'ok',
      uptime: Math.floor(process.uptime()),
      timestamp: new Date().toISOString(),
      service: 'tiktok-downloader'
    });
  };

  getVideoInfo = async (req, res, next) => {
    try {
      const { url } = req.body;
      const videoModel = await this.#extractorService.extract(url);

      return res.status(200).json({
        success: true,
        data: videoModel.toJSON()
      });
    } catch (error) {
      next(error);
    }
  };

  downloadMedia = async (req, res, next) => {
    try {
      const { url, quality = 'sd', index = '0' } = req.query;
      if (!url) {
        throw new ValidationError('Query parameter "url" is required.');
      }

      const videoModel = await this.#extractorService.extract(url);
      const streams = videoModel.streams;

      let targetStreamUrl;
      let contentType = 'video/mp4';
      let filename = videoModel.getSafeFilename('video');

      if (videoModel.isPhoto) {
        if (quality.toLowerCase() === 'audio' || quality.toLowerCase() === 'mp3') {
          targetStreamUrl = streams.musicUrl;
          contentType = 'audio/mpeg';
          filename = videoModel.getSafeFilename('audio');
        } else {
          const photoIndex = Math.max(0, parseInt(index, 10) || 0);
          if (!videoModel.images[photoIndex]) {
            throw new ValidationError(`Photo #${photoIndex + 1} was not found.`);
          }
          targetStreamUrl = videoModel.images[photoIndex];
          contentType = 'image/jpeg';
          filename = videoModel.getSafeFilename('photo', photoIndex);
        }
      } else {
        switch (quality.toLowerCase()) {
          case 'hd':
            targetStreamUrl = streams.noWatermarkHdUrl || streams.noWatermarkUrl;
            break;
          case 'audio':
          case 'mp3':
            targetStreamUrl = streams.musicUrl;
            contentType = 'audio/mpeg';
            filename = videoModel.getSafeFilename('audio');
            break;
          case 'wm':
            targetStreamUrl = streams.watermarkUrl || streams.noWatermarkUrl;
            break;
          case 'sd':
          default:
            targetStreamUrl = streams.noWatermarkUrl;
            break;
        }
      }

      await this.#streamService.pipeMediaStream(
        targetStreamUrl,
        filename,
        contentType,
        res
      );
    } catch (error) {
      next(error);
    }
  };

  downloadPhotosZip = async (req, res, next) => {
    try {
      const { url, indices } = req.query;
      if (!url) {
        throw new ValidationError('Query parameter "url" is required.');
      }

      const videoModel = await this.#extractorService.extract(url);

      if (!videoModel.isPhoto || videoModel.images.length === 0) {
        throw new ValidationError('This post is not a TikTok photo carousel.');
      }

      let selectedIndices = [];
      if (!indices || indices === 'all') {
        selectedIndices = videoModel.images.map((_, i) => i);
      } else {
        selectedIndices = String(indices)
          .split(',')
          .map((i) => parseInt(i.trim(), 10))
          .filter((i) => !isNaN(i) && i >= 0 && i < videoModel.images.length);
      }

      if (selectedIndices.length === 0) {
        throw new ValidationError('Please select at least one photo to download.');
      }

      const files = selectedIndices.map((idx) => ({
        url: videoModel.images[idx],
        filename: videoModel.getSafeFilename('photo', idx)
      }));

      const zipFilename = videoModel.getSafeFilename('zip');
      await this.#streamService.pipeZipStream(files, zipFilename, res);
    } catch (error) {
      next(error);
    }
  };
}

module.exports = TikTokController;
