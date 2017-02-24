exports.DATABASE_URL = process.env.DATABASE_URL ||
                       global.DATABASE_URL ||
                      'mongodb://am:pass@ds161049.mlab.com:61049/blog-seed';
exports.PORT = process.env.PORT || 8080;
