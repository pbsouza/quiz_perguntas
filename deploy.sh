#!/usr/bin/env bash
# Deploy manual para GitHub Pages usando git subtree ou branch gh-pages
set -e

echo "📦 1. Compilando o projeto com caminhos relativos (Vite)..."
npm run build

echo "✅ Build concluído na pasta /dist."
echo ""
echo "Para publicar no GitHub Pages:"
echo "Opção A (Automática): Faça push para a branch 'main' ou 'master' que o GitHub Actions (.github/workflows/deploy.yml) cuidará do deploy."
echo "Opção B (Manual via git subtree):"
echo "  git add dist -f"
echo "  git commit -m 'Deploy to GitHub Pages'"
echo "  git subtree push --prefix dist origin gh-pages"
echo ""
echo "🚀 Pronto!"
