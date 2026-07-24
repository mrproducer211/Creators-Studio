export interface BlogTranslations {
  localGuides: string;
  knowBangkok: string;
  sub: string;
  readMore: string;
  minRead: string;
  viewAllGuides: string;
  relatedArticles: string;
  
  // Post titles & excerpts
  posts: Record<string, {
    title: string;
    excerpt: string;
    category: string;
  }>;
}

export function getLocalizedBlog<T extends { slug: string; title: string; excerpt: string; category?: string }>(article: T, lang: "en" | "th" | "zh"): T {
  if (lang === "en" || !article) return article;
  const loc = T_BLOG[lang]?.posts?.[article.slug];
  if (loc) {
    return {
      ...article,
      title: loc.title || article.title,
      excerpt: loc.excerpt || article.excerpt,
      category: loc.category || article.category,
    };
  }
  return article;
}

export const T_BLOG: Record<"en" | "th" | "zh", BlogTranslations> = {
  en: {
    localGuides: "Local Guides",
    knowBangkok: "Know Bangkok before you arrive",
    sub: "Honest neighbourhood guides, rental price breakdowns, expat tips and family relocation advice — written by the NHP team who live here.",
    readMore: "Read more →",
    minRead: "min read",
    viewAllGuides: "View all guides →",
    relatedArticles: "Related Articles",
    posts: {
      "bangkok-transit-and-safety-walk": {
        title: "Bangkok Transit and Safety: A Walk Beyond the Expat Bubble",
        excerpt: "Is Bangkok safe? How clean is the transit? Take a walk through Talat Noi and Chinatown to see why Bangkok is one of the safest and most advanced cities.",
        category: "Expat Tips"
      },
      "affordable-health-insurance-thailand": {
        title: "Affordable Health Insurance in Thailand: Expat Tips and Mistakes to Avoid",
        excerpt: "Navigating healthcare in Thailand doesn't have to be confusing. Here is a simple guide to private hospitals, costs, and key insurance mistakes to avoid.",
        category: "Expat Tips"
      },
      "cost-of-living-bangkok-2026": {
        title: "The Real Cost of Living in Bangkok: A Practical 2026 Budget Breakdown",
        excerpt: "How much does it actually cost to live in Bangkok? Here is a practical breakdown of rent, utility bills, food, and fun based on real expat spending in 2026.",
        category: "Property Insights"
      },
      "first-time-guide-bangkok": {
        title: "A First-Timer's Guide to Bangkok: Airports, Visas, and Smart Tips",
        excerpt: "Landing in Bangkok unprepared can be overwhelming. Here is a simple, honest guide covering airports, visas, transport, and how to avoid common scams.",
        category: "Expat Tips"
      },
      "where-to-live-in-bangkok": {
        title: "Where to Live in Bangkok: An Honest Expat Neighborhood Vibe Guide",
        excerpt: "Bangkok is a massive city, and choosing where to live completely shapes your daily routine. Here is an honest breakdown of the vibe in the main expat areas.",
        category: "Neighbourhood Guide"
      },
      "3-day-bangkok-itinerary": {
        title: "The Ultimate 3-Day Bangkok Itinerary: Sights, Food, and Hidden Gems",
        excerpt: "Planning your first trip to Bangkok? Here is a perfect 3-day itinerary that blends the famous sights you can't miss with the cool local neighborhoods.",
        category: "Neighbourhood Guide"
      },
      "new-mrt-yellow-line-promotes-growth-in-lat-phrao-rss": {
        title: "New MRT Yellow Line Promotes Growth in Lat Phrao",
        excerpt: "The fully operational MRT Yellow Line has prompted a surge of interest in suburban districts like Lat Phrao and Srinakarin. Developers report rising demand.",
        category: "Property Insights"
      },
      "bangkok-condo-index-shows-stable-q2-rental-yields-rss": {
        title: "Bangkok Condo Index Shows Stable Q2 Rental Yields",
        excerpt: "The latest quarterly index for residential condominiums in central Bangkok (Sukhumvit, Sathorn, Ari) shows rental yields have stabilized at around 4.5% to 5.2%.",
        category: "Property Insights"
      },
      "thong-lo-vs-on-nut": {
        title: "Thong Lo vs On Nut: Which Bangkok Neighbourhood Suits You?",
        excerpt: "Both are BTS-connected, expat-friendly and full of great food — but the vibe, price and lifestyle are worlds apart. Here's how to choose.",
        category: "Neighbourhood Guide"
      },
      "digital-nomad-guide-sukhumvit": {
        title: "A Digital Nomad's Complete Guide to Living in Sukhumvit, Bangkok",
        excerpt: "From co-working spaces to SIM cards, health insurance and the best coffee shops with reliable Wi-Fi — everything you need before you land.",
        category: "Expat Tips"
      },
      "what-40k-gets-you-bangkok": {
        title: "What ฿40,000/Month Gets You in Bangkok's Top Expat Areas",
        excerpt: "A studio in Thong Lo, a 2-bed in On Nut, or a penthouse in Ari? We break down exactly what your budget unlocks district by district.",
        category: "Property Insights"
      },
      "international-schools-bangkok": {
        title: "Top International Schools Near Bangkok's Expat Neighbourhoods",
        excerpt: "Relocating with children? We map the best international schools against the city's most liveable expat areas so the commute never becomes the sacrifice.",
        category: "Family Living"
      }
    }
  },
  th: {
    localGuides: "คู่มือแนะนำท้องถิ่น",
    knowBangkok: "รู้จักกรุงเทพฯ ก่อนเดินทางมาถึง",
    sub: "คู่มือแนะนำย่านที่อยู่อาศัยที่ตรงไปตรงมา ข้อมูลค่าเช่า เคล็ดลับสำหรับชาวต่างชาติ และคำแนะนำในการย้ายครอบครัว — เขียนโดยทีมงาน NHP ผู้อาศัยที่นี่",
    readMore: "อ่านเพิ่มเติม →",
    minRead: "นาที (อ่าน)",
    viewAllGuides: "ดูคู่มือทั้งหมด →",
    relatedArticles: "บทความที่เกี่ยวข้อง",
    posts: {
      "bangkok-transit-and-safety-walk": {
        title: "การคมนาคมและความปลอดภัยในกรุงเทพฯ: เดินสำรวจนอกขอบเขตย่านคนต่างชาติ",
        excerpt: "กรุงเทพฯ ปลอดภัยไหม? ระบบคมนาคมสะอาดแค่ไหน? เดินลัดเลาะตลาดน้อยและเยาวราชไปด้วยกันเพื่อดูเหตุผลว่าทำไมที่นี่จึงเป็นหนึ่งในเมืองที่ปลอดภัยที่สุด",
        category: "เคล็ดลับสำหรับ Expat"
      },
      "affordable-health-insurance-thailand": {
        title: "ประกันสุขภาพราคาประหยัดในไทย: เคล็ดลับสำหรับชาวต่างชาติและข้อผิดพลาดที่ควรเลี่ยง",
        excerpt: "การทำความเข้าใจระบบการรักษาพยาบาลในไทยจะไม่เป็นเรื่องสับสนอีกต่อไป นี่คือคู่มือง่ายๆ เกี่ยวกับโรงพยาบาลเอกชน ค่าใช้จ่าย และวิธีเลือกประกัน",
        category: "เคล็ดลับสำหรับ Expat"
      },
      "cost-of-living-bangkok-2026": {
        title: "ค่าครองชีพที่แท้จริงในกรุงเทพฯ: บทวิเคราะห์งบประมาณปี 2026 สำหรับการอยู่อาศัยจริง",
        excerpt: "การใช้ชีวิตในกรุงเทพฯ มีค่าใช้จ่ายจริงเท่าไหร่? นี่คือการสรุปงบประมาณค่าเช่า ค่าน้ำค่าไฟ อาหาร และกิจกรรมพักผ่อนจากข้อมูลผู้ใช้ชีวิตจริงในปี 2026",
        category: "เจาะลึกอสังหาฯ"
      },
      "first-time-guide-bangkok": {
        title: "คู่มือสำหรับผู้เดินทางมาเยือนกรุงเทพฯ ครั้งแรก: สนามบิน วีซ่า และเคล็ดลับการเดินทาง",
        excerpt: "การเดินทางมาถึงกรุงเทพฯ โดยไม่มีข้อมูลเตรียมพร้อมอาจทำให้อึดอัดใจ นี่คือคู่มือแนะนำที่ตรงไปตรงมาเกี่ยวกับสนามบิน วีซ่า การเดินทาง และกลโกงที่ควรระวัง",
        category: "เคล็ดลับสำหรับ Expat"
      },
      "where-to-live-in-bangkok": {
        title: "เลือกพักที่ไหนในกรุงเทพฯ: คู่มือแนะนำบรรยากาศแต่ละย่านสำหรับชาวต่างชาติที่ตรงไปตรงมา",
        excerpt: "กรุงเทพฯ เป็นเมืองที่กว้างใหญ่มาก และทำเลที่คุณเลือกจะเปลี่ยนกิจวัตรประจำวันของคุณอย่างสิ้นเชิง นี่คือการวิเคราะห์บรรยากาศของแต่ละย่านเด่นสำหรับคุณ",
        category: "คู่มือย่านที่อยู่"
      },
      "3-day-bangkok-itinerary": {
        title: "แผนเที่ยวกรุงเทพฯ 3 วันฉบับสมบูรณ์: สถานที่ท่องเที่ยว ของกิน และแลนด์มาร์กไม่ลับ",
        excerpt: "กำลังวางแผนทริปแรกไปกรุงเทพฯ? นี่คือแผนการเดินทาง 3 วันที่ผสมผสานสถานที่ท่องเที่ยวห้ามพลาดกับย่านท้องถิ่นสุดคูลที่สะท้อนเสน่ห์ของเมือง",
        category: "คู่มือย่านที่อยู่"
      },
      "new-mrt-yellow-line-promotes-growth-in-lat-phrao-rss": {
        title: "รถไฟฟ้าสายสีเหลืองใหม่กระตุ้นการเติบโตในย่านลาดพร้าว",
        excerpt: "การเปิดให้บริการรถไฟฟ้าสายสีเหลืองอย่างเต็มรูปแบบส่งผลให้ความสนใจอสังหาริมทรัพย์ในย่านลาดพร้าวและศรีนครินทร์พุ่งสูงขึ้น ผู้พัฒนาเผยความต้องการเพิ่มขึ้นอย่างเห็นได้ชัด",
        category: "เจาะลึกอสังหาฯ"
      },
      "bangkok-condo-index-shows-stable-q2-rental-yields-rss": {
        title: "ดัชนีคอนโดกรุงเทพฯ เผยอัตราผลตอบแทนการเช่าที่มั่นคงในไตรมาส 2",
        excerpt: "ดัชนีคอนโดที่พักอาศัยล่าสุดในใจกลางกรุงเทพฯ (สุขุมวิท สาทร อารีย์) ชี้ให้เห็นว่าอัตราผลตอบแทนจากการปล่อยเช่าทรงตัวอยู่ที่ประมาณ 4.5% ถึง 5.2%",
        category: "เจาะลึกอสังหาฯ"
      },
      "thong-lo-vs-on-nut": {
        title: "ทองหล่อ ปะทะ อ่อนนุช: ย่านใดในกรุงเทพฯ ที่เหมาะกับไลฟ์สไตล์คุณ?",
        excerpt: "ทั้งสองย่านเชื่อมต่อรถไฟฟ้าบีทีเอส เดินทางสะดวก และเต็มไปด้วยอาหารอร่อย แต่บรรยากาศ ราคา และวิถีชีวิตต่างกันโดยสิ้นเชิง นี่คือคำตอบสำหรับวิธีเลือก",
        category: "คู่มือย่านที่อยู่"
      },
      "digital-nomad-guide-sukhumvit": {
        title: "คู่มือฉบับสมบูรณ์สำหรับ Digital Nomad เพื่อการใช้ชีวิตในย่านสุขุมวิท กรุงเทพฯ",
        excerpt: "ตั้งแต่สถานที่นั่งทำงาน Co-working ซิมการ์ด ประกันสุขภาพ ไปจนถึงคาเฟ่พร้อมอินเทอร์เน็ตความเร็วสูง — ข้อมูลจำเป็นทั้งหมดที่คุณต้องรู้ก่อนเดินทาง",
        category: "เคล็ดลับสำหรับ Expat"
      },
      "what-40k-gets-you-bangkok": {
        title: "งบ 40,000 บาทต่อเดือน จะเช่าที่พักย่านเด่นในกรุงเทพฯ ได้ระดับไหน?",
        excerpt: "ห้องสตูดิโอในทองหล่อ คอนโด 2 ห้องนอนในอ่อนนุช หรือเพนท์เฮาส์ในอารีย์? เรามาวิเคราะห์ให้ดูว่าเงินงบประมาณของคุณจะได้ที่พักแบบใดบ้างในแต่ละทำเล",
        category: "เจาะลึกอสังหาฯ"
      },
      "international-schools-bangkok": {
        title: "โรงเรียนนานาชาติชั้นนำใกล้ทำเลยอดฮิตของชาวต่างชาติในกรุงเทพฯ",
        excerpt: "ย้ายที่อยู่พร้อมลูกๆ? เราเปิดแผนที่เทียบโรงเรียนนานาชาติที่ดีที่สุดกับย่านพักอาศัยที่เหมาะสมที่สุด เพื่อลดเวลาการเดินทางของครอบครัวคุณให้สั้นที่สุด",
        category: "ครอบครัวและการใช้ชีวิต"
      },
      "retiring-bangkok-vs-chiang-mai-vs-hua-hin": {
        title: "เกษียณที่กรุงเทพฯ เชียงใหม่ หรือหัวหิน: เปรียบเทียบสำหรับชาวต่างชาติที่มองหาที่พักตากอากาศ",
        excerpt: "กำลังมองหาที่เกษียณในไทย? เราเปรียบเทียบกรุงเทพฯ เชียงใหม่ และหัวหิน ด้านค่าใช้จ่าย การรักษาพยาบาล ไลฟ์สไตล์ และชุมชน เพื่อช่วยให้คุณตัดสินใจได้",
        category: "การเกษียณอายุ"
      },
      "thailand-retirement-visa-guide-2026": {
        title: "วีซ่าเกษียณอายุไทย (Non-OA): ข้อมูลครบที่คุณต้องรู้ในปี 2026",
        excerpt: "วางแผนเกษียณในไทย? นี่คือคู่มือทีละขั้นตอนที่ชัดเจนสำหรับวีซ่า Non-O และ Non-OA พร้อมกฎด้านการเงินและประกันสุขภาพ",
        category: "การเกษียณอายุ"
      },
      "best-bangkok-neighbourhoods-retirees": {
        title: "ย่านที่ดีที่สุดในกรุงเทพฯ สำหรับผู้เกษียณ: เงียบสงบ เดินสะดวก และใกล้สถานพยาบาล",
        excerpt: "ไม่ใช่ทุกย่านในกรุงเทพฯ ที่จะวุ่นวายและเสียงดัง ย่านเหล่านี้ 3 แห่งมอบที่พักอาศัยที่เงียบสงบสำหรับผู้เกษียณ ใกล้โรงพยาบาลเอกชนที่ดีที่สุดของเมือง",
        category: "การเกษียณอายุ"
      },
      "healthcare-costs-thailand-retirees": {
        title: "ค่ารักษาพยาบาลในไทยสำหรับผู้เกษียณ: สิ่งที่คุณคาดหวังได้และวิธีวางแผน",
        excerpt: "ค่าหมอในกรุงเทพฯ แพงแค่ไหน? แล้วผ่าตัดหรือรักษาฟัน? เราสรุปค่ารักษาพยาบาลจริงและแผนประกันสุขภาพสำหรับผู้เกษียณในปี 2026",
        category: "การเกษียณอายุ"
      },
      "live-comfortably-bangkok-2000-budget": {
        title: "คุณสามารถใช้ชีวิตสบายในกรุงเทพฯ ด้วยบำนาญ 2,000 เหรียญ/เดือนได้ไหม?",
        excerpt: "ด้วยอัตราแลกเปลี่ยนปัจจุบัน 2,000 ดอลลาร์สหรัฐเท่ากับประมาณ 70,000 บาท เราแสดงให้เห็นว่างบนี้จะใช้ชีวิตเกษียณได้อย่างไรในกรุงเทพฯ",
        category: "การเกษียณอายุ"
      },
      "thailand-ltr-visa-remote-workers": {
        title: "วีซ่า LTR ของไทยสำหรับ Remote Worker: วิธีสมัครและใครมีสิทธิ์บ้าง",
        excerpt: "ต้องการวีซ่าพำนัก 10 ปีและภาษีเงินได้อัตราพิเศษ 17%? นี่คือคู่มือทีละขั้นตอนสำหรับวีซ่า LTR สำหรับ Remote Worker",
        category: "ดิจิทัลโนแมด"
      },
      "safest-bangkok-neighbourhoods-families": {
        title: "ย่านที่ปลอดภัยที่สุดในกรุงเทพฯ สำหรับครอบครัว: สิ่งที่พ่อแม่ชาวต่างชาติแนะนำจริงๆ",
        excerpt: "ความปลอดภัยคือสิ่งสำคัญสูงสุดสำหรับพ่อแม่ชาวต่างชาติ เราแนะนำย่านที่ปลอดภัยและเป็นมิตรกับเด็กมากที่สุดในกรุงเทพฯ จากคำแนะนำของพ่อแม่จริงๆ",
        category: "ย้ายมาอยู่กรุงเทพฯ"
      },
      "phrom-phong-vs-ekkamai-sukhumvit": {
        title: "พร้อมพงษ์ ปะทะ เอกมัย: ย่านสุขุมวิทกลางแห่งใดเหมาะกับคุณ?",
        excerpt: "สองสถานีบีทีเอสเท่านั้นที่คั่นกลาง แต่ไลฟ์สไตล์ที่มอบให้ต่างกันโดยสิ้นเชิง ย่านหนึ่งเน้นห้างหรูและคอนโดระดับพรีเมียม อีกย่านเต็มไปด้วยคาเฟ่วินเทจและเสน่ห์ท้องถิ่น",
        category: "ย้ายมาอยู่กรุงเทพฯ"
      },
      "silom-after-dark-expat-guide": {
        title: "สีลมยามค่ำคืน: คู่มือท้องถิ่นสู่บาร์ดีที่สุด รูฟท็อป และอาหารริมถนน",
        excerpt: "กลางวันสีลมคือย่านธุรกิจของกรุงเทพฯ แต่หลังเวลาทำการ ย่านนี้กลายเป็นสวรรค์ของอาหารริมทางและบาร์ยามค่ำ",
        category: "การใช้ชีวิตในกรุงเทพฯ"
      },
      "living-in-nonthaburi-guide": {
        title: "ใช้ชีวิตในนนทบุรี: หลีกหนีจากความวุ่นวายของกรุงเทพฯ พร้อมการเข้าถึงเมืองที่สะดวก",
        excerpt: "อยากหลีกหนีจากป่าคอนกรีต? นนทบุรีมอบที่พักอาศัยเงียบสงบ สวนริมแม่น้ำ และตลาดแบบดั้งเดิม เชื่อมต่อด้วยรถไฟฟ้าสายสีม่วง",
        category: "การใช้ชีวิตในกรุงเทพฯ"
      },
      "thailand-visa-guide-2026": {
        title: "คู่มือวีซ่าไทยปี 2026: ท่องเที่ยว LTR Elite และเกษียณ อธิบายครบ",
        excerpt: "การทำความเข้าใจวีซ่าไทยอาจเป็นเรื่องปวดหัว นี่คือคู่มือที่ชัดเจนและง่ายสำหรับตัวเลือกวีซ่าของคุณในปี 2026 ตั้งแต่การทำงานระยะไกลไปจนถึงการเกษียณ",
        category: "ย้ายมาอยู่กรุงเทพฯ"
      },
      "open-bank-account-thailand-foreigner": {
        title: "วิธีเปิดบัญชีธนาคารในไทยในฐานะชาวต่างชาติ",
        excerpt: "การเปิดบัญชีธนาคารในไทยอาจยุ่งยากโดยไม่มีใบอนุญาตทำงาน นี่คือคู่มือทีละขั้นตอนพร้อมเอกสารที่ต้องใช้และธนาคารที่ดีที่สุด",
        category: "ย้ายมาอยู่กรุงเทพฯ"
      },
      "bangkok-healthcare-guide-expats": {
        title: "การดูแลสุขภาพในกรุงเทพฯ: โรงพยาบาล คลินิก และประกันที่ดีที่สุดสำหรับชาวต่างชาติ",
        excerpt: "กรุงเทพฯ มีโรงพยาบาลเอกชนที่ดีที่สุดแห่งหนึ่งในโลก นี่คือคู่มือค่าใช้จ่าย ประกันสุขภาพ และสถานพยาบาลที่ดีที่สุดสำหรับชาวต่างชาติ",
        category: "ย้ายมาอยู่กรุงเทพฯ"
      },
      "first-week-bangkok-survival-guide": {
        title: "สัปดาห์แรกในกรุงเทพฯ: ซิมการ์ด ธนาคาร และการลงทะเบียนที่อยู่",
        excerpt: "มาถึงกรุงเทพฯ แล้ว? นี่คือรายการตรวจสอบทีละขั้นตอนสำหรับการเชื่อมต่อ จัดการเรื่องราว และลงทะเบียนตามกฎหมายในสัปดาห์แรก",
        category: "ย้ายมาอยู่กรุงเทพฯ"
      },
      "things-not-to-do-in-thailand": {
        title: "10 สิ่งที่คุณห้ามทำในไทยเด็ดขาด: คู่มือสำหรับชาวต่างชาติเรื่องวัฒนธรรมและกฎหมาย",
        excerpt: "ไทยคือ 'ดินแดนแห่งรอยยิ้ม' แต่ความเข้าใจผิดเล็กๆ น้อยๆ ทางวัฒนธรรมอาจนำไปสู่การสร้างความไม่พอใจอย่างรุนแรงหรือแม้แต่การจับกุม นี่คือ 10 สิ่งที่คุณต้องไม่ทำ",
        category: "กิจกรรมน่าสนใจ"
      },
      "pet-friendly-condos-bangkok-guide": {
        title: "คอนโดที่อนุญาตให้เลี้ยงสัตว์ในกรุงเทพฯ: อาคารชั้นนำในทองหล่อ สาทร และเอกมัย (2026)",
        excerpt: "ย้ายมากรุงเทพฯ พร้อมสุนัขหรือแมว? การหาตึกสูงที่ยอมรับสัตว์เลี้ยงอาจยุ่งยาก นี่คือคู่มือฉบับสมบูรณ์ปี 2026 สำหรับอาคารที่เป็นมิตรกับสัตว์เลี้ยง",
        category: "ย้ายมาอยู่กรุงเทพฯ"
      },
      "bangkok-short-term-condo-rentals": {
        title: "วิธีเช่าคอนโดระยะสั้น 3-6 เดือนในกรุงเทพฯ (คู่มือ Digital Nomad)",
        excerpt: "มาเยือนกรุงเทพฯ สองสามเดือนด้วยวีซ่า DTV หรืองาน Remote? เรียนรู้วิธีเช่าระยะ 3-6 เดือน กฎเกี่ยวกับเงินมัดจำ และย่านยอดนิยมสำหรับ Digital Nomad",
        category: "ดิจิทัลโนแมด"
      },
      "hidden-gem-restaurants-bangkok": {
        title: "ร้านอาหารซ่อนเร้นในกรุงเทพฯ ที่คนท้องถิ่นรู้จัก",
        excerpt: "มองหาร้านอาหารที่แท้จริงของกรุงเทพฯ ที่ไม่อยู่ในคู่มือท่องเที่ยว? นี่คือร้านโปรดของ NHP ที่คนท้องถิ่นแนะนำ",
        category: "กิจกรรมน่าสนใจ"
      }
    }
  },
  zh: {
    localGuides: "本地指南",
    knowBangkok: "到达前深度了解曼谷",
    sub: "真实客观的社区对比、租金水平拆解、外籍人士实用贴士及家庭移居建议 —— 均由生活在此的 NHP 本地团队撰写。",
    readMore: "阅读更多 →",
    minRead: "分钟阅读",
    viewAllGuides: "查看所有指南 →",
    relatedArticles: "相关推荐文章",
    posts: {
      "bangkok-transit-and-safety-walk": {
        title: "曼谷交通与安全：一次走出外籍人士舒适区的街头徒步观察",
        excerpt: "曼谷安全吗？轨道交通是否干净？让我们漫步穿过石龙军路与唐人街，看看为什么曼谷被誉为最安全且最发达的亚洲大都市之一。",
        category: "外籍人士贴士"
      },
      "affordable-health-insurance-thailand": {
        title: "泰国高性价比医疗保险：外籍人士投保指南与需避开的误区",
        excerpt: "在泰国选择医疗保障并不复杂。这是一份关于私人医院选择、就医成本及避免关键保险陷阱的通俗易懂指南。",
        category: "外籍人士贴士"
      },
      "cost-of-living-bangkok-2026": {
        title: "曼谷生活的真实成本：2026年实用消费预算拆解",
        excerpt: "在曼谷生活到底需要花多少钱？这是一份基于2026年真实外籍人士日常开销的房租、水电、伙食及娱乐预算账单分析。",
        category: "房产市场洞察"
      },
      "first-time-guide-bangkok": {
        title: "曼谷新手入境生存指南：机场、签证与出行避坑常识",
        excerpt: "初次降落曼谷可能面临信息超载。本指南涵盖机场交通、电话卡办理、打车及避开常见街头套路的实用建议。",
        category: "外籍人士贴士"
      },
      "where-to-live-in-bangkok": {
        title: "在曼谷住哪最适合？外籍人士热门生活社区客观解析",
        excerpt: "曼谷是一座巨大的城市，选择住在哪里将彻底塑造您的日常生活轨迹。以下是各大外籍人士核心聚居区生活氛围的客观拆解。",
        category: "社区指南"
      },
      "3-day-bangkok-itinerary": {
        title: "最省心的曼谷3日游玩路线：必打卡地标与小众街区融合之旅",
        excerpt: "第一次来曼谷旅行？这套精心定制的3日路线将经典地标打卡与潮流社区慢生活完美串联，带您感受独特的城市魅力。",
        category: "社区指南"
      },
      "new-mrt-yellow-line-promotes-growth-in-lat-phrao-rss": {
        title: "捷运黄线通车带动拉抛等东部近郊区域房产快速升值",
        excerpt: "全面投入运营的 MRT 黄线极大地刺激了拉抛和斯那卡林等市郊区域。开发商表示周边的公寓租赁和买卖需求正明显增长。",
        category: "房产市场洞察"
      },
      "bangkok-condo-index-shows-stable-q2-rental-yields-rss": {
        title: "曼谷公寓指数报告显示第二季度核心区租金回报保持平稳",
        excerpt: "针对曼谷市中心（素坤逸、沙吞、阿里）高端公寓的最新季度分析显示，目前的租金回报率平稳维持在 4.5% 至 5.2% 之间。",
        category: "房产市场洞察"
      },
      "thong-lo-vs-on-nut": {
        title: "通罗 vs 安努：哪一个曼谷热门社区更契合您的预算和生活方式？",
        excerpt: "两个社区都连接 BTS 轨道交通、生活便利，但生活情调、租房预算和圈子氛围却截然不同。阅读本文帮您快速决策。",
        category: "社区指南"
      },
      "digital-nomad-guide-sukhumvit": {
        title: "数字游民在曼谷素坤逸生活的全方位生存指南",
        excerpt: "从共享办公空间分布、电话卡选购、外籍保险推荐到适合办公的千兆网速咖啡馆 —— 助您在着陆前做好完全准备。",
        category: "外籍人士贴士"
      },
      "what-40k-gets-you-bangkok": {
        title: "月预算 40,000 泰铢在曼谷各大外籍核心区能租到什么品质的房子？",
        excerpt: "在通罗的精品单间，安努的优质两居，还是阿里的精致顶层？我们按不同社区帮您逐一拆解该预算能租到的房源档次。",
        category: "房产市场洞察"
      },
      "international-schools-bangkok": {
        title: "曼谷优质国际学校分布及周边低通勤核心社区推荐",
        excerpt: "携子女移居曼谷？我们为您梳理出优质国际学校与高宜居住宅小区的最佳地理位置配对，让孩子的每日上学路不再漫长。",
        category: "家庭生活"
      },
      "retiring-bangkok-vs-chiang-mai-vs-hua-hin": {
        title: "在曼谷、清迈还是华欣退休？为外籍人士全面比较三座城市",
        excerpt: "打算在泰国养老？我们从生活成本、医疗条件、生活方式与社区氛围四个维度，帮您逐一比较曼谷、清迈与华欣，让您做出最适合自己的选择。",
        category: "养老退休"
      },
      "thailand-retirement-visa-guide-2026": {
        title: "泰国退休签证（Non-OA）：2026年您需要了解的全部内容",
        excerpt: "计划在泰国养老？这是一份关于Non-O和Non-OA退休签证的清晰分步指南，涵盖财务要求和保险规定。",
        category: "养老退休"
      },
      "best-bangkok-neighbourhoods-retirees": {
        title: "最适合退休人士的曼谷社区：安静、宜步行且紧邻优质医疗资源",
        excerpt: "并非整个曼谷都嘈杂喧闹。这3个安静宜居的社区为退休人士提供了紧邻全市最佳私立医院的平和居住环境。",
        category: "养老退休"
      },
      "healthcare-costs-thailand-retirees": {
        title: "泰国退休人士医疗费用全解析：该预期什么与如何规划",
        excerpt: "在曼谷看一次门诊要多少钱？手术或牙科治疗呢？我们详细拆解了退休人士在2026年的真实医疗成本与保险方案。",
        category: "养老退休"
      },
      "live-comfortably-bangkok-2000-budget": {
        title: "每月2000美元养老金能在曼谷过上舒适生活吗？",
        excerpt: "按当前汇率，2000美元约合70000泰铢。我们为您详细演示这笔预算如何支撑一个体面的曼谷退休生活。",
        category: "养老退休"
      },
      "thailand-ltr-visa-remote-workers": {
        title: "泰国LTR签证远程工作者指南：如何申请及谁有资格",
        excerpt: "想要10年居留签证和17%优惠所得税率？这里是远程工作者申请LTR签证的完整步骤指南。",
        category: "数字游民"
      },
      "safest-bangkok-neighbourhoods-families": {
        title: "曼谷最适合家庭居住的安全社区：来自外籍家长的真实推荐",
        excerpt: "安全是外籍家长的头等大事。我们根据真实家长反馈，列出曼谷最安全、最适合儿童生活的社区。",
        category: "移居曼谷"
      },
      "phrom-phong-vs-ekkamai-sukhumvit": {
        title: "澎蓬 vs 伊卡迈：中素坤逸哪个社区更适合您？",
        excerpt: "两个BTS站相隔仅两站，但生活方式却截然不同。一个是高端零售和豪华公寓；另一个是文艺咖啡馆和浓郁本地风情。",
        category: "移居曼谷"
      },
      "silom-after-dark-expat-guide": {
        title: "夜幕下的是隆：本地达人推荐的最佳酒吧、天台餐厅与街头美食",
        excerpt: "白天的是隆是曼谷的金融中心。但当写字楼的灯光熄灭，这里便化身为美食与夜生活的天堂。",
        category: "曼谷生活"
      },
      "living-in-nonthaburi-guide": {
        title: "定居暖武里：从曼谷喧嚣中寻得一处宁静，同时轻松入城",
        excerpt: "想逃离混凝土丛林？暖武里提供宁静的住宅环境、临河公园和传统市集，且通过MRT紫线便捷连接市中心。",
        category: "曼谷生活"
      },
      "thailand-visa-guide-2026": {
        title: "2026年泰国签证完整指南：旅游、LTR、精英与退休签证全解析",
        excerpt: "泰国签证系统可能令人头疼。这是一份针对2026年各类签证选项的清晰简洁指南，从远程办公到退休养老一网打尽。",
        category: "移居曼谷"
      },
      "open-bank-account-thailand-foreigner": {
        title: "外国人在泰国开设银行账户的完整流程",
        excerpt: "没有工作许可证，在泰国开户可能颇为棘手。这是一份关于所需材料和最佳开户银行的分步指南。",
        category: "移居曼谷"
      },
      "bangkok-healthcare-guide-expats": {
        title: "曼谷医疗指南：最适合外籍人士的医院、诊所与保险推荐",
        excerpt: "曼谷拥有全球顶尖的私立医院之一。这是我们关于就医费用、保险方案及最佳医疗机构的外籍人士专属指南。",
        category: "移居曼谷"
      },
      "first-week-bangkok-survival-guide": {
        title: "抵达曼谷第一周：SIM卡、银行开户与地址注册攻略",
        excerpt: "刚落地曼谷？这是您在第一周内完成联网、事务处理和合法注册的逐步清单。",
        category: "移居曼谷"
      },
      "things-not-to-do-in-thailand": {
        title: "在泰国绝对不能做的10件事：外国人必知的文化禁忌与法律红线",
        excerpt: `泰国是"微笑之国"，但细微的文化误解可能导致严重冒犯甚至被捕。以下是10件您绝对不能做的事。`,
        category: "玩乐指南"
      },
      "pet-friendly-condos-bangkok-guide": {
        title: "曼谷可携带宠物的公寓指南：通罗、沙吞和伊卡迈顶级楼盘推荐（2026）",
        excerpt: "带着狗或猫搬来曼谷？在高层公寓中寻找允许宠物入住的房源颇具挑战。这是2026年外籍人士宠物友好楼盘完整指南。",
        category: "移居曼谷"
      },
      "bangkok-short-term-condo-rentals": {
        title: "曼谷3至6个月短租公寓攻略（数字游民指南）",
        excerpt: "持DTV签证或远程工作来曼谷住几个月？了解3至6个月短租合同的运作方式、押金规则及数字游民热门社区。",
        category: "数字游民"
      },
      "hidden-gem-restaurants-bangkok": {
        title: "曼谷本地人才知道的隐藏宝藏餐厅",
        excerpt: "寻找不在旅游攻略上的正宗曼谷美食？这是NHP本地团队亲测推荐的心头好餐厅名单。",
        category: "玩乐指南"
      }
    }
  }
};

export function getLocalizedPost<T extends { slug: string; title: string; excerpt: string; category: string; readTime: string }>(
  post: T,
  lang: "en" | "th" | "zh"
): T {
  if (!post) return post;
  if (lang === "en") return post;

  const translation = T_BLOG[lang]?.posts?.[post.slug];
  const readTimeNum = post.readTime ? post.readTime.replace(/[^0-9]/g, "") : "";
  const localizedReadTime = readTimeNum
    ? lang === "th"
      ? `อ่าน ${readTimeNum} นาที`
      : lang === "zh"
      ? `${readTimeNum} 分钟阅读`
      : post.readTime
    : post.readTime;

  if (!translation) {
    return {
      ...post,
      readTime: localizedReadTime,
    };
  }

  return {
    ...post,
    title: translation.title || post.title,
    excerpt: translation.excerpt || post.excerpt,
    category: translation.category || post.category,
    readTime: localizedReadTime,
  };
}
