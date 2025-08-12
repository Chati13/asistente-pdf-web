const path = require("path");

/** @type {import('next').NextConfig} */
module.exports = {
  webpack: (config) => {
    // Fuerza alias '@' a la raíz del proyecto que Vercel está construyendo
    config.resolve.alias["@"]= path.resolve(__dirname);
    return config;
  },
};
