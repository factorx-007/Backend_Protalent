const express = require('express');
const router = express.Router();

// Endpoint para generar imágenes placeholder
router.get('/:width/:height', (req, res) => {
  const { width, height } = req.params;
  const { text = 'Placeholder' } = req.query;
  
  // Crear SVG placeholder
  const svg = `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="#e5e7eb"/>
      <text x="50%" y="50%" font-family="Arial, sans-serif" font-size="16" 
            fill="#6b7280" text-anchor="middle" dominant-baseline="middle">
        ${text}
      </text>
    </svg>
  `;
  
  res.setHeader('Content-Type', 'image/svg+xml');
  res.setHeader('Cache-Control', 'public, max-age=86400'); // Cache por 24 horas
  res.send(svg);
});

module.exports = router;
