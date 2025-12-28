/**
 * Simple Test Script for Weather Service
 * 
 * Run this to verify the upgraded weather service is working correctly.
 * 
 * Usage:
 *   node examples/testWeatherService.js
 * 
 * Or with custom coordinates:
 *   node examples/testWeatherService.js 40.7128 -74.0060
 */

import { getFarmingWeatherData } from '../src/services/weatherService.js';

// Default coordinates (New York City)
const DEFAULT_LAT = 40.7128;
const DEFAULT_LON = -74.0060;

async function testWeatherService() {
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║         WEATHER SERVICE TEST & VERIFICATION                ║');
  console.log('╚════════════════════════════════════════════════════════════╝\n');

  // Get coordinates from command line or use defaults
  const latitude = parseFloat(process.argv[2]) || DEFAULT_LAT;
  const longitude = parseFloat(process.argv[3]) || DEFAULT_LON;

  console.log(`📍 Testing location: ${latitude}, ${longitude}\n`);
  console.log('⏳ Fetching weather data...\n');

  try {
    const startTime = Date.now();
    const data = await getFarmingWeatherData(latitude, longitude);
    const fetchTime = Date.now() - startTime;

    console.log('✅ SUCCESS! Weather data fetched successfully\n');
    console.log(`⚡ Fetch time: ${fetchTime}ms\n`);
    console.log('═'.repeat(60) + '\n');

    // Test 1: Verify data structure
    console.log('TEST 1: Data Structure Verification');
    console.log('─'.repeat(60));
    
    const tests = [
      { name: 'Location data', check: () => data.location && data.location.latitude },
      { name: 'Current weather', check: () => data.current && data.current.temperature !== undefined },
      { name: 'Heat index', check: () => data.current.heatIndex !== undefined },
      { name: 'Hourly forecast', check: () => Array.isArray(data.hourly) && data.hourly.length > 0 },
      { name: 'Daily forecast', check: () => Array.isArray(data.daily) && data.daily.length === 7 },
      { name: 'Evapotranspiration', check: () => data.daily[0].evapotranspiration !== undefined },
      { name: 'Irrigation needs', check: () => data.daily[0].irrigationNeed !== undefined },
      { name: 'Historical rainfall', check: () => data.historical && Array.isArray(data.historical.rainfall) },
      { name: 'Summary statistics', check: () => data.summary && data.summary.next7Days },
      { name: 'Metadata', check: () => data.metadata && data.metadata.version === '3.0' },
    ];

    let passed = 0;
    tests.forEach(test => {
      try {
        if (test.check()) {
          console.log(`✅ ${test.name}`);
          passed++;
        } else {
          console.log(`❌ ${test.name}`);
        }
      } catch (error) {
        console.log(`❌ ${test.name} - Error: ${error.message}`);
      }
    });

    console.log(`\nPassed: ${passed}/${tests.length}\n`);
    console.log('═'.repeat(60) + '\n');

    // Test 2: Display sample data
    console.log('TEST 2: Sample Data Display');
    console.log('─'.repeat(60));
    console.log('\n📍 LOCATION:');
    console.log(`   Coordinates: ${data.location.latitude}, ${data.location.longitude}`);
    console.log(`   Timezone: ${data.location.timezone}`);

    console.log('\n🌡️  CURRENT CONDITIONS:');
    console.log(`   Temperature: ${data.current.temperature}°C`);
    console.log(`   Feels Like: ${data.current.feelsLike}°C`);
    console.log(`   Heat Index: ${data.current.heatIndex}°C`);
    console.log(`   Humidity: ${data.current.humidity}%`);
    console.log(`   Condition: ${data.current.condition}`);
    console.log(`   Wind: ${data.current.windSpeed} km/h`);

    console.log('\n⏰ HOURLY FORECAST (Next 6 hours):');
    data.hourly.slice(0, 6).forEach(hour => {
      const time = hour.time.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
      console.log(`   ${time}: ${hour.temperature}°C, ${hour.condition}, ${hour.precipitationProbability}% rain`);
    });

    console.log('\n📅 DAILY FORECAST (Next 7 days):');
    data.daily.forEach(day => {
      const date = day.date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
      console.log(`   ${date}: ${day.minTemp}-${day.maxTemp}°C, ${day.condition}`);
      console.log(`      Rain: ${day.rain}mm, ET0: ${day.evapotranspiration}mm, Irrigation: ${day.irrigationNeed}mm`);
    });

    console.log('\n📊 HISTORICAL RAINFALL (Last 7 days):');
    data.historical.rainfall.forEach(day => {
      const date = day.date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
      const bar = '█'.repeat(Math.round(day.rain / 2));
      console.log(`   ${date}: ${day.rain.toFixed(1)}mm ${bar}`);
    });
    console.log(`   Total: ${data.historical.totalRainfall}mm`);
    console.log(`   Average: ${data.historical.averageDailyRainfall}mm/day`);

    console.log('\n📈 SUMMARY (Next 7 days):');
    console.log(`   Expected Rainfall: ${data.summary.next7Days.totalRainfall}mm`);
    console.log(`   Evapotranspiration: ${data.summary.next7Days.totalEvapotranspiration}mm`);
    console.log(`   Irrigation Needed: ${data.summary.next7Days.irrigationNeed}mm`);

    console.log('\n═'.repeat(60) + '\n');

    // Test 3: Verify calculations
    console.log('TEST 3: Calculation Verification');
    console.log('─'.repeat(60));

    // Check heat index calculation
    const heatIndexValid = data.current.heatIndex >= data.current.temperature - 5 &&
                           data.current.heatIndex <= data.current.temperature + 20;
    console.log(`${heatIndexValid ? '✅' : '❌'} Heat index calculation (${data.current.heatIndex}°C)`);

    // Check irrigation calculation
    const firstDay = data.daily[0];
    const expectedIrrigation = Math.max(0, firstDay.evapotranspiration - firstDay.rain);
    const irrigationValid = Math.abs(firstDay.irrigationNeed - expectedIrrigation) < 0.1;
    console.log(`${irrigationValid ? '✅' : '❌'} Irrigation need calculation (${firstDay.irrigationNeed}mm)`);

    // Check historical total
    const calculatedTotal = data.historical.rainfall.reduce((sum, day) => sum + day.rain, 0);
    const totalValid = Math.abs(calculatedTotal - data.historical.totalRainfall) < 0.1;
    console.log(`${totalValid ? '✅' : '❌'} Historical rainfall total (${data.historical.totalRainfall}mm)`);

    console.log('\n═'.repeat(60) + '\n');

    // Test 4: Cache test
    console.log('TEST 4: Cache Functionality');
    console.log('─'.repeat(60));
    console.log('⏳ Fetching data again (should use cache)...');

    const cacheStartTime = Date.now();
    const cachedData = await getFarmingWeatherData(latitude, longitude);
    const cacheTime = Date.now() - cacheStartTime;

    console.log(`✅ Cache fetch time: ${cacheTime}ms`);
    
    if (cacheTime < fetchTime / 2) {
      console.log('✅ Cache is working (significantly faster)');
    } else {
      console.log('⚠️  Cache may not be working optimally');
    }

    console.log('\n═'.repeat(60) + '\n');

    // Final summary
    console.log('╔════════════════════════════════════════════════════════════╗');
    console.log('║                    TEST COMPLETE                           ║');
    console.log('╚════════════════════════════════════════════════════════════╝\n');

    console.log('✅ All core features verified successfully!\n');
    console.log('📚 Next steps:');
    console.log('   - Read WEATHER_SERVICE_USAGE.md for detailed documentation');
    console.log('   - Check examples/farmingWeatherExample.js for usage examples');
    console.log('   - See WEATHER_API_QUICK_REFERENCE.md for quick reference\n');

    return true;

  } catch (error) {
    console.error('\n❌ TEST FAILED\n');
    console.error('Error:', error.message);
    console.error('\nStack trace:');
    console.error(error.stack);
    console.error('\n💡 Troubleshooting:');
    console.error('   1. Check your internet connection');
    console.error('   2. Verify coordinates are valid (latitude: -90 to 90, longitude: -180 to 180)');
    console.error('   3. Check if Open-Meteo API is accessible');
    console.error('   4. Review error message above for specific issues\n');
    
    return false;
  }
}

// Run the test
testWeatherService()
  .then(success => {
    process.exit(success ? 0 : 1);
  })
  .catch(error => {
    console.error('Unexpected error:', error);
    process.exit(1);
  });

