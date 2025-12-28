/**
 * Smart Crop Calendar - Practical Examples
 * Demonstrates how to use the crop calendar service
 */

import {
  CROP_DATABASE,
  getCurrentStage,
  getNextActions,
  getCropTimeline,
  getSowingWindow,
  getAvailableCrops
} from '../src/services/cropCalendarService';
import { getFarmingWeatherData } from '../src/services/weatherService';

// Example coordinates (Lahore, Pakistan)
const LAHORE_LAT = 31.5204;
const LAHORE_LON = 74.3587;

/**
 * Example 1: Check Current Crop Stage
 */
export async function checkCropStage() {
  console.log('📊 Checking Current Crop Stage...\n');
  
  // Assume wheat was planted 45 days ago
  const plantDate = new Date();
  plantDate.setDate(plantDate.getDate() - 45);
  const plantDateStr = plantDate.toISOString().split('T')[0];
  
  const stageInfo = getCurrentStage('wheat', plantDateStr);
  
  console.log('Crop: Wheat 🌾');
  console.log(`Planted: ${plantDate.toLocaleDateString()}`);
  console.log(`Current Stage: ${stageInfo.stage.name} ${stageInfo.stage.icon}`);
  console.log(`Description: ${stageInfo.stage.description}`);
  console.log(`Progress: ${Math.round(stageInfo.progress)}%`);
  console.log(`Days in Stage: ${stageInfo.daysIntoStage} of ${stageInfo.stage.duration}`);
  console.log(`Days Remaining: ${stageInfo.daysRemaining}`);
  console.log(`Status: ${stageInfo.status}\n`);
  
  return stageInfo;
}

/**
 * Example 2: Get Smart Recommendations with Weather
 */
export async function getSmartRecommendations() {
  console.log('💡 Getting Smart Recommendations...\n');
  
  // Get current weather
  const weatherData = await getFarmingWeatherData(LAHORE_LAT, LAHORE_LON);
  
  // Wheat planted 30 days ago
  const plantDate = new Date();
  plantDate.setDate(plantDate.getDate() - 30);
  const plantDateStr = plantDate.toISOString().split('T')[0];
  
  const actions = getNextActions('wheat', plantDateStr, weatherData);
  
  console.log('🌾 Wheat - Day 30 Actions:\n');
  console.log('Current Weather:');
  console.log(`  Temperature: ${weatherData.current.temperature}°C`);
  console.log(`  Wind: ${weatherData.current.windSpeed} km/h`);
  console.log(`  Rain Probability: ${weatherData.daily[0].precipitationProbability}%\n`);
  
  console.log('Recommended Actions:');
  actions.forEach((action, index) => {
    console.log(`\n${index + 1}. ${action.type.toUpperCase()}`);
    console.log(`   ${action.description}`);
    console.log(`   Priority: ${action.priority}`);
    console.log(`   Urgency: ${action.urgency}`);
    console.log(`   Days Until: ${action.daysUntilAction <= 0 ? 'DUE NOW' : action.daysUntilAction + ' days'}`);
    
    if (action.weatherSuitable) {
      const icon = action.weatherSuitable.suitable ? '✅' : '⚠️';
      console.log(`   Weather: ${icon} ${action.weatherSuitable.reason}`);
    }
  });
  
  return actions;
}

/**
 * Example 3: Generate Complete Crop Timeline
 */
export function generateCropTimeline() {
  console.log('\n📅 Generating Crop Timeline...\n');
  
  // Plan for wheat planting today
  const plantDate = new Date();
  const plantDateStr = plantDate.toISOString().split('T')[0];
  
  const timeline = getCropTimeline('wheat', plantDateStr);
  
  console.log(`Crop: ${timeline.crop.name} ${timeline.crop.icon}`);
  console.log(`Category: ${timeline.crop.category}`);
  console.log(`Total Duration: ${timeline.totalDuration} days`);
  console.log(`Planting Date: ${timeline.plantingDate.toLocaleDateString()}`);
  console.log(`Expected Harvest: ${timeline.expectedHarvest.toLocaleDateString()}\n`);
  
  console.log('Growth Stages Timeline:');
  console.log('═'.repeat(70));
  
  timeline.timeline.forEach((stage, index) => {
    console.log(`\n${index + 1}. ${stage.name} ${stage.icon}`);
    console.log(`   Duration: ${stage.duration} days`);
    console.log(`   Start: ${stage.startDate.toLocaleDateString()}`);
    console.log(`   End: ${stage.endDate.toLocaleDateString()}`);
    console.log(`   Description: ${stage.description}`);
    
    if (stage.actions.length > 0) {
      console.log(`   Actions (${stage.actions.length}):`);
      stage.actions.forEach((action, aIdx) => {
        console.log(`      ${aIdx + 1}. [${action.priority}] ${action.description}`);
      });
    }
  });
  
  return timeline;
}

/**
 * Example 4: Check Sowing Windows for All Crops
 */
export function checkSowingWindows() {
  console.log('\n🌱 Checking Sowing Windows...\n');
  
  const currentDate = new Date();
  const currentMonth = currentDate.toLocaleString('en-US', { month: 'long' });
  
  console.log(`Current Month: ${currentMonth}\n`);
  console.log('═'.repeat(70));
  
  const crops = getAvailableCrops();
  
  crops.forEach(crop => {
    const window = getSowingWindow(crop.id, currentDate);
    
    console.log(`\n${crop.icon} ${crop.name}`);
    console.log(`   Category: ${crop.category}`);
    console.log(`   Duration: ${crop.duration} days`);
    console.log(`   Optimal Months: ${window.optimalMonths.map(m => m.charAt(0).toUpperCase() + m.slice(1)).join(', ')}`);
    console.log(`   Water Need: ${window.waterNeed}`);
    console.log(`   Optimal Temperature: ${window.optimalTemp.min}°C - ${window.optimalTemp.max}°C`);
    
    if (window.isOptimalNow) {
      console.log(`   ✅ ${window.recommendation}`);
    } else {
      console.log(`   ⏳ ${window.recommendation}`);
    }
  });
}

/**
 * Example 5: Multi-Crop Farm Management
 */
export async function manageFarmWithMultipleCrops() {
  console.log('\n🚜 Managing Farm with Multiple Crops...\n');
  
  // Simulate a farm with 3 active crops
  const activeCrops = [
    { cropId: 'wheat', plantingDate: '2024-11-01', field: 'Field A' },
    { cropId: 'rice', plantingDate: '2024-06-15', field: 'Field B' },
    { cropId: 'corn', plantingDate: '2024-07-20', field: 'Field C' }
  ];
  
  const weatherData = await getFarmingWeatherData(LAHORE_LAT, LAHORE_LON);
  
  console.log('Farm Overview:');
  console.log('═'.repeat(70));
  
  const allActions = [];
  
  for (const crop of activeCrops) {
    const cropData = CROP_DATABASE[crop.cropId];
    const stageInfo = getCurrentStage(crop.cropId, crop.plantingDate);
    const actions = getNextActions(crop.cropId, crop.plantingDate, weatherData);
    const urgentActions = actions.filter(a => a.urgency === 'now' || a.urgency === 'soon');
    
    console.log(`\n${cropData.icon} ${cropData.name} - ${crop.field}`);
    console.log(`   Planted: ${new Date(crop.plantingDate).toLocaleDateString()}`);
    
    if (stageInfo.stage) {
      console.log(`   Current Stage: ${stageInfo.stage.name} (${Math.round(stageInfo.progress)}%)`);
      console.log(`   Days Remaining in Stage: ${stageInfo.daysRemaining}`);
    }
    
    console.log(`   Urgent Actions: ${urgentActions.length}`);
    
    if (urgentActions.length > 0) {
      urgentActions.forEach(action => {
        allActions.push({
          crop: cropData.name,
          field: crop.field,
          ...action
        });
      });
    }
  }
  
  // Summary of all urgent actions
  console.log('\n\n📋 Today\'s Priority Actions:');
  console.log('═'.repeat(70));
  
  if (allActions.length === 0) {
    console.log('✅ No urgent actions today. All crops are on schedule!');
  } else {
    // Sort by urgency and priority
    allActions.sort((a, b) => {
      const urgencyOrder = { now: 0, soon: 1, upcoming: 2 };
      const priorityOrder = { high: 0, medium: 1, low: 2 };
      
      if (urgencyOrder[a.urgency] !== urgencyOrder[b.urgency]) {
        return urgencyOrder[a.urgency] - urgencyOrder[b.urgency];
      }
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    });
    
    allActions.forEach((action, index) => {
      const urgencyIcon = action.urgency === 'now' ? '🔴' : '🟠';
      console.log(`\n${index + 1}. ${urgencyIcon} [${action.urgency.toUpperCase()}] ${action.crop} - ${action.field}`);
      console.log(`   ${action.description}`);
      console.log(`   Priority: ${action.priority}`);
      if (action.weatherSuitable) {
        const icon = action.weatherSuitable.suitable ? '✅' : '⚠️';
        console.log(`   ${icon} ${action.weatherSuitable.reason}`);
      }
    });
  }
  
  return { activeCrops, allActions };
}

/**
 * Example 6: Generate Weekly Action Plan
 */
export async function generateWeeklyPlan() {
  console.log('\n📆 Generating Weekly Action Plan...\n');
  
  const plantDate = new Date();
  plantDate.setDate(plantDate.getDate() - 50);
  const plantDateStr = plantDate.toISOString().split('T')[0];
  
  const weatherData = await getFarmingWeatherData(LAHORE_LAT, LAHORE_LON);
  const actions = getNextActions('wheat', plantDateStr, weatherData);
  
  // Group actions by day
  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() + i);
    return {
      date,
      dayName: date.toLocaleDateString('en-US', { weekday: 'long' }),
      actions: []
    };
  });
  
  // Assign actions to days
  actions.forEach(action => {
    if (action.daysUntilAction >= 0 && action.daysUntilAction < 7) {
      weekDays[action.daysUntilAction].actions.push(action);
    }
  });
  
  console.log('🌾 Wheat - Weekly Action Plan');
  console.log('═'.repeat(70));
  
  weekDays.forEach(day => {
    console.log(`\n${day.dayName} - ${day.date.toLocaleDateString()}`);
    
    if (day.actions.length === 0) {
      console.log('   ✅ No scheduled actions');
    } else {
      day.actions.forEach((action, index) => {
        const urgencyIcon = action.urgency === 'now' ? '🔴' : 
                          action.urgency === 'soon' ? '🟠' : '🔵';
        console.log(`\n   ${index + 1}. ${urgencyIcon} ${action.type.toUpperCase()}`);
        console.log(`      ${action.description}`);
        console.log(`      Priority: ${action.priority}`);
        if (action.weatherSuitable && !action.weatherSuitable.suitable) {
          console.log(`      ⚠️ Weather: ${action.weatherSuitable.reason}`);
        }
      });
    }
  });
  
  return weekDays;
}

/**
 * Example 7: Harvest Date Prediction
 */
export function predictHarvestDates() {
  console.log('\n🚜 Harvest Date Predictions...\n');
  
  const today = new Date();
  const crops = getAvailableCrops();
  
  console.log('If planted today:');
  console.log('═'.repeat(70));
  
  crops.forEach(crop => {
    const timeline = getCropTimeline(crop.id, today.toISOString().split('T')[0]);
    const daysUntilHarvest = timeline.totalDuration;
    const harvestDate = timeline.expectedHarvest;
    const harvestMonth = harvestDate.toLocaleString('en-US', { month: 'long' });
    
    console.log(`\n${crop.icon} ${crop.name}`);
    console.log(`   Growth Duration: ${daysUntilHarvest} days`);
    console.log(`   Expected Harvest: ${harvestDate.toLocaleDateString()}`);
    console.log(`   Harvest Month: ${harvestMonth}`);
    
    // Check if sowing time is optimal
    const window = getSowingWindow(crop.id, today);
    if (!window.isOptimalNow) {
      console.log(`   ⚠️ Note: ${window.recommendation}`);
    }
  });
}

/**
 * Example 8: Weather-Crop Compatibility Check
 */
export async function checkWeatherCompatibility() {
  console.log('\n🌡️ Weather-Crop Compatibility Check...\n');
  
  const weatherData = await getFarmingWeatherData(LAHORE_LAT, LAHORE_LON);
  const crops = getAvailableCrops();
  
  console.log('Current Weather:');
  console.log(`  Temperature: ${weatherData.current.temperature}°C`);
  console.log(`  Humidity: ${weatherData.current.humidity}%`);
  console.log(`  Wind Speed: ${weatherData.current.windSpeed} km/h`);
  console.log(`  Condition: ${weatherData.current.condition}\n`);
  
  console.log('Crop Compatibility:');
  console.log('═'.repeat(70));
  
  crops.forEach(crop => {
    const cropData = CROP_DATABASE[crop.id];
    const currentTemp = weatherData.current.temperature;
    const optimalTemp = cropData.optimalTemp;
    
    const isCompatible = currentTemp >= optimalTemp.min && currentTemp <= optimalTemp.max;
    
    console.log(`\n${crop.icon} ${crop.name}`);
    console.log(`   Optimal Temperature: ${optimalTemp.min}°C - ${optimalTemp.max}°C`);
    console.log(`   Current: ${currentTemp}°C`);
    
    if (isCompatible) {
      console.log(`   ✅ Weather is suitable for ${crop.name}`);
    } else if (currentTemp < optimalTemp.min) {
      console.log(`   ❄️ Too cold (need ${optimalTemp.min - currentTemp}°C warmer)`);
    } else {
      console.log(`   🔥 Too hot (need ${currentTemp - optimalTemp.max}°C cooler)`);
    }
    
    console.log(`   Water Requirement: ${cropData.waterNeed}`);
  });
}

/**
 * Run all examples
 */
export async function runAllExamples() {
  console.log('🌾 Running All Crop Calendar Examples');
  console.log('═'.repeat(70));
  
  try {
    await checkCropStage();
    console.log('\n' + '═'.repeat(70));
    
    await getSmartRecommendations();
    console.log('\n' + '═'.repeat(70));
    
    generateCropTimeline();
    console.log('\n' + '═'.repeat(70));
    
    checkSowingWindows();
    console.log('\n' + '═'.repeat(70));
    
    await manageFarmWithMultipleCrops();
    console.log('\n' + '═'.repeat(70));
    
    await generateWeeklyPlan();
    console.log('\n' + '═'.repeat(70));
    
    predictHarvestDates();
    console.log('\n' + '═'.repeat(70));
    
    await checkWeatherCompatibility();
    console.log('\n' + '═'.repeat(70));
    
    console.log('\n✅ All examples completed successfully!');
  } catch (error) {
    console.error('❌ Error running examples:', error.message);
  }
}

// Export all examples
export default {
  checkCropStage,
  getSmartRecommendations,
  generateCropTimeline,
  checkSowingWindows,
  manageFarmWithMultipleCrops,
  generateWeeklyPlan,
  predictHarvestDates,
  checkWeatherCompatibility,
  runAllExamples
};

// Run if executed directly
if (typeof require !== 'undefined' && require.main === module) {
  runAllExamples();
}

