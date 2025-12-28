/**
 * Pest & Disease Prediction Service
 * Predicts pest and disease risks based on weather conditions
 * Uses rule-based system with crop-specific knowledge
 */

/**
 * Pest and disease database with optimal conditions for outbreak
 */
const PEST_DISEASE_DATABASE = {
  // Fungal Diseases
  fungalBlight: {
    name: 'Fungal Blight',
    type: 'fungal',
    category: 'disease',
    conditions: {
      temperature: { min: 20, max: 30 },
      humidity: { min: 70, max: 100 },
      rainfall: { min: 20, max: 200 },
    },
    affectedCrops: ['wheat', 'rice', 'tomato', 'potato', 'onion'],
    symptoms: 'Brown spots on leaves, wilting, reduced yield',
    prevention: [
      'Apply fungicide preventively',
      'Ensure good air circulation',
      'Avoid overhead irrigation',
      'Remove infected plant debris'
    ],
    treatment: 'Apply copper-based fungicide or Mancozeb at first signs'
  },
  powderyMildew: {
    name: 'Powdery Mildew',
    type: 'fungal',
    category: 'disease',
    conditions: {
      temperature: { min: 18, max: 28 },
      humidity: { min: 50, max: 80 },
      rainfall: { min: 0, max: 20 },
    },
    affectedCrops: ['wheat', 'tomato', 'onion', 'chickpea'],
    symptoms: 'White powdery coating on leaves and stems',
    prevention: [
      'Plant resistant varieties',
      'Maintain proper spacing',
      'Remove infected leaves',
      'Apply sulfur-based spray preventively'
    ],
    treatment: 'Spray with sulfur or potassium bicarbonate solution'
  },
  lateBlightPotato: {
    name: 'Late Blight',
    type: 'fungal',
    category: 'disease',
    conditions: {
      temperature: { min: 10, max: 25 },
      humidity: { min: 80, max: 100 },
      rainfall: { min: 30, max: 200 },
    },
    affectedCrops: ['potato', 'tomato'],
    symptoms: 'Dark water-soaked lesions on leaves, white mold on undersides',
    prevention: [
      'Use certified disease-free seed',
      'Hill up soil around plants',
      'Apply preventive fungicide',
      'Destroy infected plants immediately'
    ],
    treatment: 'Apply Chlorothalonil or Mancozeb every 7-10 days'
  },
  rust: {
    name: 'Rust Disease',
    type: 'fungal',
    category: 'disease',
    conditions: {
      temperature: { min: 15, max: 30 },
      humidity: { min: 70, max: 100 },
      rainfall: { min: 10, max: 100 },
    },
    affectedCrops: ['wheat', 'corn', 'sugarcane'],
    symptoms: 'Orange or rust-colored pustules on leaves',
    prevention: [
      'Plant resistant varieties',
      'Remove volunteer plants',
      'Apply fungicide at early growth stages',
      'Ensure adequate plant nutrition'
    ],
    treatment: 'Apply Propiconazole or Tebuconazole fungicide'
  },

  // Insect Pests
  aphids: {
    name: 'Aphids',
    type: 'insect',
    category: 'pest',
    conditions: {
      temperature: { min: 20, max: 30 },
      humidity: { min: 40, max: 80 },
      rainfall: { min: 0, max: 30 },
    },
    affectedCrops: ['wheat', 'cotton', 'tomato', 'potato', 'mustard', 'chickpea', 'sugarcane'],
    symptoms: 'Curled leaves, sticky honeydew, stunted growth',
    prevention: [
      'Introduce beneficial insects (ladybugs)',
      'Use reflective mulch',
      'Remove weed hosts',
      'Apply neem oil spray'
    ],
    treatment: 'Spray with Imidacloprid or soap solution'
  },
  stemBorer: {
    name: 'Stem Borer',
    type: 'insect',
    category: 'pest',
    conditions: {
      temperature: { min: 25, max: 35 },
      humidity: { min: 60, max: 90 },
      rainfall: { min: 50, max: 200 },
    },
    affectedCrops: ['rice', 'corn', 'sugarcane'],
    symptoms: 'Dead hearts, white ears, holes in stems',
    prevention: [
      'Use pheromone traps',
      'Plant early to avoid peak infestation',
      'Remove and burn stubble',
      'Release egg parasitoids'
    ],
    treatment: 'Apply Cartap hydrochloride or Chlorpyrifos'
  },
  whitefly: {
    name: 'Whitefly',
    type: 'insect',
    category: 'pest',
    conditions: {
      temperature: { min: 25, max: 35 },
      humidity: { min: 40, max: 70 },
      rainfall: { min: 0, max: 20 },
    },
    affectedCrops: ['cotton', 'tomato', 'sugarcane'],
    symptoms: 'Yellow leaves, sooty mold, plant weakness',
    prevention: [
      'Use yellow sticky traps',
      'Remove infected leaves',
      'Avoid excessive nitrogen',
      'Spray neem oil regularly'
    ],
    treatment: 'Apply Acetamiprid or Thiamethoxam'
  },
  bollworm: {
    name: 'Bollworm',
    type: 'insect',
    category: 'pest',
    conditions: {
      temperature: { min: 25, max: 35 },
      humidity: { min: 50, max: 80 },
      rainfall: { min: 10, max: 80 },
    },
    affectedCrops: ['cotton', 'tomato', 'chickpea'],
    symptoms: 'Damaged bolls/fruits, holes in fruits, larva inside',
    prevention: [
      'Install pheromone traps',
      'Plant trap crops',
      'Release parasitic wasps',
      'Hand-pick egg masses'
    ],
    treatment: 'Spray with Emamectin benzoate or Spinosad'
  },
  leafhopper: {
    name: 'Leafhopper',
    type: 'insect',
    category: 'pest',
    conditions: {
      temperature: { min: 24, max: 32 },
      humidity: { min: 40, max: 70 },
      rainfall: { min: 0, max: 40 },
    },
    affectedCrops: ['rice', 'cotton', 'potato', 'sugarcane'],
    symptoms: 'Hopper burn, yellowing, stunted growth',
    prevention: [
      'Remove grassy weeds',
      'Use light traps',
      'Maintain field hygiene',
      'Plant resistant varieties'
    ],
    treatment: 'Apply Thiamethoxam or Imidacloprid'
  },

  // Bacterial Diseases
  bacterialWilt: {
    name: 'Bacterial Wilt',
    type: 'bacterial',
    category: 'disease',
    conditions: {
      temperature: { min: 25, max: 35 },
      humidity: { min: 70, max: 100 },
      rainfall: { min: 30, max: 150 },
    },
    affectedCrops: ['tomato', 'potato', 'cotton'],
    symptoms: 'Sudden wilting, no leaf yellowing, vascular browning',
    prevention: [
      'Use disease-free seeds',
      'Practice crop rotation',
      'Improve soil drainage',
      'Disinfect tools between plants'
    ],
    treatment: 'No effective chemical treatment - remove and destroy infected plants'
  },
  bacterialLeafSpot: {
    name: 'Bacterial Leaf Spot',
    type: 'bacterial',
    category: 'disease',
    conditions: {
      temperature: { min: 24, max: 32 },
      humidity: { min: 80, max: 100 },
      rainfall: { min: 40, max: 200 },
    },
    affectedCrops: ['tomato', 'potato', 'onion'],
    symptoms: 'Small dark spots with yellow halos on leaves',
    prevention: [
      'Use certified disease-free seeds',
      'Avoid overhead watering',
      'Space plants properly',
      'Apply copper-based bactericides'
    ],
    treatment: 'Spray copper hydroxide or Streptomycin'
  }
};

/**
 * Calculate risk score for a specific pest/disease based on current weather
 * @param {Object} pestDisease - Pest/disease object from database
 * @param {Object} currentWeather - Current weather conditions
 * @param {Array} forecast - Weather forecast for next 7 days
 * @returns {number} Risk score (0-100)
 */
const calculateRiskScore = (pestDisease, currentWeather, forecast) => {
  let score = 0;
  const conditions = pestDisease.conditions;

  // Temperature suitability (30 points)
  const temp = currentWeather.temperature;
  if (temp >= conditions.temperature.min && temp <= conditions.temperature.max) {
    score += 30;
  } else if (Math.abs(temp - conditions.temperature.min) <= 5 || 
             Math.abs(temp - conditions.temperature.max) <= 5) {
    score += 15; // Within 5°C of optimal
  }

  // Humidity suitability (30 points)
  const humidity = currentWeather.humidity;
  if (humidity >= conditions.humidity.min && humidity <= conditions.humidity.max) {
    score += 30;
  } else if (Math.abs(humidity - conditions.humidity.min) <= 10 || 
             Math.abs(humidity - conditions.humidity.max) <= 10) {
    score += 15; // Within 10% of optimal
  }

  // Rainfall suitability (20 points) - check recent and forecast rainfall
  let totalRainfall = currentWeather.precipitation || 0;
  if (forecast && forecast.length > 0) {
    totalRainfall += forecast.slice(0, 3).reduce((sum, day) => sum + (day.precipitation || 0), 0);
  }
  
  if (totalRainfall >= conditions.rainfall.min && totalRainfall <= conditions.rainfall.max) {
    score += 20;
  } else if (totalRainfall > conditions.rainfall.min * 0.5 && 
             totalRainfall < conditions.rainfall.max * 1.5) {
    score += 10;
  }

  // Wind factor (10 points) - high wind spreads diseases
  if (pestDisease.type === 'fungal' || pestDisease.type === 'bacterial') {
    if (currentWeather.windSpeed > 15) {
      score += 10; // High wind increases disease spread
    }
  }

  // Forecast persistence (10 points) - conditions continue for next few days
  if (forecast && forecast.length >= 3) {
    const persistentConditions = forecast.slice(0, 3).every(day => {
      const tempMatch = day.maxTemp >= conditions.temperature.min && 
                       day.minTemp <= conditions.temperature.max;
      const rainMatch = day.precipitation >= conditions.rainfall.min * 0.3;
      return tempMatch || rainMatch;
    });
    
    if (persistentConditions) {
      score += 10;
    }
  }

  return Math.min(score, 100);
};

/**
 * Get risk level from score
 * @param {number} score - Risk score (0-100)
 * @returns {Object} Risk level details
 */
const getRiskLevel = (score) => {
  if (score >= 70) {
    return { level: 'high', label: 'High Risk', color: 'red', priority: 'urgent' };
  } else if (score >= 50) {
    return { level: 'medium', label: 'Medium Risk', color: 'orange', priority: 'important' };
  } else if (score >= 30) {
    return { level: 'low', label: 'Low Risk', color: 'yellow', priority: 'monitor' };
  } else {
    return { level: 'minimal', label: 'Minimal Risk', color: 'green', priority: 'safe' };
  }
};

/**
 * Analyze pest and disease risks for a specific crop
 * @param {string} cropType - Type of crop (wheat, rice, etc.)
 * @param {Object} currentWeather - Current weather data
 * @param {Array} forecast - Weather forecast data
 * @returns {Object} Pest and disease risk analysis
 */
export const analyzePestDiseaseRisk = (cropType, currentWeather, forecast = []) => {
  if (!cropType || !currentWeather) {
    return null;
  }

  // Filter pests/diseases that affect this crop
  const relevantThreats = Object.keys(PEST_DISEASE_DATABASE)
    .map(key => ({ id: key, ...PEST_DISEASE_DATABASE[key] }))
    .filter(threat => threat.affectedCrops.includes(cropType));

  // Calculate risk for each threat
  const threats = relevantThreats.map(threat => {
    const riskScore = calculateRiskScore(threat, currentWeather, forecast);
    const riskLevel = getRiskLevel(riskScore);

    return {
      id: threat.id,
      name: threat.name,
      type: threat.type,
      category: threat.category,
      riskScore,
      riskLevel: riskLevel.level,
      riskLabel: riskLevel.label,
      riskColor: riskLevel.color,
      priority: riskLevel.priority,
      symptoms: threat.symptoms,
      prevention: threat.prevention,
      treatment: threat.treatment
    };
  });

  // Sort by risk score (highest first)
  threats.sort((a, b) => b.riskScore - a.riskScore);

  // Calculate overall risk
  const highRiskCount = threats.filter(t => t.riskLevel === 'high').length;
  const mediumRiskCount = threats.filter(t => t.riskLevel === 'medium').length;
  
  let overallRisk = 'low';
  let overallRiskLabel = 'Low Risk';
  let overallRiskColor = 'green';
  
  if (highRiskCount >= 2 || (highRiskCount >= 1 && mediumRiskCount >= 2)) {
    overallRisk = 'high';
    overallRiskLabel = 'High Risk';
    overallRiskColor = 'red';
  } else if (highRiskCount >= 1 || mediumRiskCount >= 2) {
    overallRisk = 'medium';
    overallRiskLabel = 'Medium Risk';
    overallRiskColor = 'orange';
  } else if (mediumRiskCount >= 1) {
    overallRisk = 'low';
    overallRiskLabel = 'Low Risk';
    overallRiskColor = 'yellow';
  } else {
    overallRisk = 'minimal';
    overallRiskLabel = 'Minimal Risk';
    overallRiskColor = 'green';
  }

  // Get top 3 threats
  const topThreats = threats.slice(0, 3);

  // Generate general recommendations
  const recommendations = generateRecommendations(threats, currentWeather, forecast);

  return {
    cropType,
    overallRisk,
    overallRiskLabel,
    overallRiskColor,
    highRiskCount,
    mediumRiskCount,
    totalThreats: threats.length,
    topThreats,
    allThreats: threats,
    recommendations,
    weatherSummary: {
      temperature: currentWeather.temperature,
      humidity: currentWeather.humidity,
      rainfall: currentWeather.precipitation || 0,
      windSpeed: currentWeather.windSpeed || 0,
    }
  };
};

/**
 * Generate actionable recommendations based on threats
 * @param {Array} threats - List of threats
 * @param {Object} currentWeather - Current weather
 * @param {Array} forecast - Weather forecast
 * @returns {Array} List of recommendations
 */
const generateRecommendations = (threats, currentWeather, forecast) => {
  const recommendations = [];
  const highRiskThreats = threats.filter(t => t.riskLevel === 'high');
  const fungalThreats = threats.filter(t => t.type === 'fungal' && t.riskScore >= 50);
  const insectThreats = threats.filter(t => t.type === 'insect' && t.riskScore >= 50);

  // High humidity warnings
  if (currentWeather.humidity > 80) {
    recommendations.push({
      type: 'urgent',
      icon: 'droplet',
      message: 'Very high humidity detected. Monitor for fungal diseases closely.',
      action: 'Improve air circulation, avoid overhead watering'
    });
  }

  // Rainfall warnings
  const upcomingRain = forecast.slice(0, 3).reduce((sum, day) => sum + (day.precipitation || 0), 0);
  if (upcomingRain > 50) {
    recommendations.push({
      type: 'important',
      icon: 'cloud-rain',
      message: 'Heavy rain expected in next 3 days. Disease spread risk increases.',
      action: 'Apply preventive fungicide before rain'
    });
  }

  // Warm + humid = fungal risk
  if (currentWeather.temperature > 25 && currentWeather.humidity > 70) {
    recommendations.push({
      type: 'important',
      icon: 'alert-triangle',
      message: 'Warm and humid conditions favor fungal growth.',
      action: 'Scout fields daily, apply fungicide if symptoms appear'
    });
  }

  // High-risk specific threats
  if (highRiskThreats.length > 0) {
    highRiskThreats.forEach(threat => {
      recommendations.push({
        type: 'urgent',
        icon: 'shield-alert',
        message: `High risk of ${threat.name} detected!`,
        action: threat.prevention[0] // First prevention measure
      });
    });
  }

  // Fungal-specific
  if (fungalThreats.length > 0) {
    recommendations.push({
      type: 'important',
      icon: 'spray-can',
      message: 'Fungal disease risk is elevated.',
      action: 'Consider preventive fungicide application'
    });
  }

  // Insect-specific
  if (insectThreats.length > 0) {
    recommendations.push({
      type: 'monitor',
      icon: 'bug',
      message: 'Insect pest activity likely to increase.',
      action: 'Set up monitoring traps, check plants for early signs'
    });
  }

  // Wind + moisture = disease spread
  if (currentWeather.windSpeed > 15 && currentWeather.humidity > 70) {
    recommendations.push({
      type: 'important',
      icon: 'wind',
      message: 'High wind with moisture increases disease spread.',
      action: 'Avoid irrigation during windy conditions'
    });
  }

  // Default monitoring
  if (recommendations.length === 0) {
    recommendations.push({
      type: 'safe',
      icon: 'check-circle',
      message: 'Weather conditions are currently favorable.',
      action: 'Continue regular monitoring and field hygiene'
    });
  }

  return recommendations.slice(0, 5); // Return top 5 recommendations
};

/**
 * Get all pests/diseases for a specific crop (for reference)
 * @param {string} cropType
 * @returns {Array} List of all threats for this crop
 */
export const getCropThreats = (cropType) => {
  return Object.keys(PEST_DISEASE_DATABASE)
    .map(key => ({ id: key, ...PEST_DISEASE_DATABASE[key] }))
    .filter(threat => threat.affectedCrops.includes(cropType));
};

export default {
  analyzePestDiseaseRisk,
  getCropThreats
};

