/**
 * Soil Moisture & Irrigation Module - Usage Examples
 * 
 * This demonstrates how to use the soil moisture analysis
 * and irrigation recommendation system.
 */

import { getFarmingWeatherData } from '../src/services/weatherService.js';
import { analyzeSoilMoisture, getIrrigationSchedule } from '../src/services/soilMoistureService.js';

// Example coordinates (adjust to your location)
const EXAMPLE_LOCATION = {
  latitude: 40.7128,
  longitude: -74.0060,
  name: 'New York'
};

/**
 * Example 1: Get Current Irrigation Recommendation
 */
async function getCurrentRecommendation() {
  console.log('═'.repeat(60));
  console.log('EXAMPLE 1: Current Irrigation Recommendation');
  console.log('═'.repeat(60));
  console.log('');

  try {
    // Fetch weather data
    const weatherData = await getFarmingWeatherData(
      EXAMPLE_LOCATION.latitude,
      EXAMPLE_LOCATION.longitude
    );

    // Analyze soil moisture
    const soilAnalysis = analyzeSoilMoisture(weatherData);

    // Display results
    console.log('📍 Location:', EXAMPLE_LOCATION.name);
    console.log('');
    console.log('💧 Soil Moisture Analysis:');
    console.log('─'.repeat(60));
    console.log(`Level: ${soilAnalysis.moistureLevel} (${soilAnalysis.moistureScore}%)`);
    console.log(`Description: ${soilAnalysis.moistureDescription}`);
    console.log('');
    console.log(`${soilAnalysis.icon} Recommendation: ${soilAnalysis.recommendation}`);
    console.log(`Priority: ${soilAnalysis.priority.toUpperCase()}`);
    console.log('');
    console.log('💡 Explanation:');
    console.log(soilAnalysis.explanation);
    console.log('');
    console.log('📊 Key Factors:');
    console.log(`  • Recent Rainfall (7d): ${soilAnalysis.details.recentRainfall}mm`);
    console.log(`  • Upcoming Rain (3d): ${soilAnalysis.details.upcomingRain}mm (${soilAnalysis.details.upcomingRainProbability}%)`);
    console.log(`  • Water Loss Today (ET0): ${soilAnalysis.details.todayET0}mm`);
    console.log(`  • Temperature: ${soilAnalysis.details.currentTemp}°C`);
    console.log(`  • Humidity: ${soilAnalysis.details.currentHumidity}%`);
    console.log(`  • Wind Speed: ${soilAnalysis.details.currentWindSpeed} km/h`);
    console.log('');

    return soilAnalysis;
  } catch (error) {
    console.error('Error:', error.message);
  }
}

/**
 * Example 2: Get 7-Day Irrigation Schedule
 */
async function getWeeklySchedule() {
  console.log('═'.repeat(60));
  console.log('EXAMPLE 2: 7-Day Irrigation Schedule');
  console.log('═'.repeat(60));
  console.log('');

  try {
    // Fetch weather data
    const weatherData = await getFarmingWeatherData(
      EXAMPLE_LOCATION.latitude,
      EXAMPLE_LOCATION.longitude
    );

    // Get irrigation schedule
    const schedule = getIrrigationSchedule(weatherData);

    // Display schedule
    console.log('📅 Weekly Irrigation Plan:');
    console.log('');

    schedule.forEach((day, index) => {
      const dateStr = day.date.toLocaleDateString('en-US', { 
        weekday: 'short', 
        month: 'short', 
        day: 'numeric' 
      });

      const priorityIcon = day.priority === 'high' ? '🔴' : 
                          day.priority === 'medium' ? '🟠' : '🟢';

      console.log(`${priorityIcon} ${dateStr}:`);
      console.log(`   Action: ${day.action}`);
      console.log(`   ${day.note}`);
      
      if (day.irrigationAmount > 0) {
        console.log(`   💧 Amount: ${day.irrigationAmount}mm`);
      }
      
      console.log(`   Rain: ${day.expectedRain}mm (${day.rainProbability}%), ET0: ${day.et0}mm`);
      console.log('');
    });

    // Summary
    const totalIrrigation = schedule.reduce((sum, day) => sum + day.irrigationAmount, 0);
    const highPriorityDays = schedule.filter(d => d.priority === 'high').length;

    console.log('📊 Weekly Summary:');
    console.log(`  Total Irrigation Needed: ${Math.round(totalIrrigation * 10) / 10}mm`);
    console.log(`  High Priority Days: ${highPriorityDays}`);
    console.log('');

    return schedule;
  } catch (error) {
    console.error('Error:', error.message);
  }
}

/**
 * Example 3: Scenario Testing
 */
function testScenarios() {
  console.log('═'.repeat(60));
  console.log('EXAMPLE 3: Testing Different Scenarios');
  console.log('═'.repeat(60));
  console.log('');

  // Scenario 1: Dry conditions
  const dryScenario = {
    historical: {
      rainfall: [
        { date: new Date(), rain: 0.5, tempMin: 25, tempMax: 35, tempMean: 30 },
        { date: new Date(), rain: 0, tempMin: 26, tempMax: 36, tempMean: 31 },
        { date: new Date(), rain: 0.2, tempMin: 27, tempMax: 37, tempMean: 32 },
        { date: new Date(), rain: 0, tempMin: 28, tempMax: 38, tempMean: 33 },
        { date: new Date(), rain: 0, tempMin: 26, tempMax: 36, tempMean: 31 },
        { date: new Date(), rain: 0.8, tempMin: 25, tempMax: 35, tempMean: 30 },
        { date: new Date(), rain: 0, tempMin: 27, tempMax: 37, tempMean: 32 }
      ],
      totalRainfall: 1.5,
      averageDailyRainfall: 0.2
    },
    current: {
      temperature: 35,
      windSpeed: 25,
      humidity: 35
    },
    daily: [
      { rain: 0, evapotranspiration: 8, precipitationProbability: 5 },
      { rain: 0, evapotranspiration: 7.5, precipitationProbability: 10 },
      { rain: 0, evapotranspiration: 8, precipitationProbability: 5 }
    ]
  };

  console.log('Scenario 1: DRY CONDITIONS');
  console.log('─'.repeat(60));
  const dryResult = analyzeSoilMoisture(dryScenario);
  console.log(`Moisture: ${dryResult.moistureLevel} (${dryResult.moistureScore}%)`);
  console.log(`${dryResult.icon} ${dryResult.recommendation} - ${dryResult.priority.toUpperCase()}`);
  console.log(`Explanation: ${dryResult.explanation}`);
  console.log('');

  // Scenario 2: Rain expected
  const rainyScenario = {
    historical: {
      rainfall: Array(7).fill({ date: new Date(), rain: 3, tempMin: 20, tempMax: 25, tempMean: 22.5 }),
      totalRainfall: 21,
      averageDailyRainfall: 3
    },
    current: {
      temperature: 22,
      windSpeed: 12,
      humidity: 70
    },
    daily: [
      { rain: 15, evapotranspiration: 4, precipitationProbability: 80 },
      { rain: 8, evapotranspiration: 4, precipitationProbability: 75 },
      { rain: 5, evapotranspiration: 4, precipitationProbability: 60 }
    ]
  };

  console.log('Scenario 2: RAIN EXPECTED');
  console.log('─'.repeat(60));
  const rainyResult = analyzeSoilMoisture(rainyScenario);
  console.log(`Moisture: ${rainyResult.moistureLevel} (${rainyResult.moistureScore}%)`);
  console.log(`${rainyResult.icon} ${rainyResult.recommendation} - ${rainyResult.priority.toUpperCase()}`);
  console.log(`Explanation: ${rainyResult.explanation}`);
  console.log('');

  // Scenario 3: Optimal conditions
  const optimalScenario = {
    historical: {
      rainfall: Array(7).fill({ date: new Date(), rain: 5, tempMin: 18, tempMax: 24, tempMean: 21 }),
      totalRainfall: 35,
      averageDailyRainfall: 5
    },
    current: {
      temperature: 22,
      windSpeed: 10,
      humidity: 65
    },
    daily: [
      { rain: 3, evapotranspiration: 4, precipitationProbability: 50 },
      { rain: 2, evapotranspiration: 4, precipitationProbability: 40 },
      { rain: 4, evapotranspiration: 4, precipitationProbability: 60 }
    ]
  };

  console.log('Scenario 3: OPTIMAL CONDITIONS');
  console.log('─'.repeat(60));
  const optimalResult = analyzeSoilMoisture(optimalScenario);
  console.log(`Moisture: ${optimalResult.moistureLevel} (${optimalResult.moistureScore}%)`);
  console.log(`${optimalResult.icon} ${optimalResult.recommendation} - ${optimalResult.priority.toUpperCase()}`);
  console.log(`Explanation: ${optimalResult.explanation}`);
  console.log('');
}

/**
 * Example 4: Integration with UI
 */
async function uiIntegrationExample() {
  console.log('═'.repeat(60));
  console.log('EXAMPLE 4: UI Integration Example');
  console.log('═'.repeat(60));
  console.log('');

  console.log('In your React component:');
  console.log('');
  console.log('```javascript');
  console.log('import { analyzeSoilMoisture } from "./services/soilMoistureService";');
  console.log('import IrrigationCard from "./components/IrrigationCard";');
  console.log('');
  console.log('function MyComponent() {');
  console.log('  const [soilData, setSoilData] = useState(null);');
  console.log('  ');
  console.log('  useEffect(() => {');
  console.log('    // Get weather data');
  console.log('    const weatherData = await getFarmingWeatherData(lat, lon);');
  console.log('    ');
  console.log('    // Analyze soil moisture');
  console.log('    const analysis = analyzeSoilMoisture(weatherData);');
  console.log('    setSoilData(analysis);');
  console.log('  }, [lat, lon]);');
  console.log('  ');
  console.log('  return <IrrigationCard soilData={soilData} />;');
  console.log('}');
  console.log('```');
  console.log('');
}

/**
 * Run all examples
 */
async function runAllExamples() {
  console.log('\n');
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║  SOIL MOISTURE & IRRIGATION - USAGE EXAMPLES               ║');
  console.log('╚════════════════════════════════════════════════════════════╝');
  console.log('\n');

  // Example 1: Current recommendation
  await getCurrentRecommendation();
  console.log('\n');

  // Example 2: Weekly schedule
  await getWeeklySchedule();
  console.log('\n');

  // Example 3: Scenario testing
  testScenarios();
  console.log('\n');

  // Example 4: UI integration
  uiIntegrationExample();

  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║  EXAMPLES COMPLETE!                                        ║');
  console.log('╚════════════════════════════════════════════════════════════╝');
  console.log('');
  console.log('📚 For more details, see: SOIL_MOISTURE_GUIDE.md');
  console.log('');
}

// Run if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runAllExamples().catch(console.error);
}

export {
  getCurrentRecommendation,
  getWeeklySchedule,
  testScenarios,
  uiIntegrationExample
};

