#!/usr/bin/env node

/**
 * Test script to debug image generation issues
 * Run with: node scripts/test-image-generation.js
 */

const fs = require('fs');
const path = require('path');

// Load environment variables
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') });

async function testImageGeneration() {
  console.log('🧪 Testing Image Generation...\n');

  const models = ['fast', 'pro', 'ultra'];
  const testPrompt = 'A beautiful sunset over mountains';

  for (const model of models) {
    console.log(`\n📸 Testing ${model.toUpperCase()} model...`);
    
    try {
      // Test the API endpoint
      const response = await fetch('http://localhost:3000/api/image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: testPrompt,
          aspectRatio: '1:1',
          model: model,
        }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        console.error(`❌ ${model} model failed:`, data.error);
        continue;
      }

      console.log(`✅ ${model} model request created:`, data.requestId);
      
      // Poll for results
      let attempts = 0;
      const maxAttempts = 60;
      
      while (attempts < maxAttempts) {
        await new Promise(resolve => setTimeout(resolve, 5000)); // Wait 5 seconds
        
        const statusResponse = await fetch(`http://localhost:3000/api/image?id=${data.requestId}`);
        const statusData = await statusResponse.json();
        
        if (statusData.status === 'succeeded') {
          console.log(`✅ ${model} model completed with ${statusData.output?.length || 0} images`);
          if (statusData.output) {
            console.log(`   URLs: ${statusData.output.join(', ')}`);
          }
          break;
        } else if (statusData.status === 'failed') {
          console.error(`❌ ${model} model failed during generation`);
          break;
        }
        
        attempts++;
        console.log(`⏳ ${model} model still processing... (attempt ${attempts}/${maxAttempts})`);
      }
      
      if (attempts >= maxAttempts) {
        console.error(`⏰ ${model} model timed out`);
      }
      
    } catch (error) {
      console.error(`❌ Error testing ${model} model:`, error.message);
    }
  }
}

// Check if server is running
async function checkServer() {
  try {
    const response = await fetch('http://localhost:3000/api/image', { method: 'GET' });
    return true;
  } catch (error) {
    return false;
  }
}

async function main() {
  console.log('🚀 Image Generation Test Script\n');
  
  const serverRunning = await checkServer();
  if (!serverRunning) {
    console.error('❌ Server is not running. Please start the development server first:');
    console.error('   npm run dev');
    process.exit(1);
  }
  
  console.log('✅ Server is running\n');
  
  if (!process.env.REPLICATE_API_TOKEN) {
    console.error('❌ REPLICATE_API_TOKEN not found in environment variables');
    process.exit(1);
  }
  
  console.log('✅ Replicate API token found\n');
  
  await testImageGeneration();
  
  console.log('\n🏁 Test completed!');
}

main().catch(console.error);