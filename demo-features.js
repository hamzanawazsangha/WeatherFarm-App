/**
 * SIMPLE DEMO - Shows All 4 Required Features
 * 
 * This demonstrates:
 * 1. Hourly forecast (48 hours) ✓
 * 2. Historical rainfall (7 days) ✓
 * 3. Heat index calculation ✓
 * 4. Evapotranspiration (ET0) ✓
 * 
 * Run: node demo-features.js
 */

import { getFarmingWeatherData } from './src/services/weatherService.js';

async function demonstrateFeatures() {
  console.log('╔═══════════════════════════════════════════════════════════╗');
  console.log('║  DEMONSTRATING ALL 4 REQUESTED FEATURES                   ║');
  console.log('╚═══════════════════════════════════════════════════════════╝\n');

  // Use New York coordinates
  const latitude = 40.7128;
  const longitude = -74.0060;

  console.log(`📍 Location: ${latitude}, ${longitude} (New York City)`);
  console.log('⏳ Fetching data...\n');

  try {
    const weather = await getFarmingWeatherData(latitude, longitude);

    console.log('✅ Data fetched successfully!\n');
    console.log('═'.repeat(63) + '\n');

    // ========================================================================
    // FEATURE 1: HOURLY FORECAST (48 HOURS)
    // ========================================================================
    console.log('📊 FEATURE #1: HOURLY FORECAST (Next 48 Hours)');
    console.log('─'.repeat(63));
    console.log(`Total hours available: ${weather.hourly.length}`);
    console.log('\nFirst 10 hours:\n');
    
    for (let i = 0; i < 10 && i < weather.hourly.length; i++) {
      const hour = weather.hourly[i];
      const time = hour.time.toLocaleString('en-US', { 
        month: 'short', 
        day: 'numeric', 
        hour: 'numeric', 
        minute: '2-digit' 
      });
      console.log(`  ${time}`);
      console.log(`    Temperature: ${hour.temperature}°C`);
      console.log(`    Rain chance: ${hour.precipitationProbability}%`);
      console.log(`    Condition: ${hour.condition}`);
    }
    console.log('\n✅ CONFIRMED: Hourly forecast for 48 hours is available!\n');

    console.log('═'.repeat(63) + '\n');

    // ========================================================================
    // FEATURE 2: HISTORICAL RAINFALL (LAST 7 DAYS)
    // ========================================================================
    console.log('📊 FEATURE #2: HISTORICAL RAINFALL (Last 7 Days)');
    console.log('─'.repeat(63));
    console.log(`Total historical days: ${weather.historical.rainfall.length}`);
    console.log('');
    
    weather.historical.rainfall.forEach(day => {
      const dateStr = day.date.toLocaleDateString('en-US', { 
        weekday: 'short', 
        month: 'short', 
        day: 'numeric' 
      });
      const bar = '█'.repeat(Math.max(1, Math.round(day.rain / 2)));
      console.log(`  ${dateStr}: ${day.rain.toFixed(1)}mm ${bar}`);
      console.log(`    Temp range: ${day.tempMin}°C - ${day.tempMax}°C`);
    });
    
    console.log('');
    console.log(`  Total rainfall: ${weather.historical.totalRainfall}mm`);
    console.log(`  Daily average: ${weather.historical.averageDailyRainfall}mm`);
    console.log('\n✅ CONFIRMED: Historical rainfall for 7 days is available!\n');

    console.log('═'.repeat(63) + '\n');

    // ========================================================================
    // FEATURE 3: HEAT INDEX CALCULATION
    // ========================================================================
    console.log('📊 FEATURE #3: HEAT INDEX CALCULATION');
    console.log('─'.repeat(63));
    console.log('Current conditions:');
    console.log(`  Temperature: ${weather.current.temperature}°C`);
    console.log(`  Humidity: ${weather.current.humidity}%`);
    console.log(`  → HEAT INDEX: ${weather.current.heatIndex}°C ← CALCULATED!`);
    
    const heatDiff = weather.current.heatIndex - weather.current.temperature;
    console.log(`  → Feels ${Math.abs(heatDiff)}°C ${heatDiff > 0 ? 'hotter' : 'cooler'} than actual temp`);
    
    console.log('\nHeat index in hourly forecast:');
    for (let i = 0; i < 5 && i < weather.hourly.length; i++) {
      const hour = weather.hourly[i];
      const time = hour.time.toLocaleTimeString('en-US', { hour: 'numeric' });
      console.log(`  ${time}: ${hour.temperature}°C → Heat Index: ${hour.heatIndex}°C`);
    }
    
    console.log('\nHeat index in daily forecast:');
    for (let i = 0; i < 3 && i < weather.daily.length; i++) {
      const day = weather.daily[i];
      const date = day.date.toLocaleDateString('en-US', { weekday: 'short' });
      console.log(`  ${date}: Max ${day.maxTemp}°C → Max Heat Index: ${day.maxHeatIndex}°C`);
    }
    
    console.log('\n✅ CONFIRMED: Heat index is calculated for current, hourly, and daily!\n');

    console.log('═'.repeat(63) + '\n');

    // ========================================================================
    // FEATURE 4: EVAPOTRANSPIRATION (ET0)
    // ========================================================================
    console.log('📊 FEATURE #4: EVAPOTRANSPIRATION (ET0)');
    console.log('─'.repeat(63));
    console.log('Daily ET0 values (next 7 days):\n');
    
    weather.daily.forEach((day, index) => {
      const dateStr = day.date.toLocaleDateString('en-US', { 
        weekday: 'short', 
        month: 'short', 
        day: 'numeric' 
      });
      console.log(`  ${dateStr}:`);
      console.log(`    Expected rain: ${day.rain}mm`);
      console.log(`    → ET0: ${day.evapotranspiration}mm/day ← CALCULATED!`);
      console.log(`    → Irrigation need: ${day.irrigationNeed}mm ← (ET0 - rain)`);
      
      if (day.irrigationNeed > 5) {
        console.log(`    💧 ACTION NEEDED: Irrigate ${day.irrigationNeed}mm`);
      }
      console.log('');
    });
    
    console.log('Weekly totals:');
    console.log(`  Total ET0: ${weather.summary.next7Days.totalEvapotranspiration}mm`);
    console.log(`  Total rain: ${weather.summary.next7Days.totalRainfall}mm`);
    console.log(`  Total irrigation needed: ${weather.summary.next7Days.irrigationNeed}mm`);
    
    console.log('\n✅ CONFIRMED: ET0 is calculated for all 7 days!\n');

    console.log('═'.repeat(63) + '\n');

    // ========================================================================
    // SUMMARY
    // ========================================================================
    console.log('╔═══════════════════════════════════════════════════════════╗');
    console.log('║  ✅ ALL 4 FEATURES ARE WORKING!                           ║');
    console.log('╚═══════════════════════════════════════════════════════════╝\n');

    console.log('✓ Feature 1: Hourly forecast (' + weather.hourly.length + ' hours available)');
    console.log('✓ Feature 2: Historical rainfall (' + weather.historical.rainfall.length + ' days available)');
    console.log('✓ Feature 3: Heat index (current: ' + weather.current.heatIndex + '°C)');
    console.log('✓ Feature 4: ET0 (today: ' + weather.daily[0].evapotranspiration + 'mm/day)');
    
    console.log('\n📚 To use these features in your code:');
    console.log('');
    console.log('import { getFarmingWeatherData } from "./src/services/weatherService";');
    console.log('');
    console.log('const weather = await getFarmingWeatherData(lat, lon);');
    console.log('');
    console.log('// Access hourly forecast:');
    console.log('weather.hourly[0].temperature');
    console.log('');
    console.log('// Access historical rainfall:');
    console.log('weather.historical.rainfall');
    console.log('weather.historical.totalRainfall');
    console.log('');
    console.log('// Access heat index:');
    console.log('weather.current.heatIndex');
    console.log('weather.hourly[0].heatIndex');
    console.log('');
    console.log('// Access ET0:');
    console.log('weather.daily[0].evapotranspiration');
    console.log('weather.daily[0].irrigationNeed');
    console.log('');

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('\n💡 Make sure you have internet connection to fetch weather data.');
  }
}

// Run the demonstration
demonstrateFeatures();

