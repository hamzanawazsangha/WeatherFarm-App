/**
 * Farming Weather Intelligence - Practical Examples
 * 
 * This file demonstrates how to use the upgraded weather service
 * for various farming scenarios.
 */

import { getFarmingWeatherData } from '../src/services/weatherService';

// ============================================================================
// EXAMPLE 1: Complete Farming Dashboard Data
// ============================================================================

async function getFarmingDashboardData(latitude, longitude) {
  console.log('🌾 Fetching Farming Intelligence Dashboard...\n');
  
  const data = await getFarmingWeatherData(latitude, longitude);
  
  // Current Conditions
  console.log('📍 CURRENT CONDITIONS');
  console.log('─────────────────────');
  console.log(`Temperature: ${data.current.temperature}°C`);
  console.log(`Feels Like: ${data.current.feelsLike}°C`);
  console.log(`Heat Index: ${data.current.heatIndex}°C ${getHeatWarning(data.current.heatIndex)}`);
  console.log(`Humidity: ${data.current.humidity}%`);
  console.log(`Wind: ${data.current.windSpeed} km/h`);
  console.log(`Condition: ${data.current.condition}`);
  console.log(`UV Index: ${data.current.uvIndex} ${getUVWarning(data.current.uvIndex)}`);
  console.log('');
  
  // Historical Analysis
  console.log('📊 HISTORICAL RAINFALL (Last 7 Days)');
  console.log('─────────────────────────────────────');
  console.log(`Total: ${data.historical.totalRainfall} mm`);
  console.log(`Average: ${data.historical.averageDailyRainfall} mm/day`);
  console.log(`Status: ${getRainfallStatus(data.historical.totalRainfall)}`);
  console.log('');
  
  // Weekly Forecast Summary
  console.log('📅 7-DAY FORECAST SUMMARY');
  console.log('─────────────────────────');
  console.log(`Expected Rainfall: ${data.summary.next7Days.totalRainfall} mm`);
  console.log(`Water Loss (ET0): ${data.summary.next7Days.totalEvapotranspiration} mm`);
  console.log(`Irrigation Needed: ${data.summary.next7Days.irrigationNeed} mm`);
  console.log('');
  
  // Daily Breakdown
  console.log('📆 DAILY FORECAST');
  console.log('─────────────────');
  data.daily.forEach((day, index) => {
    const date = day.date.toLocaleDateString('en-US', { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric' 
    });
    console.log(`${date}: ${day.minTemp}-${day.maxTemp}°C, ${day.condition}`);
    console.log(`  Rain: ${day.rain}mm (${day.precipitationProbability}%), ET0: ${day.evapotranspiration}mm`);
    console.log(`  💧 Irrigation: ${day.irrigationNeed > 0 ? day.irrigationNeed + 'mm needed' : 'Not needed'}`);
  });
  
  return data;
}

// ============================================================================
// EXAMPLE 2: Smart Irrigation Scheduler
// ============================================================================

async function createIrrigationSchedule(latitude, longitude, cropWaterNeedFactor = 1.0) {
  console.log('\n💧 SMART IRRIGATION SCHEDULE\n');
  
  const data = await getFarmingWeatherData(latitude, longitude);
  const schedule = [];
  
  data.daily.forEach((day, index) => {
    const cropWaterNeed = day.evapotranspiration * cropWaterNeedFactor;
    const effectiveRain = Math.min(day.rain, cropWaterNeed); // Excess rain doesn't help
    const irrigationRequired = Math.max(0, cropWaterNeed - effectiveRain);
    
    const recommendation = {
      date: day.date,
      dayName: day.dayName,
      weather: day.condition,
      rainExpected: day.rain,
      rainProbability: day.precipitationProbability,
      evapotranspiration: day.evapotranspiration,
      cropWaterNeed: Math.round(cropWaterNeed * 10) / 10,
      irrigationAmount: Math.round(irrigationRequired * 10) / 10,
      shouldIrrigate: irrigationRequired > 3, // Only irrigate if need > 3mm
      confidence: day.precipitationProbability > 70 ? 'high' : 'medium'
    };
    
    schedule.push(recommendation);
    
    // Print recommendation
    const dateStr = day.date.toLocaleDateString('en-US', { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric' 
    });
    
    console.log(`${dateStr} (${day.condition})`);
    console.log(`  Rain forecast: ${day.rain}mm (${day.precipitationProbability}% chance)`);
    console.log(`  Crop water need: ${recommendation.cropWaterNeed}mm`);
    
    if (recommendation.shouldIrrigate) {
      console.log(`  ✅ IRRIGATE: ${recommendation.irrigationAmount}mm`);
    } else if (day.precipitationProbability > 70) {
      console.log(`  ⛈️  SKIP: Rain expected`);
    } else {
      console.log(`  ✅ ADEQUATE: No irrigation needed`);
    }
    console.log('');
  });
  
  // Weekly summary
  const totalIrrigation = schedule.reduce((sum, day) => 
    sum + (day.shouldIrrigate ? day.irrigationAmount : 0), 0
  );
  
  console.log('📊 WEEKLY SUMMARY');
  console.log(`Total irrigation required: ${Math.round(totalIrrigation * 10) / 10}mm`);
  console.log(`Days to irrigate: ${schedule.filter(d => d.shouldIrrigate).length}`);
  
  return schedule;
}

// ============================================================================
// EXAMPLE 3: Heat Stress Monitor for Livestock
// ============================================================================

async function monitorHeatStress(latitude, longitude) {
  console.log('\n🌡️  HEAT STRESS MONITORING (Next 24 Hours)\n');
  
  const data = await getFarmingWeatherData(latitude, longitude);
  const alerts = [];
  
  // Check next 24 hours
  for (let i = 0; i < 24 && i < data.hourly.length; i++) {
    const hour = data.hourly[i];
    const time = hour.time.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit' 
    });
    
    const heatStressLevel = getHeatStressLevel(hour.heatIndex);
    
    if (heatStressLevel !== 'safe') {
      alerts.push({
        time: hour.time,
        temperature: hour.temperature,
        heatIndex: hour.heatIndex,
        humidity: hour.humidity,
        level: heatStressLevel
      });
      
      const emoji = heatStressLevel === 'extreme' ? '🔴' : 
                    heatStressLevel === 'high' ? '🟠' : '🟡';
      
      console.log(`${emoji} ${time}: Heat Index ${hour.heatIndex}°C (${heatStressLevel.toUpperCase()})`);
      console.log(`   Temp: ${hour.temperature}°C, Humidity: ${hour.humidity}%`);
      console.log(`   ${getHeatStressAdvice(heatStressLevel)}`);
      console.log('');
    }
  }
  
  if (alerts.length === 0) {
    console.log('✅ No heat stress alerts for the next 24 hours');
  } else {
    console.log(`⚠️  ${alerts.length} heat stress periods detected`);
  }
  
  return alerts;
}

// ============================================================================
// EXAMPLE 4: Field Work Planner
// ============================================================================

async function planFieldWork(latitude, longitude, taskDuration = 4) {
  console.log(`\n🚜 FIELD WORK PLANNER (${taskDuration}-hour task)\n`);
  
  const data = await getFarmingWeatherData(latitude, longitude);
  const workWindows = [];
  
  // Analyze next 48 hours
  for (let i = 0; i < 48 && i < data.hourly.length; i++) {
    const hour = data.hourly[i];
    
    // Criteria for good working conditions
    const conditions = {
      daylight: hour.isDay,
      noRain: hour.precipitationProbability < 30,
      safeHeat: hour.heatIndex < 35,
      lowWind: hour.windSpeed < 25,
      dryEnough: hour.soilMoisture === null || hour.soilMoisture < 0.35
    };
    
    const isSuitable = Object.values(conditions).every(c => c);
    
    if (isSuitable) {
      workWindows.push({
        time: hour.time,
        hour: hour.hour,
        temperature: hour.temperature,
        heatIndex: hour.heatIndex,
        conditions: { ...conditions }
      });
    }
  }
  
  // Find continuous work windows
  const continuousWindows = findContinuousWindows(workWindows, taskDuration);
  
  if (continuousWindows.length > 0) {
    console.log(`✅ Found ${continuousWindows.length} suitable ${taskDuration}-hour windows:\n`);
    
    continuousWindows.forEach((window, index) => {
      const startTime = window.start.toLocaleString('en-US', { 
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit'
      });
      const endTime = window.end.toLocaleTimeString('en-US', { 
        hour: 'numeric',
        minute: '2-digit'
      });
      
      console.log(`${index + 1}. ${startTime} - ${endTime}`);
      console.log(`   Avg temp: ${window.avgTemp}°C, Heat index: ${window.avgHeatIndex}°C`);
      console.log('');
    });
  } else {
    console.log(`❌ No suitable ${taskDuration}-hour windows found in next 48 hours`);
    console.log(`   Available 1-hour slots: ${workWindows.length}`);
  }
  
  return continuousWindows;
}

// ============================================================================
// EXAMPLE 5: Rainfall Trend Analysis
// ============================================================================

async function analyzeRainfallTrends(latitude, longitude) {
  console.log('\n📈 RAINFALL TREND ANALYSIS\n');
  
  const data = await getFarmingWeatherData(latitude, longitude);
  
  // Historical analysis
  console.log('HISTORICAL (Last 7 Days):');
  console.log('─────────────────────────');
  
  data.historical.rainfall.forEach(day => {
    const dateStr = day.date.toLocaleDateString('en-US', { 
      weekday: 'short',
      month: 'short', 
      day: 'numeric' 
    });
    const bar = '█'.repeat(Math.round(day.rain / 2));
    console.log(`${dateStr}: ${day.rain.toFixed(1)}mm ${bar}`);
  });
  
  console.log(`\nTotal: ${data.historical.totalRainfall}mm`);
  console.log(`Average: ${data.historical.averageDailyRainfall}mm/day`);
  
  // Forecast analysis
  console.log('\n\nFORECAST (Next 7 Days):');
  console.log('───────────────────────');
  
  data.daily.forEach(day => {
    const dateStr = day.date.toLocaleDateString('en-US', { 
      weekday: 'short',
      month: 'short', 
      day: 'numeric' 
    });
    const bar = '█'.repeat(Math.round(day.rain / 2));
    console.log(`${dateStr}: ${day.rain.toFixed(1)}mm (${day.precipitationProbability}%) ${bar}`);
  });
  
  console.log(`\nExpected total: ${data.summary.next7Days.totalRainfall}mm`);
  
  // Trend analysis
  const historicalAvg = data.historical.averageDailyRainfall;
  const forecastAvg = data.summary.next7Days.totalRainfall / 7;
  
  console.log('\n\nTREND ANALYSIS:');
  console.log('───────────────');
  
  if (forecastAvg > historicalAvg * 1.5) {
    console.log('📈 INCREASING: Expect wetter conditions');
    console.log('   Recommendation: Prepare drainage, delay planting');
  } else if (forecastAvg < historicalAvg * 0.5) {
    console.log('📉 DECREASING: Expect drier conditions');
    console.log('   Recommendation: Increase irrigation, mulch soil');
  } else {
    console.log('➡️  STABLE: Conditions remain similar');
    console.log('   Recommendation: Continue current practices');
  }
  
  return {
    historical: data.historical,
    forecast: data.summary.next7Days,
    trend: forecastAvg > historicalAvg * 1.5 ? 'increasing' : 
           forecastAvg < historicalAvg * 0.5 ? 'decreasing' : 'stable'
  };
}

// ============================================================================
// Helper Functions
// ============================================================================

function getHeatWarning(heatIndex) {
  if (heatIndex >= 40) return '🔴 EXTREME DANGER';
  if (heatIndex >= 32) return '🟠 HIGH RISK';
  if (heatIndex >= 27) return '🟡 CAUTION';
  return '✅';
}

function getUVWarning(uvIndex) {
  if (uvIndex >= 11) return '🔴 EXTREME';
  if (uvIndex >= 8) return '🟠 VERY HIGH';
  if (uvIndex >= 6) return '🟡 HIGH';
  if (uvIndex >= 3) return '🟢 MODERATE';
  return '✅ LOW';
}

function getRainfallStatus(totalRainfall) {
  if (totalRainfall < 10) return '🟤 DRY - Increase irrigation';
  if (totalRainfall > 50) return '💧 WET - Monitor drainage';
  return '✅ NORMAL';
}

function getHeatStressLevel(heatIndex) {
  if (heatIndex >= 40) return 'extreme';
  if (heatIndex >= 32) return 'high';
  if (heatIndex >= 27) return 'moderate';
  return 'safe';
}

function getHeatStressAdvice(level) {
  const advice = {
    extreme: 'URGENT: Provide shade, water, cooling. Avoid all strenuous activity.',
    high: 'Provide shade and water. Limit outdoor work. Monitor livestock closely.',
    moderate: 'Ensure adequate water and ventilation. Take regular breaks.',
    safe: 'Normal conditions.'
  };
  return advice[level] || advice.safe;
}

function findContinuousWindows(workWindows, duration) {
  const windows = [];
  
  for (let i = 0; i <= workWindows.length - duration; i++) {
    const start = workWindows[i];
    const end = workWindows[i + duration - 1];
    
    // Check if hours are continuous
    const hourDiff = (end.time - start.time) / (1000 * 60 * 60);
    
    if (hourDiff === duration - 1) {
      const temps = workWindows.slice(i, i + duration).map(w => w.temperature);
      const heatIndices = workWindows.slice(i, i + duration).map(w => w.heatIndex);
      
      windows.push({
        start: start.time,
        end: end.time,
        avgTemp: Math.round(temps.reduce((a, b) => a + b) / temps.length),
        avgHeatIndex: Math.round(heatIndices.reduce((a, b) => a + b) / heatIndices.length)
      });
    }
  }
  
  return windows;
}

// ============================================================================
// Main Demo Function
// ============================================================================

async function runAllExamples() {
  // Example coordinates (adjust to your location)
  const latitude = 40.7128;  // New York City
  const longitude = -74.0060;
  
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║   FARMING WEATHER INTELLIGENCE - COMPREHENSIVE DEMO       ║');
  console.log('╚════════════════════════════════════════════════════════════╝\n');
  
  try {
    // Example 1: Dashboard
    await getFarmingDashboardData(latitude, longitude);
    
    console.log('\n' + '═'.repeat(60) + '\n');
    
    // Example 2: Irrigation
    await createIrrigationSchedule(latitude, longitude, 1.0);
    
    console.log('\n' + '═'.repeat(60) + '\n');
    
    // Example 3: Heat Stress
    await monitorHeatStress(latitude, longitude);
    
    console.log('\n' + '═'.repeat(60) + '\n');
    
    // Example 4: Field Work
    await planFieldWork(latitude, longitude, 4);
    
    console.log('\n' + '═'.repeat(60) + '\n');
    
    // Example 5: Rainfall Trends
    await analyzeRainfallTrends(latitude, longitude);
    
    console.log('\n╔════════════════════════════════════════════════════════════╗');
    console.log('║   DEMO COMPLETE - All examples executed successfully!     ║');
    console.log('╚════════════════════════════════════════════════════════════╝\n');
    
  } catch (error) {
    console.error('❌ Error running examples:', error);
  }
}

// Export functions for use in other modules
export {
  getFarmingDashboardData,
  createIrrigationSchedule,
  monitorHeatStress,
  planFieldWork,
  analyzeRainfallTrends,
  runAllExamples
};

// Run demo if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runAllExamples();
}

