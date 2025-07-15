#!/usr/bin/env node

/**
 * rSearch SEO Monitoring Script
 * 
 * This script helps monitor basic SEO metrics for rSearch.
 * Run with: node scripts/seo-monitor.js
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

// Configuration
const CONFIG = {
  baseUrl: 'https://rsearch.app',
  targetKeywords: [
    'rsearch',
    'AI search engine',
    'reasoning engine',
    'Perplexity alternative',
    'free AI search',
    'DeepSeek R1',
    'AI reasoning'
  ],
  pages: [
    '/',
    '/about',
    '/features',
    '/blog',
    '/rsearch'
  ],
  sitemapUrl: 'https://rsearch.app/sitemap.xml'
};

// Colors for console output
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

// Utility functions
function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function makeRequest(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => resolve({ status: res.statusCode, data }));
    }).on('error', reject);
  });
}

// SEO Checks
async function checkPageSpeed(url) {
  try {
    const start = Date.now();
    const response = await makeRequest(url);
    const loadTime = Date.now() - start;
    
    return {
      status: response.status,
      loadTime,
      isFast: loadTime < 2000
    };
  } catch (error) {
    return { error: error.message };
  }
}

async function checkSitemap() {
  try {
    const response = await makeRequest(CONFIG.sitemapUrl);
    if (response.status === 200) {
      const urlCount = (response.data.match(/<url>/g) || []).length;
      return { status: 'OK', urlCount };
    }
    return { status: 'ERROR', error: `HTTP ${response.status}` };
  } catch (error) {
    return { status: 'ERROR', error: error.message };
  }
}

async function checkRobotsTxt() {
  try {
    const response = await makeRequest(`${CONFIG.baseUrl}/robots.txt`);
    if (response.status === 200) {
      const hasSitemap = response.data.includes('Sitemap:');
      const hasUserAgent = response.data.includes('User-agent:');
      return { status: 'OK', hasSitemap, hasUserAgent };
    }
    return { status: 'ERROR', error: `HTTP ${response.status}` };
  } catch (error) {
    return { status: 'ERROR', error: error.message };
  }
}

async function checkMetaTags(url) {
  try {
    const response = await makeRequest(url);
    if (response.status === 200) {
      const html = response.data;
      const hasTitle = html.includes('<title>');
      const hasDescription = html.includes('name="description"');
      const hasOpenGraph = html.includes('property="og:');
      const hasTwitterCard = html.includes('name="twitter:');
      const hasStructuredData = html.includes('application/ld+json');
      
      return {
        status: 'OK',
        hasTitle,
        hasDescription,
        hasOpenGraph,
        hasTwitterCard,
        hasStructuredData
      };
    }
    return { status: 'ERROR', error: `HTTP ${response.status}` };
  } catch (error) {
    return { status: 'ERROR', error: error.message };
  }
}

// Main monitoring function
async function runSEOMonitor() {
  log('\n🔍 rSearch SEO Monitor', 'bold');
  log('='.repeat(50), 'blue');
  
  const results = {
    pages: [],
    sitemap: null,
    robots: null,
    summary: {
      totalPages: 0,
      fastPages: 0,
      pagesWithMeta: 0,
      errors: 0
    }
  };
  
  // Check each page
  log('\n📄 Checking Pages...', 'blue');
  for (const page of CONFIG.pages) {
    const url = `${CONFIG.baseUrl}${page}`;
    log(`\nChecking: ${page}`, 'yellow');
    
    const speedCheck = await checkPageSpeed(url);
    const metaCheck = await checkMetaTags(url);
    
    const pageResult = {
      url: page,
      speed: speedCheck,
      meta: metaCheck
    };
    
    results.pages.push(pageResult);
    results.summary.totalPages++;
    
    if (speedCheck.isFast) results.summary.fastPages++;
    if (metaCheck.status === 'OK') results.summary.pagesWithMeta++;
    if (speedCheck.error || metaCheck.status === 'ERROR') results.summary.errors++;
    
    // Log results
    if (speedCheck.error) {
      log(`  ❌ Speed: ${speedCheck.error}`, 'red');
    } else {
      log(`  ⚡ Speed: ${speedCheck.loadTime}ms ${speedCheck.isFast ? '✅' : '⚠️'}`, speedCheck.isFast ? 'green' : 'yellow');
    }
    
    if (metaCheck.status === 'OK') {
      log(`  📋 Meta: Title: ${metaCheck.hasTitle ? '✅' : '❌'}, Desc: ${metaCheck.hasDescription ? '✅' : '❌'}, OG: ${metaCheck.hasOpenGraph ? '✅' : '❌'}, Twitter: ${metaCheck.hasTwitterCard ? '✅' : '❌'}, Schema: ${metaCheck.hasStructuredData ? '✅' : '❌'}`, 'green');
    } else {
      log(`  ❌ Meta: ${metaCheck.error}`, 'red');
    }
  }
  
  // Check sitemap
  log('\n🗺️  Checking Sitemap...', 'blue');
  results.sitemap = await checkSitemap();
  if (results.sitemap.status === 'OK') {
    log(`  ✅ Sitemap: ${results.sitemap.urlCount} URLs found`, 'green');
  } else {
    log(`  ❌ Sitemap: ${results.sitemap.error}`, 'red');
  }
  
  // Check robots.txt
  log('\n🤖 Checking Robots.txt...', 'blue');
  results.robots = await checkRobotsTxt();
  if (results.robots.status === 'OK') {
    log(`  ✅ Robots.txt: Sitemap: ${results.robots.hasSitemap ? '✅' : '❌'}, User-agent: ${results.robots.hasUserAgent ? '✅' : '❌'}`, 'green');
  } else {
    log(`  ❌ Robots.txt: ${results.robots.error}`, 'red');
  }
  
  // Summary
  log('\n📊 Summary', 'bold');
  log('='.repeat(50), 'blue');
  log(`Total Pages: ${results.summary.totalPages}`, 'blue');
  log(`Fast Pages (<2s): ${results.summary.fastPages}/${results.summary.totalPages}`, results.summary.fastPages === results.summary.totalPages ? 'green' : 'yellow');
  log(`Pages with Meta Tags: ${results.summary.pagesWithMeta}/${results.summary.totalPages}`, results.summary.pagesWithMeta === results.summary.totalPages ? 'green' : 'yellow');
  log(`Errors: ${results.summary.errors}`, results.summary.errors === 0 ? 'green' : 'red');
  
  // Recommendations
  log('\n💡 Recommendations', 'bold');
  log('='.repeat(50), 'blue');
  
  if (results.summary.fastPages < results.summary.totalPages) {
    log('• Optimize page speed for slower pages', 'yellow');
  }
  
  if (results.summary.pagesWithMeta < results.summary.totalPages) {
    log('• Add missing meta tags to pages', 'yellow');
  }
  
  if (results.summary.errors > 0) {
    log('• Fix errors found during monitoring', 'red');
  }
  
  if (results.sitemap.status === 'OK' && results.sitemap.urlCount < 10) {
    log('• Consider adding more content to increase sitemap URLs', 'yellow');
  }
  
  log('\n✅ SEO Monitor Complete!', 'green');
  
  // Save results to file
  const timestamp = new Date().toISOString().split('T')[0];
  const resultsFile = path.join(__dirname, `../logs/seo-monitor-${timestamp}.json`);
  
  try {
    if (!fs.existsSync(path.dirname(resultsFile))) {
      fs.mkdirSync(path.dirname(resultsFile), { recursive: true });
    }
    fs.writeFileSync(resultsFile, JSON.stringify(results, null, 2));
    log(`\n📁 Results saved to: ${resultsFile}`, 'blue');
  } catch (error) {
    log(`\n❌ Failed to save results: ${error.message}`, 'red');
  }
}

// Run the monitor
if (require.main === module) {
  runSEOMonitor().catch(console.error);
}

module.exports = { runSEOMonitor, CONFIG };