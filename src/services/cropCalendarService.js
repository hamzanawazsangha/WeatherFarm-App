/**
 * Smart Crop Calendar Service
 * Provides intelligent crop management recommendations based on:
 * - Crop type and growth stages
 * - Current date and season
 * - Weather trends and conditions
 * - Historical farming best practices
 */

/**
 * Crop Configuration Database
 * Each crop has growth stages with durations and requirements
 */
export const CROP_DATABASE = {
  wheat: {
    name: 'Wheat',
    icon: '🌾',
    category: 'Grain',
    climateZones: ['temperate', 'subtropical', 'mediterranean'], // suitable climate zones
    totalDuration: 120, // days
    optimalTemp: { min: 15, max: 25 }, // °C
    waterNeed: 'medium', // low, medium, high
    sowingSeasons: ['october', 'november'], // optimal months
    stages: [
      {
        name: 'Sowing',
        duration: 1,
        daysFromStart: 0,
        description: 'Land preparation and seed sowing',
        icon: '🌱',
        actions: [
          { type: 'sowing', description: 'Plow field and prepare seed bed', priority: 'high' },
          { type: 'fertilizer', description: 'Apply basal fertilizer (NPK)', priority: 'high' },
          { type: 'irrigation', description: 'Pre-sowing irrigation', priority: 'medium' }
        ],
        weatherRequirements: {
          temperature: { min: 15, max: 25 },
          rainfall: { min: 0, max: 10 },
          description: 'Cool, dry weather preferred'
        }
      },
      {
        name: 'Germination',
        duration: 7,
        daysFromStart: 1,
        description: 'Seeds germinate and emerge',
        icon: '🌱',
        actions: [
          { type: 'irrigation', description: 'Light irrigation if soil is dry', priority: 'high' },
          { type: 'monitoring', description: 'Check for bird damage', priority: 'medium' }
        ],
        weatherRequirements: {
          temperature: { min: 18, max: 22 },
          rainfall: { min: 5, max: 20 },
          description: 'Moderate moisture and cool temperature'
        }
      },
      {
        name: 'Tillering',
        duration: 35,
        daysFromStart: 8,
        description: 'Plant develops multiple shoots',
        icon: '🌿',
        actions: [
          { type: 'fertilizer', description: 'Apply nitrogen fertilizer (urea)', priority: 'high', dayOffset: 25 },
          { type: 'irrigation', description: 'Regular irrigation every 7-10 days', priority: 'high' },
          { type: 'weeding', description: 'Remove weeds manually or herbicide', priority: 'medium', dayOffset: 15 },
          { type: 'pesticide', description: 'Monitor for aphids and apply if needed', priority: 'low', dayOffset: 20 }
        ],
        weatherRequirements: {
          temperature: { min: 15, max: 25 },
          rainfall: { min: 20, max: 50 },
          description: 'Regular moisture with moderate temperature'
        }
      },
      {
        name: 'Stem Extension',
        duration: 30,
        daysFromStart: 43,
        description: 'Rapid vertical growth',
        icon: '🌾',
        actions: [
          { type: 'fertilizer', description: 'Apply second dose of nitrogen', priority: 'high', dayOffset: 10 },
          { type: 'irrigation', description: 'Critical irrigation period', priority: 'high' },
          { type: 'pesticide', description: 'Spray for rust and blight prevention', priority: 'medium', dayOffset: 15 }
        ],
        weatherRequirements: {
          temperature: { min: 20, max: 28 },
          rainfall: { min: 30, max: 60 },
          description: 'Warm weather with adequate moisture'
        }
      },
      {
        name: 'Heading & Flowering',
        duration: 15,
        daysFromStart: 73,
        description: 'Ear formation and pollination',
        icon: '🌸',
        actions: [
          { type: 'irrigation', description: 'Most critical irrigation stage', priority: 'high' },
          { type: 'monitoring', description: 'Check for disease and pests', priority: 'high' },
          { type: 'pesticide', description: 'Apply fungicide if disease present', priority: 'medium', dayOffset: 5 }
        ],
        weatherRequirements: {
          temperature: { min: 18, max: 25 },
          rainfall: { min: 20, max: 40 },
          description: 'Moderate temperature, no extreme heat'
        }
      },
      {
        name: 'Grain Filling',
        duration: 25,
        daysFromStart: 88,
        description: 'Grain development and maturation',
        icon: '🌾',
        actions: [
          { type: 'irrigation', description: 'Continue irrigation, reduce towards end', priority: 'high' },
          { type: 'monitoring', description: 'Watch for lodging and pests', priority: 'medium' }
        ],
        weatherRequirements: {
          temperature: { min: 20, max: 30 },
          rainfall: { min: 10, max: 30 },
          description: 'Warm, sunny weather preferred'
        }
      },
      {
        name: 'Maturation',
        duration: 7,
        daysFromStart: 113,
        description: 'Grain hardening, prepare for harvest',
        icon: '🌾',
        actions: [
          { type: 'irrigation', description: 'Stop irrigation', priority: 'high' },
          { type: 'monitoring', description: 'Check grain moisture content', priority: 'high' },
          { type: 'harvest', description: 'Prepare harvesting equipment', priority: 'medium', dayOffset: 5 }
        ],
        weatherRequirements: {
          temperature: { min: 25, max: 35 },
          rainfall: { min: 0, max: 5 },
          description: 'Dry, warm weather for grain drying'
        }
      },
      {
        name: 'Harvest',
        duration: 1,
        daysFromStart: 120,
        description: 'Ready for harvesting',
        icon: '🚜',
        actions: [
          { type: 'harvest', description: 'Harvest when grain moisture is 12-14%', priority: 'high' },
          { type: 'storage', description: 'Dry and store grain properly', priority: 'high' }
        ],
        weatherRequirements: {
          temperature: { min: 20, max: 35 },
          rainfall: { min: 0, max: 0 },
          description: 'Dry weather essential for harvest'
        }
      }
    ]
  },
  
  rice: {
    name: 'Rice',
    icon: '🌾',
    category: 'Grain',
    climateZones: ['tropical', 'subtropical', 'humid-subtropical'],
    totalDuration: 130,
    optimalTemp: { min: 20, max: 35 },
    waterNeed: 'high',
    sowingSeasons: ['may', 'june', 'july'],
    stages: [
      {
        name: 'Land Preparation',
        duration: 7,
        daysFromStart: 0,
        description: 'Flooding and puddling',
        icon: '💧',
        actions: [
          { type: 'irrigation', description: 'Flood field with 5-10cm water', priority: 'high' },
          { type: 'sowing', description: 'Prepare nursery beds', priority: 'high' },
          { type: 'fertilizer', description: 'Apply basal fertilizer before flooding', priority: 'medium' }
        ],
        weatherRequirements: {
          temperature: { min: 22, max: 32 },
          rainfall: { min: 0, max: 50 },
          description: 'Warm weather, water availability essential'
        }
      },
      {
        name: 'Nursery & Transplanting',
        duration: 25,
        daysFromStart: 7,
        description: 'Seedlings grow in nursery, then transplanted',
        icon: '🌱',
        actions: [
          { type: 'sowing', description: 'Sow seeds in nursery beds', priority: 'high' },
          { type: 'irrigation', description: 'Keep nursery moist', priority: 'high' },
          { type: 'transplanting', description: 'Transplant 20-25 day old seedlings', priority: 'high', dayOffset: 20 },
          { type: 'weeding', description: 'Apply pre-emergence herbicide', priority: 'medium', dayOffset: 22 }
        ],
        weatherRequirements: {
          temperature: { min: 25, max: 35 },
          rainfall: { min: 50, max: 150 },
          description: 'Hot, humid weather with good rainfall'
        }
      },
      {
        name: 'Tillering',
        duration: 30,
        daysFromStart: 32,
        description: 'Active tillering and vegetative growth',
        icon: '🌿',
        actions: [
          { type: 'fertilizer', description: 'Apply first nitrogen dose', priority: 'high', dayOffset: 10 },
          { type: 'irrigation', description: 'Maintain 5cm standing water', priority: 'high' },
          { type: 'weeding', description: 'Manual or chemical weeding', priority: 'medium', dayOffset: 15 },
          { type: 'pesticide', description: 'Monitor for stem borer', priority: 'medium', dayOffset: 20 }
        ],
        weatherRequirements: {
          temperature: { min: 25, max: 35 },
          rainfall: { min: 100, max: 200 },
          description: 'High temperature and humidity'
        }
      },
      {
        name: 'Panicle Initiation',
        duration: 15,
        daysFromStart: 62,
        description: 'Beginning of reproductive phase',
        icon: '🌾',
        actions: [
          { type: 'fertilizer', description: 'Apply second nitrogen dose', priority: 'high' },
          { type: 'irrigation', description: 'Critical water requirement', priority: 'high' },
          { type: 'pesticide', description: 'Spray for blast disease', priority: 'medium', dayOffset: 7 }
        ],
        weatherRequirements: {
          temperature: { min: 28, max: 35 },
          rainfall: { min: 80, max: 150 },
          description: 'Hot, humid with adequate water'
        }
      },
      {
        name: 'Flowering',
        duration: 10,
        daysFromStart: 77,
        description: 'Panicle emergence and flowering',
        icon: '🌸',
        actions: [
          { type: 'irrigation', description: 'Most critical stage - maintain water', priority: 'high' },
          { type: 'monitoring', description: 'Check for pests and diseases', priority: 'high' },
          { type: 'pesticide', description: 'Apply if pest pressure is high', priority: 'low', dayOffset: 5 }
        ],
        weatherRequirements: {
          temperature: { min: 25, max: 32 },
          rainfall: { min: 50, max: 100 },
          description: 'Warm days, cool nights preferred'
        }
      },
      {
        name: 'Grain Filling',
        duration: 25,
        daysFromStart: 87,
        description: 'Grain development and maturation',
        icon: '🌾',
        actions: [
          { type: 'irrigation', description: 'Continue irrigation, reduce gradually', priority: 'high' },
          { type: 'monitoring', description: 'Watch for birds and rodents', priority: 'medium' }
        ],
        weatherRequirements: {
          temperature: { min: 25, max: 33 },
          rainfall: { min: 30, max: 80 },
          description: 'Warm, sunny weather'
        }
      },
      {
        name: 'Maturation',
        duration: 12,
        daysFromStart: 112,
        description: 'Grain hardening',
        icon: '🌾',
        actions: [
          { type: 'irrigation', description: 'Drain field 7-10 days before harvest', priority: 'high', dayOffset: 5 },
          { type: 'monitoring', description: 'Check grain maturity', priority: 'high' }
        ],
        weatherRequirements: {
          temperature: { min: 25, max: 35 },
          rainfall: { min: 0, max: 20 },
          description: 'Dry weather preferred for maturation'
        }
      },
      {
        name: 'Harvest',
        duration: 6,
        daysFromStart: 124,
        description: 'Harvesting period',
        icon: '🚜',
        actions: [
          { type: 'harvest', description: 'Harvest when 80% grains are golden', priority: 'high' },
          { type: 'storage', description: 'Dry to 14% moisture for storage', priority: 'high' }
        ],
        weatherRequirements: {
          temperature: { min: 25, max: 35 },
          rainfall: { min: 0, max: 0 },
          description: 'Clear, dry weather for harvest'
        }
      }
    ]
  },
  
  corn: {
    name: 'Corn (Maize)',
    icon: '🌽',
    category: 'Grain',
    climateZones: ['temperate', 'subtropical', 'tropical'],
    totalDuration: 110,
    optimalTemp: { min: 20, max: 30 },
    waterNeed: 'medium',
    sowingSeasons: ['february', 'march', 'july', 'august'],
    stages: [
      {
        name: 'Planting',
        duration: 1,
        daysFromStart: 0,
        description: 'Seed sowing',
        icon: '🌱',
        actions: [
          { type: 'sowing', description: 'Plant seeds 5-7cm deep', priority: 'high' },
          { type: 'fertilizer', description: 'Apply basal fertilizer (DAP)', priority: 'high' },
          { type: 'irrigation', description: 'Pre-sowing irrigation if soil is dry', priority: 'medium' }
        ],
        weatherRequirements: {
          temperature: { min: 18, max: 28 },
          rainfall: { min: 0, max: 20 },
          description: 'Warm soil temperature (above 15°C)'
        }
      },
      {
        name: 'Emergence',
        duration: 9,
        daysFromStart: 1,
        description: 'Seedling emergence',
        icon: '🌱',
        actions: [
          { type: 'irrigation', description: 'Light irrigation if needed', priority: 'high' },
          { type: 'monitoring', description: 'Check for cutworms', priority: 'medium', dayOffset: 5 }
        ],
        weatherRequirements: {
          temperature: { min: 20, max: 30 },
          rainfall: { min: 10, max: 30 },
          description: 'Warm, moist conditions'
        }
      },
      {
        name: 'Vegetative Growth',
        duration: 35,
        daysFromStart: 10,
        description: 'Rapid leaf and stalk development',
        icon: '🌿',
        actions: [
          { type: 'fertilizer', description: 'Apply nitrogen fertilizer (urea)', priority: 'high', dayOffset: 15 },
          { type: 'irrigation', description: 'Regular irrigation every 5-7 days', priority: 'high' },
          { type: 'weeding', description: 'Weed control - manual or herbicide', priority: 'medium', dayOffset: 12 },
          { type: 'pesticide', description: 'Monitor for armyworms', priority: 'medium', dayOffset: 20 }
        ],
        weatherRequirements: {
          temperature: { min: 22, max: 32 },
          rainfall: { min: 50, max: 100 },
          description: 'Warm weather with adequate moisture'
        }
      },
      {
        name: 'Tasseling',
        duration: 8,
        daysFromStart: 45,
        description: 'Tassel emergence and pollen shed',
        icon: '🌾',
        actions: [
          { type: 'irrigation', description: 'Critical irrigation period', priority: 'high' },
          { type: 'fertilizer', description: 'Apply second nitrogen dose', priority: 'high', dayOffset: 2 },
          { type: 'monitoring', description: 'Check for corn borer', priority: 'medium' }
        ],
        weatherRequirements: {
          temperature: { min: 20, max: 30 },
          rainfall: { min: 40, max: 80 },
          description: 'Moderate temperature, no heat stress'
        }
      },
      {
        name: 'Silking & Pollination',
        duration: 12,
        daysFromStart: 53,
        description: 'Silk emergence and kernel formation',
        icon: '🌽',
        actions: [
          { type: 'irrigation', description: 'Most critical water need', priority: 'high' },
          { type: 'monitoring', description: 'Watch for earworms', priority: 'high' },
          { type: 'pesticide', description: 'Apply if pest damage exceeds 10%', priority: 'low', dayOffset: 5 }
        ],
        weatherRequirements: {
          temperature: { min: 20, max: 28 },
          rainfall: { min: 50, max: 100 },
          description: 'Cool nights, warm days, no drought'
        }
      },
      {
        name: 'Grain Filling',
        duration: 30,
        daysFromStart: 65,
        description: 'Kernel development',
        icon: '🌽',
        actions: [
          { type: 'irrigation', description: 'Continue regular irrigation', priority: 'high' },
          { type: 'monitoring', description: 'Check for stalk rot', priority: 'medium', dayOffset: 15 }
        ],
        weatherRequirements: {
          temperature: { min: 22, max: 32 },
          rainfall: { min: 40, max: 80 },
          description: 'Warm, sunny weather'
        }
      },
      {
        name: 'Maturation',
        duration: 10,
        daysFromStart: 95,
        description: 'Kernel drying and hardening',
        icon: '🌽',
        actions: [
          { type: 'irrigation', description: 'Reduce or stop irrigation', priority: 'medium', dayOffset: 5 },
          { type: 'monitoring', description: 'Check kernel black layer', priority: 'high' }
        ],
        weatherRequirements: {
          temperature: { min: 20, max: 32 },
          rainfall: { min: 0, max: 30 },
          description: 'Dry weather preferred'
        }
      },
      {
        name: 'Harvest',
        duration: 5,
        daysFromStart: 105,
        description: 'Ready for harvest',
        icon: '🚜',
        actions: [
          { type: 'harvest', description: 'Harvest at 20-25% grain moisture', priority: 'high' },
          { type: 'storage', description: 'Dry to 13-14% for storage', priority: 'high' }
        ],
        weatherRequirements: {
          temperature: { min: 20, max: 35 },
          rainfall: { min: 0, max: 0 },
          description: 'Dry weather essential'
        }
      }
    ]
  },
  
  cotton: {
    name: 'Cotton',
    icon: '☁️',
    category: 'Fiber',
    climateZones: ['subtropical', 'tropical', 'mediterranean', 'arid'],
    totalDuration: 160,
    optimalTemp: { min: 20, max: 35 },
    waterNeed: 'medium',
    sowingSeasons: ['april', 'may'],
    stages: [
      {
        name: 'Planting',
        duration: 1,
        daysFromStart: 0,
        description: 'Seed sowing',
        icon: '🌱',
        actions: [
          { type: 'sowing', description: 'Plant seeds 3-5cm deep', priority: 'high' },
          { type: 'fertilizer', description: 'Apply basal fertilizer', priority: 'high' },
          { type: 'irrigation', description: 'Pre-sowing irrigation', priority: 'medium' }
        ],
        weatherRequirements: {
          temperature: { min: 18, max: 30 },
          rainfall: { min: 0, max: 20 },
          description: 'Warm soil (above 16°C)'
        }
      },
      {
        name: 'Germination',
        duration: 9,
        daysFromStart: 1,
        description: 'Seedling emergence',
        icon: '🌱',
        actions: [
          { type: 'irrigation', description: 'Light irrigation if dry', priority: 'high' },
          { type: 'monitoring', description: 'Check for damping off', priority: 'medium' }
        ],
        weatherRequirements: {
          temperature: { min: 20, max: 32 },
          rainfall: { min: 10, max: 30 },
          description: 'Warm, moist soil'
        }
      },
      {
        name: 'Vegetative Growth',
        duration: 50,
        daysFromStart: 10,
        description: 'Rapid plant growth',
        icon: '🌿',
        actions: [
          { type: 'fertilizer', description: 'Apply nitrogen fertilizer', priority: 'high', dayOffset: 25 },
          { type: 'irrigation', description: 'Regular irrigation every 10-12 days', priority: 'high' },
          { type: 'weeding', description: 'Weed control', priority: 'medium', dayOffset: 15 },
          { type: 'pesticide', description: 'Monitor for whitefly and jassids', priority: 'high', dayOffset: 30 }
        ],
        weatherRequirements: {
          temperature: { min: 25, max: 35 },
          rainfall: { min: 40, max: 80 },
          description: 'Hot, humid weather'
        }
      },
      {
        name: 'Squaring',
        duration: 20,
        daysFromStart: 60,
        description: 'Flower bud formation',
        icon: '🌿',
        actions: [
          { type: 'irrigation', description: 'Critical irrigation stage', priority: 'high' },
          { type: 'pesticide', description: 'Spray for bollworm', priority: 'high', dayOffset: 10 },
          { type: 'monitoring', description: 'Check for pink bollworm', priority: 'high' }
        ],
        weatherRequirements: {
          temperature: { min: 25, max: 35 },
          rainfall: { min: 30, max: 60 },
          description: 'Hot weather with adequate moisture'
        }
      },
      {
        name: 'Flowering',
        duration: 30,
        daysFromStart: 80,
        description: 'Flower opening and boll formation',
        icon: '🌸',
        actions: [
          { type: 'irrigation', description: 'Regular irrigation essential', priority: 'high' },
          { type: 'fertilizer', description: 'Apply potash if needed', priority: 'medium', dayOffset: 15 },
          { type: 'pesticide', description: 'Continue bollworm control', priority: 'high', dayOffset: 10 }
        ],
        weatherRequirements: {
          temperature: { min: 25, max: 35 },
          rainfall: { min: 40, max: 80 },
          description: 'Warm, humid weather'
        }
      },
      {
        name: 'Boll Development',
        duration: 40,
        daysFromStart: 110,
        description: 'Boll filling and growth',
        icon: '☁️',
        actions: [
          { type: 'irrigation', description: 'Continue irrigation, reduce towards end', priority: 'high' },
          { type: 'monitoring', description: 'Check for boll rot', priority: 'medium', dayOffset: 20 },
          { type: 'pesticide', description: 'Spray if pest damage is high', priority: 'medium', dayOffset: 15 }
        ],
        weatherRequirements: {
          temperature: { min: 28, max: 38 },
          rainfall: { min: 20, max: 50 },
          description: 'Hot, dry weather preferred'
        }
      },
      {
        name: 'Boll Opening',
        duration: 20,
        daysFromStart: 150,
        description: 'Bolls open, cotton fiber exposed',
        icon: '☁️',
        actions: [
          { type: 'irrigation', description: 'Stop irrigation', priority: 'high' },
          { type: 'monitoring', description: 'Prepare for picking', priority: 'high', dayOffset: 10 }
        ],
        weatherRequirements: {
          temperature: { min: 25, max: 38 },
          rainfall: { min: 0, max: 10 },
          description: 'Dry, sunny weather'
        }
      },
      {
        name: 'Harvest',
        duration: 10,
        daysFromStart: 170,
        description: 'Cotton picking',
        icon: '🚜',
        actions: [
          { type: 'harvest', description: 'Pick cotton when fully opened', priority: 'high' },
          { type: 'storage', description: 'Store in dry, clean place', priority: 'high' }
        ],
        weatherRequirements: {
          temperature: { min: 20, max: 35 },
          rainfall: { min: 0, max: 0 },
          description: 'Dry weather essential'
        }
      }
    ]
  },
  
  tomato: {
    name: 'Tomato',
    icon: '🍅',
    category: 'Vegetable',
    climateZones: ['temperate', 'subtropical', 'mediterranean', 'tropical'],
    totalDuration: 90,
    optimalTemp: { min: 18, max: 30 },
    waterNeed: 'high',
    sowingSeasons: ['september', 'october', 'january', 'february'],
    stages: [
      {
        name: 'Nursery',
        duration: 25,
        daysFromStart: 0,
        description: 'Seedling development in nursery',
        icon: '🌱',
        actions: [
          { type: 'sowing', description: 'Sow seeds in nursery beds', priority: 'high' },
          { type: 'irrigation', description: 'Keep nursery moist', priority: 'high' },
          { type: 'fertilizer', description: 'Apply starter fertilizer', priority: 'medium', dayOffset: 10 }
        ],
        weatherRequirements: {
          temperature: { min: 20, max: 28 },
          rainfall: { min: 0, max: 20 },
          description: 'Warm, protected environment'
        }
      },
      {
        name: 'Transplanting',
        duration: 5,
        daysFromStart: 25,
        description: 'Moving seedlings to field',
        icon: '🌱',
        actions: [
          { type: 'transplanting', description: 'Transplant 4-5 week old seedlings', priority: 'high' },
          { type: 'irrigation', description: 'Water immediately after transplanting', priority: 'high' },
          { type: 'fertilizer', description: 'Apply basal fertilizer', priority: 'high' }
        ],
        weatherRequirements: {
          temperature: { min: 18, max: 28 },
          rainfall: { min: 0, max: 10 },
          description: 'Cool, cloudy day preferred'
        }
      },
      {
        name: 'Vegetative Growth',
        duration: 25,
        daysFromStart: 30,
        description: 'Plant establishment and growth',
        icon: '🌿',
        actions: [
          { type: 'irrigation', description: 'Regular drip irrigation', priority: 'high' },
          { type: 'fertilizer', description: 'Apply nitrogen fertilizer', priority: 'high', dayOffset: 10 },
          { type: 'staking', description: 'Install stakes for support', priority: 'medium', dayOffset: 15 },
          { type: 'pesticide', description: 'Monitor for whitefly and aphids', priority: 'medium', dayOffset: 20 }
        ],
        weatherRequirements: {
          temperature: { min: 20, max: 30 },
          rainfall: { min: 20, max: 50 },
          description: 'Warm weather with moderate moisture'
        }
      },
      {
        name: 'Flowering',
        duration: 10,
        daysFromStart: 55,
        description: 'Flower formation and pollination',
        icon: '🌸',
        actions: [
          { type: 'irrigation', description: 'Critical watering stage', priority: 'high' },
          { type: 'fertilizer', description: 'Apply potassium and phosphorus', priority: 'high' },
          { type: 'monitoring', description: 'Check for blossom drop', priority: 'medium', dayOffset: 5 }
        ],
        weatherRequirements: {
          temperature: { min: 18, max: 28 },
          rainfall: { min: 10, max: 30 },
          description: 'Cool nights, warm days (not above 32°C)'
        }
      },
      {
        name: 'Fruit Development',
        duration: 20,
        daysFromStart: 65,
        description: 'Fruit setting and growth',
        icon: '🍅',
        actions: [
          { type: 'irrigation', description: 'Consistent watering essential', priority: 'high' },
          { type: 'fertilizer', description: 'Apply calcium to prevent blossom end rot', priority: 'medium', dayOffset: 5 },
          { type: 'pesticide', description: 'Spray for fruit borer', priority: 'high', dayOffset: 10 },
          { type: 'pruning', description: 'Remove suckers', priority: 'low', dayOffset: 15 }
        ],
        weatherRequirements: {
          temperature: { min: 20, max: 30 },
          rainfall: { min: 20, max: 50 },
          description: 'Warm, sunny weather'
        }
      },
      {
        name: 'Ripening',
        duration: 10,
        daysFromStart: 85,
        description: 'Fruit color change and maturation',
        icon: '🍅',
        actions: [
          { type: 'irrigation', description: 'Reduce irrigation slightly', priority: 'medium' },
          { type: 'monitoring', description: 'Check for fruit cracking', priority: 'high' }
        ],
        weatherRequirements: {
          temperature: { min: 20, max: 32 },
          rainfall: { min: 0, max: 20 },
          description: 'Warm, sunny days'
        }
      },
      {
        name: 'Harvest',
        duration: 30,
        daysFromStart: 95,
        description: 'Multiple pickings',
        icon: '🚜',
        actions: [
          { type: 'harvest', description: 'Pick ripe fruits every 2-3 days', priority: 'high' },
          { type: 'storage', description: 'Store in cool, ventilated area', priority: 'medium' }
        ],
        weatherRequirements: {
          temperature: { min: 18, max: 30 },
          rainfall: { min: 0, max: 20 },
          description: 'Dry weather preferred for picking'
        }
      }
    ]
  },

  // Additional crops for different climate zones
  sugarcane: {
    name: 'Sugarcane',
    icon: '🎋',
    category: 'Cash Crop',
    climateZones: ['tropical', 'subtropical'],
    totalDuration: 365,
    optimalTemp: { min: 20, max: 35 },
    waterNeed: 'high',
    sowingSeasons: ['february', 'march', 'september', 'october'],
    stages: [
      { name: 'Planting', duration: 30, daysFromStart: 0, description: 'Set preparation and planting', icon: '🌱', 
        actions: [{ type: 'sowing', description: 'Plant healthy sets', priority: 'high' }], 
        weatherRequirements: { temperature: { min: 20, max: 30 }, rainfall: { min: 20, max: 50 }, description: 'Warm and moist' } },
      { name: 'Germination', duration: 30, daysFromStart: 30, description: 'Sprouting phase', icon: '🌿',
        actions: [{ type: 'irrigation', description: 'Regular irrigation', priority: 'high' }],
        weatherRequirements: { temperature: { min: 25, max: 35 }, rainfall: { min: 30, max: 80 }, description: 'Hot and humid' } },
      { name: 'Tillering', duration: 60, daysFromStart: 60, description: 'Rapid growth', icon: '🎋',
        actions: [{ type: 'fertilizer', description: 'Apply nitrogen fertilizer', priority: 'high' }],
        weatherRequirements: { temperature: { min: 25, max: 35 }, rainfall: { min: 100, max: 200 }, description: 'High temperature and rainfall' } },
      { name: 'Grand Growth', duration: 150, daysFromStart: 120, description: 'Maximum vegetative growth', icon: '🎋',
        actions: [{ type: 'irrigation', description: 'Critical water stage', priority: 'high' }],
        weatherRequirements: { temperature: { min: 28, max: 38 }, rainfall: { min: 150, max: 300 }, description: 'High heat and water' } },
      { name: 'Maturation', duration: 95, daysFromStart: 270, description: 'Sugar accumulation', icon: '🎋',
        actions: [{ type: 'monitoring', description: 'Check sugar content', priority: 'high' }],
        weatherRequirements: { temperature: { min: 20, max: 30 }, rainfall: { min: 0, max: 30 }, description: 'Dry period needed' } },
      { name: 'Harvest', duration: 1, daysFromStart: 365, description: 'Ready for harvesting', icon: '🚜',
        actions: [{ type: 'harvest', description: 'Harvest when sugar content is optimal', priority: 'high' }],
        weatherRequirements: { temperature: { min: 18, max: 30 }, rainfall: { min: 0, max: 10 }, description: 'Dry weather' } }
    ]
  },

  potato: {
    name: 'Potato',
    icon: '🥔',
    category: 'Vegetable',
    climateZones: ['temperate', 'subtropical', 'mediterranean'],
    totalDuration: 90,
    optimalTemp: { min: 15, max: 25 },
    waterNeed: 'medium',
    sowingSeasons: ['october', 'november', 'january', 'february'],
    stages: [
      { name: 'Planting', duration: 1, daysFromStart: 0, description: 'Seed tuber planting', icon: '🌱',
        actions: [{ type: 'sowing', description: 'Plant seed potatoes', priority: 'high' }],
        weatherRequirements: { temperature: { min: 15, max: 22 }, rainfall: { min: 0, max: 10 }, description: 'Cool and dry' } },
      { name: 'Sprouting', duration: 15, daysFromStart: 1, description: 'Emergence of shoots', icon: '🌿',
        actions: [{ type: 'irrigation', description: 'Light irrigation', priority: 'high' }],
        weatherRequirements: { temperature: { min: 18, max: 25 }, rainfall: { min: 10, max: 30 }, description: 'Moderate conditions' } },
      { name: 'Vegetative Growth', duration: 35, daysFromStart: 16, description: 'Leaf and stem development', icon: '🌿',
        actions: [{ type: 'fertilizer', description: 'Apply nitrogen', priority: 'high' }, { type: 'weeding', description: 'Remove weeds', priority: 'medium' }],
        weatherRequirements: { temperature: { min: 18, max: 24 }, rainfall: { min: 30, max: 60 }, description: 'Cool with regular moisture' } },
      { name: 'Tuber Formation', duration: 25, daysFromStart: 51, description: 'Tuber initiation and bulking', icon: '🥔',
        actions: [{ type: 'irrigation', description: 'Critical water stage', priority: 'high' }, { type: 'fertilizer', description: 'Apply potash', priority: 'high' }],
        weatherRequirements: { temperature: { min: 16, max: 22 }, rainfall: { min: 40, max: 80 }, description: 'Cool nights, adequate moisture' } },
      { name: 'Maturation', duration: 14, daysFromStart: 76, description: 'Skin setting', icon: '🥔',
        actions: [{ type: 'irrigation', description: 'Stop irrigation 10 days before harvest', priority: 'high' }],
        weatherRequirements: { temperature: { min: 15, max: 25 }, rainfall: { min: 0, max: 20 }, description: 'Dry weather' } },
      { name: 'Harvest', duration: 1, daysFromStart: 90, description: 'Ready for harvest', icon: '🚜',
        actions: [{ type: 'harvest', description: 'Dig when foliage dies', priority: 'high' }],
        weatherRequirements: { temperature: { min: 15, max: 25 }, rainfall: { min: 0, max: 5 }, description: 'Dry conditions' } }
    ]
  },

  onion: {
    name: 'Onion',
    icon: '🧅',
    category: 'Vegetable',
    climateZones: ['temperate', 'subtropical', 'mediterranean'],
    totalDuration: 120,
    optimalTemp: { min: 13, max: 24 },
    waterNeed: 'medium',
    sowingSeasons: ['october', 'november', 'december'],
    stages: [
      { name: 'Sowing', duration: 1, daysFromStart: 0, description: 'Seed or set planting', icon: '🌱',
        actions: [{ type: 'sowing', description: 'Sow seeds or plant sets', priority: 'high' }],
        weatherRequirements: { temperature: { min: 13, max: 20 }, rainfall: { min: 0, max: 10 }, description: 'Cool season crop' } },
      { name: 'Germination', duration: 10, daysFromStart: 1, description: 'Seedling emergence', icon: '🌱',
        actions: [{ type: 'irrigation', description: 'Keep soil moist', priority: 'high' }],
        weatherRequirements: { temperature: { min: 15, max: 22 }, rainfall: { min: 10, max: 20 }, description: 'Moderate moisture' } },
      { name: 'Vegetative Growth', duration: 60, daysFromStart: 11, description: 'Leaf development', icon: '🌿',
        actions: [{ type: 'fertilizer', description: 'Apply nitrogen', priority: 'high' }, { type: 'weeding', description: 'Critical weed control', priority: 'high' }],
        weatherRequirements: { temperature: { min: 15, max: 25 }, rainfall: { min: 20, max: 40 }, description: 'Cool to warm' } },
      { name: 'Bulbing', duration: 35, daysFromStart: 71, description: 'Bulb formation', icon: '🧅',
        actions: [{ type: 'irrigation', description: 'Regular watering', priority: 'high' }],
        weatherRequirements: { temperature: { min: 18, max: 28 }, rainfall: { min: 20, max: 50 }, description: 'Long days needed' } },
      { name: 'Maturation', duration: 14, daysFromStart: 106, description: 'Bulb ripening', icon: '🧅',
        actions: [{ type: 'irrigation', description: 'Stop irrigation', priority: 'high' }],
        weatherRequirements: { temperature: { min: 20, max: 30 }, rainfall: { min: 0, max: 10 }, description: 'Dry for curing' } },
      { name: 'Harvest', duration: 1, daysFromStart: 120, description: 'Ready to harvest', icon: '🚜',
        actions: [{ type: 'harvest', description: 'Pull when tops fall over', priority: 'high' }],
        weatherRequirements: { temperature: { min: 18, max: 30 }, rainfall: { min: 0, max: 5 }, description: 'Dry weather essential' } }
    ]
  },

  chickpea: {
    name: 'Chickpea (Gram)',
    icon: '🫘',
    category: 'Legume',
    climateZones: ['subtropical', 'mediterranean', 'arid'],
    totalDuration: 110,
    optimalTemp: { min: 15, max: 30 },
    waterNeed: 'low',
    sowingSeasons: ['october', 'november'],
    stages: [
      { name: 'Sowing', duration: 1, daysFromStart: 0, description: 'Seed planting', icon: '🌱',
        actions: [{ type: 'sowing', description: 'Sow treated seeds', priority: 'high' }],
        weatherRequirements: { temperature: { min: 15, max: 25 }, rainfall: { min: 0, max: 10 }, description: 'Cool, dry weather' } },
      { name: 'Germination', duration: 7, daysFromStart: 1, description: 'Seedling emergence', icon: '🌱',
        actions: [{ type: 'irrigation', description: 'Pre-sowing irrigation', priority: 'medium' }],
        weatherRequirements: { temperature: { min: 18, max: 25 }, rainfall: { min: 5, max: 20 }, description: 'Moderate temperature' } },
      { name: 'Vegetative', duration: 40, daysFromStart: 8, description: 'Branch and leaf growth', icon: '🌿',
        actions: [{ type: 'weeding', description: 'One weeding needed', priority: 'medium' }],
        weatherRequirements: { temperature: { min: 18, max: 28 }, rainfall: { min: 20, max: 50 }, description: 'Cool to moderate' } },
      { name: 'Flowering', duration: 25, daysFromStart: 48, description: 'Flower development', icon: '🌸',
        actions: [{ type: 'irrigation', description: 'One irrigation if needed', priority: 'low' }],
        weatherRequirements: { temperature: { min: 20, max: 30 }, rainfall: { min: 10, max: 30 }, description: 'Warm, dry weather' } },
      { name: 'Pod Formation', duration: 25, daysFromStart: 73, description: 'Pod filling', icon: '🫘',
        actions: [{ type: 'monitoring', description: 'Check for pests', priority: 'medium' }],
        weatherRequirements: { temperature: { min: 22, max: 32 }, rainfall: { min: 5, max: 20 }, description: 'Warm and dry' } },
      { name: 'Maturation', duration: 12, daysFromStart: 98, description: 'Pod drying', icon: '🫘',
        actions: [{ type: 'monitoring', description: 'Check pod color', priority: 'high' }],
        weatherRequirements: { temperature: { min: 25, max: 35 }, rainfall: { min: 0, max: 5 }, description: 'Hot and dry' } },
      { name: 'Harvest', duration: 1, daysFromStart: 110, description: 'Ready to harvest', icon: '🚜',
        actions: [{ type: 'harvest', description: 'Harvest when pods turn brown', priority: 'high' }],
        weatherRequirements: { temperature: { min: 20, max: 35 }, rainfall: { min: 0, max: 0 }, description: 'Completely dry' } }
    ]
  },

  mango: {
    name: 'Mango',
    icon: '🥭',
    category: 'Fruit',
    climateZones: ['tropical', 'subtropical'],
    totalDuration: 1460, // ~4 years to first fruit
    optimalTemp: { min: 24, max: 35 },
    waterNeed: 'medium',
    sowingSeasons: ['july', 'august'],
    stages: [
      { name: 'Planting', duration: 365, daysFromStart: 0, description: 'Sapling establishment', icon: '🌱',
        actions: [{ type: 'sowing', description: 'Plant grafted sapling', priority: 'high' }],
        weatherRequirements: { temperature: { min: 24, max: 32 }, rainfall: { min: 50, max: 150 }, description: 'Monsoon season' } },
      { name: 'Growth Year 1', duration: 365, daysFromStart: 365, description: 'Vegetative growth', icon: '🌿',
        actions: [{ type: 'fertilizer', description: 'Regular fertilization', priority: 'high' }, { type: 'pruning', description: 'Shape the tree', priority: 'medium' }],
        weatherRequirements: { temperature: { min: 24, max: 38 }, rainfall: { min: 100, max: 300 }, description: 'Hot and humid' } },
      { name: 'Growth Year 2', duration: 365, daysFromStart: 730, description: 'Canopy development', icon: '🌳',
        actions: [{ type: 'fertilizer', description: 'Organic manure', priority: 'high' }],
        weatherRequirements: { temperature: { min: 24, max: 38 }, rainfall: { min: 100, max: 300 }, description: 'Tropical climate' } },
      { name: 'Pre-bearing', duration: 365, daysFromStart: 1095, description: 'Preparation for fruiting', icon: '🌸',
        actions: [{ type: 'monitoring', description: 'Watch for flowering', priority: 'high' }],
        weatherRequirements: { temperature: { min: 24, max: 35 }, rainfall: { min: 50, max: 200 }, description: 'Dry winter helps flowering' } },
      { name: 'Flowering & Fruiting', duration: 1, daysFromStart: 1460, description: 'First harvest', icon: '🥭',
        actions: [{ type: 'harvest', description: 'Pick mature fruits', priority: 'high' }],
        weatherRequirements: { temperature: { min: 28, max: 38 }, rainfall: { min: 0, max: 50 }, description: 'Hot, dry for ripening' } }
    ]
  },

  mustard: {
    name: 'Mustard',
    icon: '🌻',
    category: 'Oilseed',
    climateZones: ['temperate', 'subtropical', 'mediterranean'],
    totalDuration: 90,
    optimalTemp: { min: 10, max: 25 },
    waterNeed: 'low',
    sowingSeasons: ['october', 'november'],
    stages: [
      { name: 'Sowing', duration: 1, daysFromStart: 0, description: 'Seed planting', icon: '🌱',
        actions: [{ type: 'sowing', description: 'Broadcast or drill seeds', priority: 'high' }],
        weatherRequirements: { temperature: { min: 10, max: 20 }, rainfall: { min: 0, max: 10 }, description: 'Cool season' } },
      { name: 'Germination', duration: 5, daysFromStart: 1, description: 'Seedling emergence', icon: '🌱',
        actions: [{ type: 'irrigation', description: 'Light irrigation', priority: 'medium' }],
        weatherRequirements: { temperature: { min: 15, max: 22 }, rainfall: { min: 5, max: 15 }, description: 'Cool and moist' } },
      { name: 'Vegetative', duration: 30, daysFromStart: 6, description: 'Rosette formation', icon: '🌿',
        actions: [{ type: 'fertilizer', description: 'Apply nitrogen', priority: 'high' }, { type: 'weeding', description: 'One weeding', priority: 'medium' }],
        weatherRequirements: { temperature: { min: 15, max: 25 }, rainfall: { min: 10, max: 30 }, description: 'Cool, dry' } },
      { name: 'Flowering', duration: 30, daysFromStart: 36, description: 'Flowering period', icon: '🌻',
        actions: [{ type: 'irrigation', description: 'One irrigation during flowering', priority: 'medium' }],
        weatherRequirements: { temperature: { min: 18, max: 28 }, rainfall: { min: 10, max: 25 }, description: 'Warm, sunny days' } },
      { name: 'Pod Formation', duration: 20, daysFromStart: 66, description: 'Siliqua development', icon: '🌾',
        actions: [{ type: 'monitoring', description: 'Check for aphids', priority: 'medium' }],
        weatherRequirements: { temperature: { min: 20, max: 30 }, rainfall: { min: 5, max: 20 }, description: 'Warm and dry' } },
      { name: 'Maturation', duration: 4, daysFromStart: 86, description: 'Pod drying', icon: '🌾',
        actions: [{ type: 'monitoring', description: 'Check pod color', priority: 'high' }],
        weatherRequirements: { temperature: { min: 22, max: 32 }, rainfall: { min: 0, max: 5 }, description: 'Dry weather' } },
      { name: 'Harvest', duration: 1, daysFromStart: 90, description: 'Ready to harvest', icon: '🚜',
        actions: [{ type: 'harvest', description: 'Cut when pods turn yellow-brown', priority: 'high' }],
        weatherRequirements: { temperature: { min: 20, max: 35 }, rainfall: { min: 0, max: 0 }, description: 'Dry conditions' } }
    ]
  },

  sunflower: {
    name: 'Sunflower',
    icon: '🌻',
    category: 'Oilseed',
    climateZones: ['temperate', 'subtropical', 'mediterranean'],
    totalDuration: 90,
    optimalTemp: { min: 20, max: 30 },
    waterNeed: 'medium',
    sowingSeasons: ['february', 'march', 'july', 'august'],
    stages: [
      { name: 'Sowing', duration: 1, daysFromStart: 0, description: 'Seed planting', icon: '🌱',
        actions: [{ type: 'sowing', description: 'Plant seeds 3-5cm deep', priority: 'high' }],
        weatherRequirements: { temperature: { min: 20, max: 28 }, rainfall: { min: 0, max: 10 }, description: 'Warm season' } },
      { name: 'Germination', duration: 7, daysFromStart: 1, description: 'Seedling emergence', icon: '🌱',
        actions: [{ type: 'irrigation', description: 'Light irrigation', priority: 'high' }],
        weatherRequirements: { temperature: { min: 22, max: 28 }, rainfall: { min: 10, max: 20 }, description: 'Warm and moist' } },
      { name: 'Vegetative', duration: 30, daysFromStart: 8, description: 'Leaf and stem growth', icon: '🌿',
        actions: [{ type: 'fertilizer', description: 'Apply nitrogen', priority: 'high' }, { type: 'weeding', description: 'Weed control', priority: 'medium' }],
        weatherRequirements: { temperature: { min: 24, max: 32 }, rainfall: { min: 20, max: 50 }, description: 'Warm, moderate rain' } },
      { name: 'Bud Formation', duration: 15, daysFromStart: 38, description: 'Flower bud development', icon: '🌻',
        actions: [{ type: 'irrigation', description: 'Critical water stage', priority: 'high' }],
        weatherRequirements: { temperature: { min: 25, max: 32 }, rainfall: { min: 30, max: 60 }, description: 'Adequate moisture' } },
      { name: 'Flowering', duration: 15, daysFromStart: 53, description: 'Blooming period', icon: '🌻',
        actions: [{ type: 'monitoring', description: 'Check for pests', priority: 'medium' }],
        weatherRequirements: { temperature: { min: 24, max: 30 }, rainfall: { min: 10, max: 30 }, description: 'Sunny days' } },
      { name: 'Seed Formation', duration: 18, daysFromStart: 68, description: 'Seed filling', icon: '🌻',
        actions: [{ type: 'irrigation', description: 'Maintain moisture', priority: 'high' }],
        weatherRequirements: { temperature: { min: 25, max: 35 }, rainfall: { min: 20, max: 40 }, description: 'Warm weather' } },
      { name: 'Maturation', duration: 4, daysFromStart: 86, description: 'Seed drying', icon: '🌻',
        actions: [{ type: 'monitoring', description: 'Check seed moisture', priority: 'high' }],
        weatherRequirements: { temperature: { min: 25, max: 35 }, rainfall: { min: 0, max: 10 }, description: 'Dry, sunny' } },
      { name: 'Harvest', duration: 1, daysFromStart: 90, description: 'Ready to harvest', icon: '🚜',
        actions: [{ type: 'harvest', description: 'Cut when back of head turns yellow', priority: 'high' }],
        weatherRequirements: { temperature: { min: 22, max: 35 }, rainfall: { min: 0, max: 0 }, description: 'Dry weather' } }
    ]
  }
};

/**
 * Climate zone classification based on coordinates
 * @param {number} latitude
 * @param {number} longitude
 * @returns {string[]} Array of applicable climate zones
 */
export const getClimateZones = (latitude, longitude) => {
  const zones = [];
  const absLat = Math.abs(latitude);
  
  // Tropical (0-23.5°)
  if (absLat <= 23.5) {
    zones.push('tropical');
  }
  
  // Subtropical (23.5-35°)
  if (absLat > 20 && absLat <= 40) {
    zones.push('subtropical');
  }
  
  // Humid subtropical (specific regions)
  if ((absLat > 25 && absLat <= 35) && (longitude > 60 && longitude < 130)) {
    zones.push('humid-subtropical');
  }
  
  // Temperate (35-60°)
  if (absLat > 30 && absLat <= 60) {
    zones.push('temperate');
  }
  
  // Mediterranean (30-45° specific regions)
  if (absLat >= 30 && absLat <= 45) {
    if ((longitude >= -10 && longitude <= 40) || // Mediterranean basin
        (longitude >= -125 && longitude <= -115) || // California
        (longitude >= 115 && longitude <= 125)) { // Southern Australia
      zones.push('mediterranean');
    }
  }
  
  // Arid/Semi-arid (based on specific regions)
  if ((absLat >= 15 && absLat <= 35) && 
      ((longitude >= 20 && longitude <= 75) || // MENA, South Asia
       (longitude >= -120 && longitude <= -100))) { // US Southwest
    zones.push('arid');
  }
  
  // Continental (40-60° inland regions)
  if (absLat >= 40 && absLat <= 60 && Math.abs(longitude) > 60) {
    zones.push('continental');
  }
  
  // Default fallback
  if (zones.length === 0) {
    zones.push('temperate');
  }
  
  return zones;
};

/**
 * Get crops suitable for a specific location
 * @param {number} latitude
 * @param {number} longitude
 * @returns {Array} List of crop IDs suitable for this location
 */
export const getCropsForLocation = (latitude, longitude) => {
  const locationZones = getClimateZones(latitude, longitude);
  
  return Object.keys(CROP_DATABASE).filter(cropId => {
    const crop = CROP_DATABASE[cropId];
    // Check if any of the crop's climate zones match the location's zones
    return crop.climateZones.some(zone => locationZones.includes(zone));
  });
};

/**
 * Get current crop stage based on planting date
 */
export const getCurrentStage = (cropType, plantingDate) => {
  const crop = CROP_DATABASE[cropType];
  if (!crop) return null;

  const today = new Date();
  const plantDate = new Date(plantingDate);
  const daysElapsed = Math.floor((today - plantDate) / (1000 * 60 * 60 * 24));

  if (daysElapsed < 0) {
    return {
      stage: null,
      daysIntoStage: Math.abs(daysElapsed),
      status: 'upcoming',
      message: `Planting scheduled in ${Math.abs(daysElapsed)} days`
    };
  }

  if (daysElapsed > crop.totalDuration) {
    return {
      stage: crop.stages[crop.stages.length - 1],
      daysIntoStage: daysElapsed - crop.totalDuration,
      status: 'completed',
      message: 'Crop cycle completed'
    };
  }

  // Find current stage
  for (let i = 0; i < crop.stages.length; i++) {
    const stage = crop.stages[i];
    const stageEnd = stage.daysFromStart + stage.duration;
    
    if (daysElapsed >= stage.daysFromStart && daysElapsed < stageEnd) {
      return {
        stage,
        stageIndex: i,
        daysIntoStage: daysElapsed - stage.daysFromStart,
        daysRemaining: stageEnd - daysElapsed,
        progress: ((daysElapsed - stage.daysFromStart) / stage.duration) * 100,
        status: 'active'
      };
    }
  }

  return null;
};

/**
 * Get next recommended actions based on current stage and weather
 */
export const getNextActions = (cropType, plantingDate, weatherData) => {
  const currentStage = getCurrentStage(cropType, plantingDate);
  if (!currentStage || !currentStage.stage) return [];

  const { stage, daysIntoStage } = currentStage;
  const actions = [];

  // Get actions for current stage
  stage.actions.forEach(action => {
    const actionDay = action.dayOffset || 0;
    const daysUntilAction = actionDay - daysIntoStage;

    let urgency = 'upcoming';
    if (daysUntilAction <= 0) urgency = 'now';
    else if (daysUntilAction <= 3) urgency = 'soon';

    actions.push({
      ...action,
      daysUntilAction,
      urgency,
      weatherSuitable: checkWeatherSuitability(action, stage, weatherData)
    });
  });

  // Sort by urgency and days until action
  actions.sort((a, b) => {
    const urgencyOrder = { now: 0, soon: 1, upcoming: 2 };
    if (urgencyOrder[a.urgency] !== urgencyOrder[b.urgency]) {
      return urgencyOrder[a.urgency] - urgencyOrder[b.urgency];
    }
    return a.daysUntilAction - b.daysUntilAction;
  });

  return actions;
};

/**
 * Check if weather is suitable for an action
 */
const checkWeatherSuitability = (action, stage, weatherData) => {
  if (!weatherData || !weatherData.current || !stage.weatherRequirements) {
    return { suitable: true, reason: 'Weather data unavailable' };
  }

  const { current, daily } = weatherData;
  const requirements = stage.weatherRequirements;

  // Check temperature
  if (current.temperature < requirements.temperature.min) {
    return { 
      suitable: false, 
      reason: `Too cold (${current.temperature}°C, need ${requirements.temperature.min}°C+)` 
    };
  }
  if (current.temperature > requirements.temperature.max) {
    return { 
      suitable: false, 
      reason: `Too hot (${current.temperature}°C, need below ${requirements.temperature.max}°C)` 
    };
  }

  // Check rainfall for specific actions
  if (action.type === 'sowing' || action.type === 'transplanting' || action.type === 'harvest') {
    if (daily && daily[0]) {
      const todayRain = daily[0].precipitationProbability;
      if (todayRain > 50) {
        return {
          suitable: false,
          reason: `Rain expected (${todayRain}% probability)`
        };
      }
    }
  }

  // Check for pesticide/fertilizer application
  if (action.type === 'pesticide' || action.type === 'fertilizer') {
    if (current.windSpeed > 15) {
      return {
        suitable: false,
        reason: `Too windy (${current.windSpeed} km/h)`
      };
    }
  }

  return { suitable: true, reason: 'Weather conditions favorable' };
};

/**
 * Generate complete crop timeline
 */
export const getCropTimeline = (cropType, plantingDate) => {
  const crop = CROP_DATABASE[cropType];
  if (!crop) return null;

  const plantDate = new Date(plantingDate);
  const timeline = [];

  crop.stages.forEach((stage, index) => {
    const stageStart = new Date(plantDate);
    stageStart.setDate(stageStart.getDate() + stage.daysFromStart);
    
    const stageEnd = new Date(stageStart);
    stageEnd.setDate(stageEnd.getDate() + stage.duration);

    timeline.push({
      ...stage,
      stageIndex: index,
      startDate: stageStart,
      endDate: stageEnd,
      actions: stage.actions.map(action => ({
        ...action,
        actionDate: action.dayOffset 
          ? new Date(stageStart.getTime() + action.dayOffset * 24 * 60 * 60 * 1000)
          : stageStart
      }))
    });
  });

  return {
    crop,
    plantingDate: plantDate,
    expectedHarvest: timeline[timeline.length - 1].endDate,
    totalDuration: crop.totalDuration,
    timeline
  };
};

/**
 * Get sowing window recommendation based on crop and location
 */
export const getSowingWindow = (cropType, currentDate = new Date()) => {
  const crop = CROP_DATABASE[cropType];
  if (!crop) return null;

  const currentMonth = currentDate.toLocaleString('en-US', { month: 'long' }).toLowerCase();
  const isOptimalMonth = crop.sowingSeasons.includes(currentMonth);

  const nextOptimalMonth = crop.sowingSeasons.find(month => {
    const monthIndex = ['january', 'february', 'march', 'april', 'may', 'june', 
                       'july', 'august', 'september', 'october', 'november', 'december'].indexOf(month);
    const currentMonthIndex = currentDate.getMonth();
    return monthIndex >= currentMonthIndex;
  });

  return {
    cropType,
    cropName: crop.name,
    optimalMonths: crop.sowingSeasons,
    isOptimalNow: isOptimalMonth,
    currentMonth,
    nextOptimalMonth: nextOptimalMonth || crop.sowingSeasons[0],
    recommendation: isOptimalMonth 
      ? `Now is an optimal time to plant ${crop.name}!`
      : `Wait for ${nextOptimalMonth || crop.sowingSeasons[0]} for optimal planting`,
    optimalTemp: crop.optimalTemp,
    waterNeed: crop.waterNeed
  };
};

/**
 * Get all available crops (optionally filtered by location)
 * @param {number} latitude - Optional latitude for location-based filtering
 * @param {number} longitude - Optional longitude for location-based filtering
 * @returns {Array} List of available crops
 */
export const getAvailableCrops = (latitude = null, longitude = null) => {
  let cropIds = Object.keys(CROP_DATABASE);
  
  // Filter by location if coordinates provided
  if (latitude !== null && longitude !== null) {
    cropIds = getCropsForLocation(latitude, longitude);
  }
  
  return cropIds.map(key => ({
    id: key,
    name: CROP_DATABASE[key].name,
    icon: CROP_DATABASE[key].icon,
    category: CROP_DATABASE[key].category,
    duration: CROP_DATABASE[key].totalDuration,
    climateZones: CROP_DATABASE[key].climateZones
  }));
};

/**
 * Get crop recommendations based on current weather and season
 * @param {Object} weatherData - Current weather and forecast data (with location.latitude and location.longitude)
 * @param {Date} currentDate - Current date (defaults to now)
 * @returns {Array} Sorted list of recommended crops with suitability scores
 */
export const getRecommendedCrops = (weatherData, currentDate = new Date()) => {
  if (!weatherData || !weatherData.current) {
    return [];
  }

  const currentMonth = currentDate.toLocaleString('en-US', { month: 'long' }).toLowerCase();
  const currentTemp = weatherData.current.temperature;
  const avgForecastTemp = weatherData.daily 
    ? weatherData.daily.slice(0, 7).reduce((sum, day) => sum + ((day.maxTemp + day.minTemp) / 2), 0) / 7
    : currentTemp;
  const totalRainfall = weatherData.daily
    ? weatherData.daily.slice(0, 7).reduce((sum, day) => sum + (day.precipitation || 0), 0)
    : 0;

  // Get crops suitable for this location
  let cropKeys = Object.keys(CROP_DATABASE);
  if (weatherData.location && weatherData.location.latitude && weatherData.location.longitude) {
    cropKeys = getCropsForLocation(weatherData.location.latitude, weatherData.location.longitude);
  }

  const recommendations = cropKeys.map(cropKey => {
    const crop = CROP_DATABASE[cropKey];
    let score = 0;
    const reasons = [];
    const warnings = [];

    // 1. Season Suitability (40 points max)
    const isOptimalMonth = crop.sowingSeasons.includes(currentMonth);
    if (isOptimalMonth) {
      score += 40;
      reasons.push(`✓ Optimal planting season (${currentMonth})`);
    } else {
      // Check if within 1 month of optimal season
      const currentMonthIndex = currentDate.getMonth();
      const optimalMonthIndices = crop.sowingSeasons.map(m => 
        ['january', 'february', 'march', 'april', 'may', 'june', 
         'july', 'august', 'september', 'october', 'november', 'december'].indexOf(m)
      );
      const nearOptimal = optimalMonthIndices.some(i => 
        Math.abs(i - currentMonthIndex) <= 1 || Math.abs(i - currentMonthIndex) >= 11
      );
      if (nearOptimal) {
        score += 20;
        reasons.push(`≈ Near optimal season`);
      } else {
        score -= 20;
        warnings.push(`⚠ Not ideal season (best: ${crop.sowingSeasons.join(', ')})`);
      }
    }

    // 2. Temperature Suitability (35 points max)
    const tempMin = crop.optimalTemp.min;
    const tempMax = crop.optimalTemp.max;
    const tempMid = (tempMin + tempMax) / 2;
    const tempRange = tempMax - tempMin;

    if (avgForecastTemp >= tempMin && avgForecastTemp <= tempMax) {
      // Perfect temperature range
      const deviationFromIdeal = Math.abs(avgForecastTemp - tempMid);
      const tempScore = 35 - (deviationFromIdeal / tempRange) * 10;
      score += tempScore;
      reasons.push(`✓ Ideal temperature (${Math.round(avgForecastTemp)}°C)`);
    } else if (avgForecastTemp < tempMin) {
      const deviation = tempMin - avgForecastTemp;
      if (deviation <= 5) {
        score += 15;
        warnings.push(`⚠ Slightly cold (${Math.round(avgForecastTemp)}°C, needs ${tempMin}-${tempMax}°C)`);
      } else {
        score -= 10;
        warnings.push(`✗ Too cold (${Math.round(avgForecastTemp)}°C, needs ${tempMin}-${tempMax}°C)`);
      }
    } else {
      const deviation = avgForecastTemp - tempMax;
      if (deviation <= 5) {
        score += 15;
        warnings.push(`⚠ Slightly warm (${Math.round(avgForecastTemp)}°C, needs ${tempMin}-${tempMax}°C)`);
      } else {
        score -= 10;
        warnings.push(`✗ Too hot (${Math.round(avgForecastTemp)}°C, needs ${tempMin}-${tempMax}°C)`);
      }
    }

    // 3. Water Availability (25 points max)
    const waterNeeds = {
      'low': { min: 0, max: 30 },
      'medium': { min: 20, max: 60 },
      'high': { min: 40, max: 100 }
    };
    const needRange = waterNeeds[crop.waterNeed];

    if (totalRainfall >= needRange.min && totalRainfall <= needRange.max) {
      score += 25;
      reasons.push(`✓ Adequate rainfall (${Math.round(totalRainfall)}mm expected)`);
    } else if (totalRainfall < needRange.min) {
      score += 10;
      warnings.push(`⚠ Low rainfall - irrigation needed (${Math.round(totalRainfall)}mm)`);
    } else {
      score += 15;
      warnings.push(`⚠ High rainfall - ensure good drainage (${Math.round(totalRainfall)}mm)`);
    }

    // Determine suitability level
    let suitability = 'not-recommended';
    let suitabilityLabel = 'Not Recommended';
    let suitabilityColor = 'gray';

    if (score >= 80) {
      suitability = 'excellent';
      suitabilityLabel = 'Excellent';
      suitabilityColor = 'green';
    } else if (score >= 60) {
      suitability = 'good';
      suitabilityLabel = 'Good';
      suitabilityColor = 'blue';
    } else if (score >= 40) {
      suitability = 'fair';
      suitabilityLabel = 'Fair';
      suitabilityColor = 'yellow';
    } else if (score >= 20) {
      suitability = 'poor';
      suitabilityLabel = 'Poor';
      suitabilityColor = 'orange';
    } else {
      suitability = 'not-recommended';
      suitabilityLabel = 'Not Recommended';
      suitabilityColor = 'red';
    }

    return {
      cropId: cropKey,
      cropName: crop.name,
      icon: crop.icon,
      category: crop.category,
      score: Math.max(0, Math.min(100, score)),
      suitability,
      suitabilityLabel,
      suitabilityColor,
      reasons,
      warnings,
      optimalTemp: crop.optimalTemp,
      waterNeed: crop.waterNeed,
      sowingSeasons: crop.sowingSeasons,
      duration: crop.totalDuration,
      isOptimalSeason: isOptimalMonth
    };
  });

  // Sort by score (highest first)
  return recommendations.sort((a, b) => b.score - a.score);
};

export default {
  CROP_DATABASE,
  getCurrentStage,
  getNextActions,
  getCropTimeline,
  getSowingWindow,
  getAvailableCrops,
  getRecommendedCrops,
  getClimateZones,
  getCropsForLocation
};

