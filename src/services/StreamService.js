const axios = require('axios');
const { ZipArchive } = require('archiver');
const config = require('../config/Config');
const { ValidationError, UpstreamError } = require('../errors/AppError');

class StreamService {
  /**
   * Mengalirkan (pipe) stream binary langsung dari CDN ke HTTP Response
   * tanpa memuat seluruh file video/gambar ke RAM server.
   * @param {string} mediaUrl
   * @param {string} filename
   * @param {string} contentType
   * @param {import('express').Response} res
   */
  async pipeMediaStream(mediaUrl, filename, contentType, res) {
    if (!mediaUrl) {
      throw new ValidationError('Media stream URL is unavailable.');
    }

    let upstreamResponse;
    try {
      upstreamResponse = await axios({
        method: 'GET',
        url: mediaUrl,
        responseType: 'stream',
        timeout: config.get('requestTimeoutMs') * 2,
        headers: {
          'User-Agent': config.get('userAgent'),
          Referer: 'https://www.tiktok.com/'
        }
      });
    } catch (error) {
      throw new UpstreamError(`Failed to download media stream: ${error.message}`);
    }

    const contentLength = upstreamResponse.headers['content-length'];
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Type', contentType);
    if (contentLength) {
      res.setHeader('Content-Length', contentLength);
    }

    upstreamResponse.data.on('error', (streamErr) => {
      console.error('[StreamService] Stream error:', streamErr.message);
      if (!res.headersSent) {
        res.status(502).json({ success: false, message: 'Stream interrupted from origin server.' });
      } else {
        res.end();
      }
    });

    upstreamResponse.data.pipe(res);
  }

  /**
   * Mengalirkan kumpulan berkas (seperti carousel foto) sebagai arsip ZIP langsung ke response
   * @param {Array<{ url: string, filename: string }>} files
   * @param {string} zipFilename
   * @param {import('express').Response} res
   */
  async pipeZipStream(files, zipFilename, res) {
    if (!files || !Array.isArray(files) || files.length === 0) {
      throw new ValidationError('No files selected for download.');
    }

    const archive = new ZipArchive({
      zlib: { level: 6 }
    });

    res.setHeader('Content-Disposition', `attachment; filename="${zipFilename}"`);
    res.setHeader('Content-Type', 'application/zip');

    archive.on('error', (err) => {
      console.error('[StreamService] Zip archive error:', err.message);
      if (!res.headersSent) {
        res.status(500).json({ success: false, message: 'Failed to generate ZIP archive.' });
      } else {
        res.end();
      }
    });

    archive.pipe(res);

    for (const file of files) {
      try {
        const response = await axios({
          method: 'GET',
          url: file.url,
          responseType: 'stream',
          timeout: config.get('requestTimeoutMs') * 2,
          headers: {
            'User-Agent': config.get('userAgent'),
            Referer: 'https://www.tiktok.com/'
          }
        });

        archive.append(response.data, { name: file.filename });
      } catch (err) {
        console.error(`[StreamService] Failed to append file ${file.filename} to ZIP:`, err.message);
      }
    }

    await archive.finalize();
  }
}

module.exports = StreamService;
