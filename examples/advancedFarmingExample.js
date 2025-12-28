/**
 * Advanced Farming Weather Intelligence Examples
 * Demonstrates how to use the upgraded weatherService.js
 */

import { getFarmingWeatherData } from '../src/services/weatherService';

// Example coordinates (Lahore, Pakistan)
const LAHORE_LAT = 31.5204;
const LAHORE_LON = 74.3587;

/**
 * Example 1: Complete Farming Dashboard Data
 */
export async function getDashboardData() {
  console.log('📊 Fetching complete farming dashboard data...\n');
  
  const data = await getFarmingWeatherData(LAHORE_LAT, LAHORE_LON, 'auto', 7);
  
  console.log('✅ Current Conditions:');
  console.log(`   Temperature: ${data.current.temperature}°C`);
  console.log(`   Heat Index: ${data.current.heatIndex}°C`);
  console.log(`   Humidity: ${data.current.humidity}%`);
  console.log(`   Wind: ${data.current.windSpeed} km/h`);
  console.log(`   Condition: ${data.current.condition}\n`);
  
  console.log('📅 7-Day Summary:');
  console.log(`   Total Expected Rain: ${data.summary.next7Days.totalRain}mm`);
  console.log(`   Total ET0: ${data.summary.next7Days.totalET0}mm`);
  console.log(`   Irrigation Need: ${data.summary.next7Days.irrigationNeed}mm`);
  console.log(`   Avg Temperature: ${data.summary.next7Days.avgTemperature}°C\n`);
  
  console.log('📜 Historical (7 days):');
  console.log(`   Total Rainfall: ${data.historical.totalRainfall}mm`);
  console.log(`   Daily Average: ${data.historical.averageDailyRainfall}mm`);
  console.log(`   Rainy Days: ${data.historical.rainyDays}\n`);
  
  return data;
}

/**
 * Example 2: Hourly Heat Stress Monitoring
 */
export async function monitorHeatStress() {
  console.log('🌡️ Monitoring Heat Stress (Next 12 Hours)...\n');
  
  const data = await getFarmingWeatherData(LAHORE_LAT, LAHORE_LON);
  const next12Hours = data.hourly.slice(0, 12);
  
  console.log('Time | Temp | Heat Index | Risk Level');
  console.log('-----|------|------------|------------');
  
  next12Hours.forEach(hour => {
    const time = hour.time.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
    
    let riskLevel = '✅ Safe';
    if (hour.heatIndex > 40) riskLevel = '🔴 Danger';
    else if (hour.heatIndex > 32) riskLevel = '🟠 Caution';
    else if (hour.heatIndex > 27) riskLevel = '🟡 Watch';
    
    console.log(`${time} | ${hour.temperature}°C | ${hour.heatIndex}°C | ${riskLevel}`);
  });
  
  // Find peak heat
  const peakHeat = next12Hours.reduce((max, hour) => 
    hour.heatIndex > max.heatIndex ? hour : max
  );
  
  console.log(`\n🔥 Peak Heat: ${peakHeat.heatIndex}°C at ${peakHeat.time.toLocaleTimeString()}`);
  
  return next12Hours;
}

/**
 * Example 3: Smart Irrigation Scheduler
 */
export async function createIrrigationSchedule() {
  console.log('💧 Creating 7-Day Irrigation Schedule...\n');
  
  const data = await getFarmingWeatherData(LAHORE_LAT, LAHORE_LON);
  
  console.log('Day       | Rain | ET0  | Need | Recommendation');
  console.log('----------|------|------|------|------------------');
  
  const schedule = data.daily.map(day => {
    const rainExpected = day.precipitationProbability > 50;
    const highRain = day.rain > 10;
    const waterNeed = day.irrigationNeed;
    
    let recommendation;
    if (rainExpected && highRain) {
      recommendation = '🌧️ Skip - Heavy rain expected';
    } else if (rainExpected) {
      recommendation = '⏸️ Wait - Rain possible';
    } else if (waterNeed > 5) {
      recommendation = `💧 Irrigate ${waterNeed.toFixed(1)}mm`;
    } else if (waterNeed > 2) {
      recommendation = `💦 Light irrigation ${waterNeed.toFixed(1)}mm`;
    } else {
      recommendation = '✅ No irrigation needed';
    }
    
    const dayName = day.dayName.padEnd(9);
    console.log(
      `${dayName} | ${day.rain.toFixed(1).padStart(4)}mm | ` +
      `${day.evapotranspiration.toFixed(1).padStart(4)}mm | ` +
      `${waterNeed.toFixed(1).padStart(4)}mm | ${recommendation}`
    );
    
    return { day: day.dayName, ...day, recommendation };
  });
  
  // Calculate total water needs
  const totalNeed = schedule.reduce((sum, day) => sum + day.irrigationNeed, 0);
  const irrigationDays = schedule.filter(day => day.irrigationNeed > 2).length;
  
  console.log(`\n📊 Weekly Summary:`);
  console.log(`   Total irrigation needed: ${totalNeed.toFixed(1)}mm`);
  console.log(`   Days requiring irrigation: ${irrigationDays}`);
  
  return schedule;
}

/**
 * Example 4: Rainfall Trend Analysis (30 days)
 */
export async function analyzeRainfallTrend() {
  console.log('📈 Analyzing 30-Day Rainfall Trend...\n');
  
  const data = await getFarmingWeatherData(LAHORE_LAT, LAHORE_LON, 'auto', 30);
  
  // Weekly breakdown
  const weeks = [];
  for (let i = 0; i < 4; i++) {
    const weekData = data.historical.rainfall.slice(i * 7, (i + 1) * 7);
    const weekRain = weekData.reduce((sum, day) => sum + day.rain, 0);
    const rainyDays = weekData.filter(day => day.rain > 1).length;
    weeks.push({ 
      week: i + 1, 
      rainfall: weekRain, 
      rainyDays,
      avgDaily: weekRain / 7
    });
  }
  
  console.log('Week | Total Rain | Rainy Days | Daily Avg');
  console.log('-----|------------|------------|----------');
  weeks.forEach(week => {
    console.log(
      `  ${week.week}  | ${week.rainfall.toFixed(1).padStart(8)}mm | ` +
      `${week.rainyDays.toString().padStart(10)} | ${week.avgDaily.toFixed(1)}mm`
    );
  });
  
  // Trend analysis
  const firstHalf = weeks.slice(0, 2).reduce((sum, w) => sum + w.rainfall, 0);
  const secondHalf = weeks.slice(2, 4).reduce((sum, w) => sum + w.rainfall, 0);
  const trend = secondHalf > firstHalf ? '📈 Increasing' : '📉 Decreasing';
  
  console.log(`\n📊 30-Day Statistics:`);
  console.log(`   Total Rainfall: ${data.historical.totalRainfall}mm`);
  console.log(`   Daily Average: ${data.historical.averageDailyRainfall}mm`);
  console.log(`   Rainy Days: ${data.historical.rainyDays} of 30`);
  console.log(`   Trend: ${trend}`);
  
  // Drought/flood warning
  if (data.historical.totalRainfall < 50) {
    console.log(`\n⚠️ DROUGHT WARNING: Only ${data.historical.totalRainfall}mm in 30 days`);
    console.log('   Recommended actions:');
    console.log('   - Increase irrigation frequency');
    console.log('   - Monitor soil moisture closely');
    console.log('   - Consider drought-resistant crops');
  } else if (data.historical.totalRainfall > 300) {
    console.log(`\n⚠️ FLOOD RISK: ${data.historical.totalRainfall}mm in 30 days`);
    console.log('   Recommended actions:');
    console.log('   - Ensure proper drainage');
    console.log('   - Reduce irrigation');
    console.log('   - Monitor for waterlogging');
  }
  
  return { weeks, total: data.historical.totalRainfall };
}

/**
 * Example 5: Crop Stress Detection
 */
export async function detectCropStress() {
  console.log('🌾 Detecting Crop Stress Conditions...\n');
  
  const data = await getFarmingWeatherData(LAHORE_LAT, LAHORE_LON);
  
  const stressFactors = [];
  
  // Heat stress
  const heatWaveDays = data.daily.filter(day => day.maxHeatIndex > 40).length;
  if (heatWaveDays >= 3) {
    stressFactors.push({
      type: '🔥 Heat Wave',
      severity: 'High',
      days: heatWaveDays,
      description: 'Extended period of extreme heat',
      actions: [
        'Increase irrigation frequency',
        'Apply mulch to reduce soil temperature',
        'Provide shade if possible',
        'Monitor for wilting'
      ]
    });
  }
  
  // Water stress
  const dryDays = data.historical.rainfall.filter(day => day.rain < 1).length;
  if (dryDays > 5 && data.summary.next7Days.totalRain < 10) {
    stressFactors.push({
      type: '💧 Water Stress',
      severity: 'Medium',
      days: dryDays,
      description: 'Prolonged dry period with low rainfall forecast',
      actions: [
        'Increase irrigation',
        'Check soil moisture levels',
        'Prioritize critical growth stages',
        'Consider drip irrigation'
      ]
    });
  }
  
  // Wind stress
  const windyDays = data.daily.filter(day => day.windSpeed > 30).length;
  if (windyDays >= 2) {
    stressFactors.push({
      type: '💨 Wind Stress',
      severity: 'Low',
      days: windyDays,
      description: 'Strong winds may damage crops',
      actions: [
        'Secure young plants',
        'Check for lodging',
        'Windbreaks may help',
        'Delay spraying operations'
      ]
    });
  }
  
  // Display results
  if (stressFactors.length === 0) {
    console.log('✅ No significant crop stress conditions detected\n');
    console.log('Current conditions are favorable for crop growth.');
  } else {
    console.log(`⚠️ ${stressFactors.length} Stress Factor(s) Detected:\n`);
    
    stressFactors.forEach((factor, index) => {
      console.log(`${index + 1}. ${factor.type} (${factor.severity} severity)`);
      console.log(`   ${factor.description}`);
      console.log(`   Duration: ${factor.days} days`);
      console.log(`   Recommended Actions:`);
      factor.actions.forEach(action => {
        console.log(`   - ${action}`);
      });
      console.log();
    });
  }
  
  return stressFactors;
}

/**
 * Example 6: Optimal Work Time Finder
 */
export async function findOptimalWorkTime() {
  console.log('⏰ Finding Optimal Farm Work Times (Next 48 hours)...\n');
  
  const data = await getFarmingWeatherData(LAHORE_LAT, LAHORE_LON);
  
  // Define optimal conditions
  const optimalHours = data.hourly.filter(hour => {
    return (
      hour.temperature >= 15 && hour.temperature <= 30 &&
      hour.heatIndex < 32 &&
      hour.precipitationProbability < 30 &&
      hour.windSpeed < 25 &&
      hour.uvIndex < 8
    );
  });
  
  console.log('✅ Optimal Work Times:');
  console.log('Date/Time          | Temp | Heat Index | Rain % | Wind | UV');
  console.log('-------------------|------|------------|--------|------|----');
  
  optimalHours.slice(0, 20).forEach(hour => {
    const dateTime = hour.time.toLocaleString('en-US', {
      month: 'short',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
    
    console.log(
      `${dateTime.padEnd(18)} | ${hour.temperature.toString().padStart(4)}°C | ` +
      `${hour.heatIndex.toString().padStart(10)}°C | ${hour.precipitationProbability.toString().padStart(5)}% | ` +
      `${hour.windSpeed.toString().padStart(4)} | ${hour.uvIndex.toString().padStart(2)}`
    );
  });
  
  console.log(`\n📊 Summary: ${optimalHours.length} optimal hours found in next 48 hours`);
  
  // Group by day
  const today = optimalHours.filter(h => h.time.getDate() === new Date().getDate());
  const tomorrow = optimalHours.filter(h => 
    h.time.getDate() === new Date(Date.now() + 86400000).getDate()
  );
  
  console.log(`   Today: ${today.length} hours`);
  console.log(`   Tomorrow: ${tomorrow.length} hours`);
  
  return optimalHours;
}

/**
 * Run all examples
 */
export async function runAllExamples() {
  console.log('🚀 Running All Advanced Farming Weather Examples\n');
  console.log('='.repeat(60));
  console.log('\n');
  
  try {
    await getDashboardData();
    console.log('\n' + '='.repeat(60) + '\n');
    
    await monitorHeatStress();
    console.log('\n' + '='.repeat(60) + '\n');
    
    await createIrrigationSchedule();
    console.log('\n' + '='.repeat(60) + '\n');
    
    await analyzeRainfallTrend();
    console.log('\n' + '='.repeat(60) + '\n');
    
    await detectCropStress();
    console.log('\n' + '='.repeat(60) + '\n');
    
    await findOptimalWorkTime();
    console.log('\n' + '='.repeat(60) + '\n');
    
    console.log('✅ All examples completed successfully!');
  } catch (error) {
    console.error('❌ Error running examples:', error.message);
  }
}

// Export individual examples
export default {
  getDashboardData,
  monitorHeatStress,
  createIrrigationSchedule,
  analyzeRainfallTrend,
  detectCropStress,
  findOptimalWorkTime,
  runAllExamples
};

// Run if executed directly
if (typeof require !== 'undefined' && require.main === module) {
  runAllExamples();
}

