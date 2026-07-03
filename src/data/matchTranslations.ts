export interface MatchTranslations {
  landingTitle: string;
  landingDesc: string;
  landingCTA: string;
  landingTitle2: string;
  stepOf: string;
  next: string;
  back: string;
  finish: string;
  reasonsQuestion: string;
  reasonsSub: string;
  preferencesQuestion: string;
  preferencesSub: string;
  avoidancesQuestion: string;
  avoidancesSub: string;
  budgetQuestion: string;
  budgetSub: string;
  durationQuestion: string;
  durationSub: string;
  commuteCheckQuestion: string;
  commuteCheckSub: string;
  workplaceQuestion: string;
  workplaceSub: string;
  limitCommute: string;
  yesSpecify: string;
  noSpecify: string;
  analysisComplete: string;
  idCard: string;
  areaMatches: string;
  dayIn: string;
  avgRent: string;
  transitStation: string;
  topHighlights: string;
  resultOfAutoFinder: string;
  matchingProperties: string;
  noListings: string;
  mapLayerTitle: string;
  mapLayerSub: string;
  suitabilityScale: string;
  suitabilityHigh: string;
  suitabilityMed: string;
  suitabilityLow: string;
  workplacePin: string;
  
  // Option lists lookups
  reasons: Record<string, string>;
  preferences: Record<string, string>;
  avoidances: Record<string, string>;
  durations: Record<string, string>;
  destinations: Record<string, string>;
}

export const T_MATCH: Record<"en" | "th" | "zh", MatchTranslations> = {
  en: {
    landingTitle: "Where Would You Belong in Bangkok?",
    landingDesc: "Answer 7 simple lifestyle questions and our algorithm will rank Bangkok's {count} major neighborhoods and match you with properties tailored for you.",
    landingCTA: "Begin Auto Finder →",
    landingTitle2: "Auto Finder",
    stepOf: "Step {step} of 6",
    next: "Next",
    back: "Back",
    finish: "Generate Lifestyle Profile",
    reasonsQuestion: "Why are you coming to Bangkok?",
    reasonsSub: "Select all reasons that apply to save as your relocation intent.",
    preferencesQuestion: "What are your lifestyle preferences?",
    preferencesSub: "Select up to 5 preferences to prioritize in neighborhood matchmaking.",
    avoidancesQuestion: "What do you want to avoid?",
    avoidancesSub: "Select features you dislike to exclude mismatching neighborhoods.",
    budgetQuestion: "What is your target monthly rental budget?",
    budgetSub: "This filters property matches within your financial preferences.",
    durationQuestion: "How long are you planning to stay?",
    durationSub: "Helps us filter contract lengths (short stay vs. long term).",
    commuteCheckQuestion: "Do you have a specific office, university, or daily destination?",
    commuteCheckSub: "We'll calculate real-time transit commutes to this place.",
    workplaceQuestion: "Search or select your daily destination",
    workplaceSub: "Enter an address, landmark, or select from popular hubs below.",
    limitCommute: "Limit commute to",
    yesSpecify: "Yes, calculate transit commutes",
    noSpecify: "No, I work remotely / just exploring",
    analysisComplete: "Analysis Complete",
    idCard: "Resident Identity Card",
    areaMatches: "Neighborhood Lifestyle Scores",
    dayIn: "A Day in {name}",
    avgRent: "Avg Rent",
    transitStation: "Transit station",
    topHighlights: "Neighborhood Highlights",
    resultOfAutoFinder: "Result of Auto Finder",
    matchingProperties: "Recommended Condos in {name}",
    noListings: "No active listings in this area.",
    mapLayerTitle: "Interactive Match Map",
    mapLayerSub: "Select a layer to view suitability overlays",
    suitabilityScale: "Suitability Scale",
    suitabilityHigh: "High Match",
    suitabilityMed: "Moderate Fit",
    suitabilityLow: "Low Match",
    workplacePin: "Workplace Pin",
    reasons: {
      "Vacation / Long Stay": "Vacation / Long Stay",
      "Remote Work": "Remote Work",
      "New Job": "New Job",
      "Business / Entrepreneur": "Business / Entrepreneur",
      "Study": "Study",
      "Family Relocation": "Family Relocation",
      "Pet-Friendly Lifestyle": "Pet-Friendly Lifestyle",
      "Luxury Lifestyle": "Luxury Lifestyle",
      "Just Exploring Bangkok": "Just Exploring Bangkok"
    },
    preferences: {
      "☕ Cafe Culture": "☕ Cafe Culture",
      "🌳 Quiet & Peaceful": "🌳 Quiet & Peaceful",
      "🚆 Excellent Public Transport": "🚆 Excellent Public Transport",
      "🏙 City Center": "🏙 City Center",
      "🍸 Nightlife": "🍸 Nightlife",
      "🛍 Shopping": "🛍 Shopping",
      "💻 Coworking Spaces": "💻 Coworking Spaces",
      "👨‍👩‍👧 Family Friendly": "👨‍👩‍👧 Family Friendly",
      "🐶 Pet Friendly": "🐶 Pet Friendly",
      "🏃 Fitness Lifestyle": "🏃 Fitness Lifestyle",
      "🌍 International Community": "🌍 International Community",
      "🇯🇵 Japanese Community": "🇯🇵 Japanese Community",
      "🇨🇳 Chinese Community": "🇨🇳 Chinese Community",
      "🌿 Parks & Green Spaces": "🌿 Parks & Green Spaces",
      "🍜 Local Thai Culture": "🍜 Local Thai Culture",
      "🏆 Luxury Living": "🏆 Luxury Living",
      "🚶 Walkability": "🚶 Walkability",
      "🏖 Relaxed Lifestyle": "🏖 Relaxed Lifestyle"
    },
    avoidances: {
      "Heavy Traffic": "Heavy Traffic",
      "Noise": "Noise",
      "Nightlife": "Nightlife",
      "Tourist Crowds": "Tourist Crowds",
      "Long Commutes": "Long Commutes",
      "Expensive Areas": "Expensive Areas",
      "Dense High-Rise Areas": "Dense High-Rise Areas",
      "Busy City Centers": "Busy City Centers"
    },
    durations: {
      "1-3 Months": "1-3 Months",
      "3-6 Months": "3-6 Months",
      "6-12 Months": "6-12 Months",
      "1 Year+": "1 Year+",
      "Permanent Relocation": "Permanent Relocation"
    },
    destinations: {
      "None / Not working": "None / Not working",
      "One Bangkok": "One Bangkok",
      "Sathorn": "Sathorn",
      "Silom": "Silom",
      "Asoke": "Asoke",
      "Chulalongkorn University": "Chulalongkorn University",
      "Custom Location": "Custom Location"
    }
  },
  th: {
    landingTitle: "คุณเหมาะที่จะอยู่ย่านไหนในกรุงเทพฯ?",
    landingDesc: "ตอบคำถามไลฟ์สไตล์ง่ายๆ 7 ข้อ แล้วอัลกอริทึมของเราจะจัดอันดับ {count} ย่านสำคัญในกรุงเทพฯ พร้อมทั้งจับคู่กับคอนโดและบ้านที่ตรงใจสำหรับคุณ",
    landingCTA: "เริ่มค้นหาย่านที่ใช่ของคุณ →",
    landingTitle2: "ระบบค้นหาย่านอัตโนมัติ (Auto Finder)",
    stepOf: "ขั้นตอนที่ {step} จาก 6",
    next: "ถัดไป",
    back: "ย้อนกลับ",
    finish: "สร้างโปรไฟล์ไลฟ์สไตล์",
    reasonsQuestion: "ทำไมคุณถึงต้องการย้ายมาอยู่กรุงเทพฯ?",
    reasonsSub: "เลือกเหตุผลทั้งหมดที่เกี่ยวข้องกับจุดประสงค์การย้ายที่อยู่ของคุณ",
    preferencesQuestion: "ไลฟ์สไตล์ที่คุณชื่นชอบคืออะไร?",
    preferencesSub: "เลือกไลฟ์สไตล์ที่คุณให้ความสำคัญสูงสุดไม่เกิน 5 ข้อ",
    avoidancesQuestion: "สิ่งที่คุณต้องการหลีกเลี่ยงคืออะไร?",
    avoidancesSub: "เลือกสิ่งที่คุณไม่ชอบเพื่อคัดย่านที่ไม่ตรงใจออกไป",
    budgetQuestion: "งบประมาณค่าเช่ารายเดือนที่คุณต้องการคือเท่าใด?",
    budgetSub: "นี่ช่วยกรองอสังหาริมทรัพย์ที่สอดคล้องกับงบประมาณของคุณ",
    durationQuestion: "คุณวางแผนที่จะพำนักอยู่นานเท่าใด?",
    durationSub: "ช่วยเรากรองระยะเวลาสัญญาเช่า (ระยะสั้นเทียบกับระยะยาว)",
    commuteCheckQuestion: "คุณมีสถานที่ทำงาน มหาวิทยาลัย หรือเป้าหมายการเดินทางในทุกๆ วันหรือไม่?",
    commuteCheckSub: "เราจะช่วยคำนวณระยะเวลาการเดินทางตามเวลาจริงจากย่านที่อยู่ไปยังสถานที่นั้น",
    workplaceQuestion: "ค้นหาหรือเลือกจุดหมายการเดินทางประจำวันของคุณ",
    workplaceSub: "ระบุที่อยู่ สถานที่สำคัญ หรือเลือกศูนย์กลางการเดินทางที่ยอดนิยมด้านล่าง",
    limitCommute: "จำกัดเวลาเดินทางไม่เกิน",
    yesSpecify: "ใช่, คำนวณระยะเวลาการเดินทาง",
    noSpecify: "ไม่, ฉันทำงานทางไกล / แค่สำรวจเมือง",
    analysisComplete: "วิเคราะห์ข้อมูลสำเร็จ",
    idCard: "บัตรประจำตัวผู้อยู่อาศัย (Resident Identity)",
    areaMatches: "คะแนนไลฟ์สไตล์ของแต่ละย่าน",
    dayIn: "หนึ่งวันในย่าน {name}",
    avgRent: "ค่าเช่าเฉลี่ย",
    transitStation: "สถานีขนส่งสาธารณะ",
    topHighlights: "จุดเด่นที่น่าสนใจของย่าน",
    resultOfAutoFinder: "ผลลัพธ์จาก Auto Finder",
    matchingProperties: "คอนโดแนะนำในย่าน {name}",
    noListings: "ขณะนี้ไม่มีรายการประกาศที่ว่างในย่านนี้",
    mapLayerTitle: "แผนที่วิเคราะห์ความเหมาะสม",
    mapLayerSub: "เลือกเลเยอร์เพื่อแสดงระดับความเหมาะสมบนแผนที่",
    suitabilityScale: "ระดับความเหมาะสม",
    suitabilityHigh: "เหมาะสมสูง",
    suitabilityMed: "เหมาะสมปานกลาง",
    suitabilityLow: "เหมาะสมต่ำ",
    workplacePin: "ปักหมุดที่ทำงาน",
    reasons: {
      "Vacation / Long Stay": "พักร้อน / พักผ่อนระยะยาว",
      "Remote Work": "ทำงานทางไกล",
      "New Job": "เริ่มงานใหม่",
      "Business / Entrepreneur": "ธุรกิจ / ผู้ประกอบการ",
      "Study": "ศึกษาต่อ",
      "Family Relocation": "ย้ายครอบครัว",
      "Pet-Friendly Lifestyle": "ไลฟ์สไตล์คนรักสัตว์",
      "Luxury Lifestyle": "ไลฟ์สไตล์ระดับหรู",
      "Just Exploring Bangkok": "แค่กำลังสำรวจกรุงเทพฯ"
    },
    preferences: {
      "☕ Cafe Culture": "☕ วัฒนธรรมคาเฟ่",
      "🌳 Quiet & Peaceful": "🌳 เงียบสงบ & ร่มรื่น",
      "🚆 Excellent Public Transport": "🚆 ติดรถไฟฟ้า & เดินทางสะดวก",
      "🏙 City Center": "🏙 ใจกลางเมืองหลวง",
      "🍸 Nightlife": "🍸 แหล่งท่องเที่ยวกลางคืน",
      "🛍 Shopping": "🛍 แหล่งช้อปปิ้ง & ห้างใหญ่",
      "💻 Coworking Spaces": "💻 โคเวิร์คกิ้งสเปซ",
      "👨‍👩‍👧 Family Friendly": "👨‍👩‍👧 เหมาะสำหรับครอบครัว",
      "🐶 Pet Friendly": "🐶 อนุญาตให้เลี้ยงสัตว์",
      "🏃 Fitness Lifestyle": "🏃 ชอบออกกำลังกาย/ฟิตเนส",
      "🌍 International Community": "🌍 สังคมชาวต่างชาติ",
      "🇯🇵 Japanese Community": "🇯🇵 ชุมชนชาวญี่ปุ่น",
      "🇨🇳 Chinese Community": "🇨🇳 ชุมชนชาวจีน",
      "🌿 Parks & Green Spaces": "🌿 สวนสาธารณะ & พื้นที่สีเขียว",
      "🍜 Local Thai Culture": "🍜 วัฒนธรรมและอาหารท้องถิ่น",
      "🏆 Luxury Living": "🏆 ย่านหรูหราไฮเอนด์",
      "🚶 Walkability": "🚶 เดินเท้าสะดวกสบาย",
      "🏖 Relaxed Lifestyle": "🏖 ไลฟ์สไตล์เรียบง่ายผ่อนคลาย"
    },
    avoidances: {
      "Heavy Traffic": "รถติดรุนแรง",
      "Noise": "เสียงรบกวน",
      "Nightlife": "สถานบันเทิงยามค่ำคืน",
      "Tourist Crowds": "ความแออัดของนักท่องเที่ยว",
      "Long Commutes": "การเดินทางไกลเกินไป",
      "Expensive Areas": "ค่าครองชีพหรือค่าเช่าที่แพงเกินไป",
      "Dense High-Rise Areas": "ย่านตึกสูงหนาแน่นเกินไป",
      "Busy City Centers": "ความวุ่นวายใจกลางเมือง"
    },
    durations: {
      "1-3 Months": "1-3 เดือน",
      "3-6 Months": "3-6 เดือน",
      "6-12 Months": "6-12 เดือน",
      "1 Year+": "1 ปีขึ้นไป",
      "Permanent Relocation": "ย้ายถิ่นฐานถาวร"
    },
    destinations: {
      "None / Not working": "ไม่มี / ไม่ได้ทำงาน",
      "One Bangkok": "วัน แบงค็อก",
      "Sathorn": "สาทร",
      "Silom": "สีลม",
      "Asoke": "อโศก",
      "Chulalongkorn University": "จุฬาลงกรณ์มหาวิทยาลัย",
      "Custom Location": "ระบุจุดหมายเอง"
    }
  },
  zh: {
    landingTitle: "您最适合居住在曼谷哪个社区？",
    landingDesc: "回答 7 个简单的生活方式问题，我们的智能算法将为您对曼谷 {count} 个主要社区进行匹配度排序，并推荐最贴合您需求的房源。",
    landingCTA: "开始自动匹配社区 →",
    landingTitle2: "社区智能匹配 (Auto Finder)",
    stepOf: "步骤 {step} / 6",
    next: "下一步",
    back: "上一步",
    finish: "生成生活方式画像",
    reasonsQuestion: "您搬到曼谷的主要原因是什么？",
    reasonsSub: "选择所有适用的原因，以保存为您在曼谷的生活规划。",
    preferencesQuestion: "您偏好的社区生活方式有哪些？",
    preferencesSub: "选择最多 5 个在社区匹配中优先考虑的特征偏好。",
    avoidancesQuestion: "在日常生活中您最想避开什么？",
    avoidancesSub: "选择您不喜欢的社区特征，以排除不匹配的邻里社区。",
    budgetQuestion: "您的预期月租金预算是多少？",
    budgetSub: "这有助于我们在您理想的财务范围内筛选出精选房源。",
    durationQuestion: "您计划在曼谷居住多久？",
    durationSub: "这能帮助我们筛选适合的租约类型（短期入住 vs. 长期租赁）。",
    commuteCheckQuestion: "您有需要每天通勤的公司、学校或固定通勤目的地吗？",
    commuteCheckSub: "我们将为您计算该点到各个邻近社区的真实捷运通勤时间。",
    workplaceQuestion: "搜索或选择您的每日通勤目的地",
    workplaceSub: "输入地址、地标，或从下方推荐的常用目的地中心选择。",
    limitCommute: "限制通勤时间在",
    yesSpecify: "是的，计算具体通勤时间",
    noSpecify: "不用了，我远程办公 / 纯粹探索城市",
    analysisComplete: "生活方式分析完成",
    idCard: "居民特质卡 (Resident Identity Card)",
    areaMatches: "社区生活方式匹配得分",
    dayIn: "{name} 社区的一天",
    avgRent: "平均租金",
    transitStation: "最近捷运站点",
    topHighlights: "社区主要亮点",
    resultOfAutoFinder: "智能社区匹配结果",
    matchingProperties: "{name} 社区推荐房源",
    noListings: "当前该区域暂无可用房源。",
    mapLayerTitle: "互动匹配分析地图",
    mapLayerSub: "选择一个分析图层以查看各维度的匹配度热力分布",
    suitabilityScale: "匹配度图例",
    suitabilityHigh: "极高匹配",
    suitabilityMed: "中等符合",
    suitabilityLow: "匹配度较低",
    workplacePin: "通勤目的地标记",
    reasons: {
      "Vacation / Long Stay": "度假 / 长期 stay",
      "Remote Work": "远程办公 / 数字游民",
      "New Job": "入职新工作",
      "Business / Entrepreneur": "商务 / 创业发展",
      "Study": "求学 / 留学深造",
      "Family Relocation": "家庭移居",
      "Pet-Friendly Lifestyle": "携带宠物的家庭",
      "Luxury Lifestyle": "高品质奢华生活",
      "Just Exploring Bangkok": "纯粹探索曼谷"
    },
    preferences: {
      "☕ Cafe Culture": "☕ 咖啡馆文化",
      "🌳 Quiet & Peaceful": "🌳 安静与祥和环境",
      "🚆 Excellent Public Transport": "🚆 便捷轨交与出行",
      "🏙 City Center": "🏙 繁华市中心地带",
      "🍸 Nightlife": "🍸 精彩夜生活娱乐",
      "🛍 Shopping": "🛍 大型商场与购物",
      "💻 Coworking Spaces": "💻 共享办公及工作站",
      "👨‍👩‍👧 Family Friendly": "👨‍👩‍👧 适合家庭抚育子女",
      "🐶 Pet Friendly": "🐶 允许饲养宠物",
      "🏃 Fitness Lifestyle": "🏃 崇尚健康运动/健身",
      "🌍 International Community": "🌍 国际化多元社区",
      "🇯🇵 Japanese Community": "🇯🇵 日籍人士聚居区",
      "🇨🇳 Chinese Community": "🇨🇳 华人华侨聚居区",
      "🌿 Parks & Green Spaces": "🌿 城市公园与生态绿地",
      "🍜 Local Thai Culture": "🍜 本地风情与泰国文化",
      "🏆 Luxury Living": "🏆 顶级奢华居住区",
      "🚶 Walkability": "🚶 出行步行极便利",
      "🏖 Relaxed Lifestyle": "🏖 悠闲舒适的生活氛围"
    },
    avoidances: {
      "Heavy Traffic": "道路拥堵",
      "Noise": "喧闹噪音",
      "Nightlife": "夜店及喧哗街道",
      "Tourist Crowds": "过多游客聚集",
      "Long Commutes": "长途耗时通勤",
      "Expensive Areas": "过高的租金或物价",
      "Dense High-Rise Areas": "过于高楼密集的压抑感",
      "Busy City Centers": "过分嘈杂的商业中心"
    },
    durations: {
      "1-3 Months": "1-3 个月",
      "3-6 Months": "3-6 个月",
      "6-12 Months": "6-12 个月",
      "1 Year+": "1 年以上",
      "Permanent Relocation": "长久或永久定居"
    },
    destinations: {
      "None / Not working": "无 / 暂不工作",
      "One Bangkok": "One Bangkok 综合体",
      "Sathorn": "沙吞商业区",
      "Silom": "是隆核心区",
      "Asoke": "阿索克枢纽",
      "Chulalongkorn University": "朱拉隆功大学",
      "Custom Location": "自定义通勤地址"
    }
  }
};
