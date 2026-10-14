const { minify } = require('html-minifier-terser');

/**
 * Middleware untuk meminifikasi output HTML (menghapus komentar, whitespace, baris baru)
 * Mengikuti arsitektur OOP
 */
class HtmlMinifierMiddleware {
  #options;

  /**
   * @param {object} [customOptions={}]
   */
  constructor(customOptions = {}) {
    this.#options = {
      removeComments: true,
      collapseWhitespace: true,
      removeRedundantAttributes: true,
      useShortDoctype: true,
      removeEmptyAttributes: true,
      minifyJS: true,
      minifyCSS: true,
      ...customOptions
    };
  }

  /**
   * Express middleware handler yang mencegat pemanggilan res.render
   */
  handle = (req, res, next) => {
    const originalRender = res.render.bind(res);

    res.render = (view, options, callback) => {
      let done = callback;
      let locals = options;

      if (typeof options === 'function') {
        done = options;
        locals = {};
      }

      originalRender(view, locals, async (err, html) => {
        if (err) {
          if (done) return done(err);
          return next(err);
        }

        try {
          const minifiedHtml = await minify(html, this.#options);
          if (done) return done(null, minifiedHtml);
          return res.send(minifiedHtml);
        } catch (minifyError) {
          // Jika terjadi error saat minifikasi, gunakan HTML asli sebagai fallback
          if (done) return done(null, html);
          return res.send(html);
        }
      });
    };

    next();
  };
}

module.exports = HtmlMinifierMiddleware;
