import { Neighborhood } from "../neighborhoods";

export interface ItineraryItem {
  time: string;
  title: string;
  activity: string;
}

export const LOCALIZED_ITINERARIES: Record<"th" | "zh", Record<string, ItineraryItem[]>> = {
  th: {
    ari: [
      { time: "8:00 AM", title: "จิบกาแฟโคลด์บรูว์ยามเช้า", activity: "ลิ้มลองกาแฟดริปออร์แกนิกที่ร้าน Common Room x Babe" },
      { time: "10:30 AM", title: "ลุยงานอย่างมีสมาธิ", activity: "กางแล็ปท็อปทำงานที่ Launchpad Co-working Ari" },
      { time: "1:00 PM", title: "มื้อเที่ยงสไตล์ไทยฟิวชัน", activity: "เพลิดเพลินกับอาหารไทยฟิวชันที่ Bar Storia del Caffè" },
      { time: "4:30 PM", title: "เดินเล่นในซอยร่มรื่น", activity: "เดินรับลมชมบรรยากาศในซอยอารีย์ 4" },
      { time: "7:00 PM", title: "มื้อค่ำสุดอร่อย", activity: "ทานพาสต้าทำมือแสนอร่อยที่ Landhaus Bakery" }
    ],
    sathorn: [
      { time: "8:00 AM", title: "อาหารเช้าเติมพลัง", activity: "จิบกาแฟเอสเพรสโซที่ Rocket Coffeebar ก่อนชั่วโมงเร่งด่วน" },
      { time: "10:00 AM", title: "ประชุมและวางแผนธุรกิจ", activity: "จัดประชุมลูกค้าที่ Glowfish Sathorn ในอาคารสแควร์ทาวเวอร์" },
      { time: "12:30 PM", title: "มื้อเที่ยงระดับผู้บริหาร", activity: "ทานอาหารร่วมกับเพื่อนร่วมงานที่ Sarnies Suki ในอาคารพาณิชย์อนุรักษ์" },
      { time: "5:30 PM", title: "วิ่งออกกำลังกายสวนลุมพินี", activity: "ผ่อนคลายด้วยการวิ่งรอบสวนลุมพินีระยะทาง 2.5 กิโลเมตร" },
      { time: "8:00 PM", title: "มื้อค่ำสุดหรูระดับไฟน์ไดนิ่ง", activity: "เพลิดเพลินกับอาหารระดับรางวัลที่บิสโทรชั้นนำในย่านเย็นอากาศ" }
    ],
    "thong-lo": [
      { time: "8:30 AM", title: "มัทฉะและเบเกอรี่เช้า", activity: "เริ่มเช้าวันใหม่ด้วยชาชาและพาสตรีที่คัดสรรมาอย่างดี" },
      { time: "11:00 AM", title: "ช็อปปิ้งสินค้าบูติก", activity: "เดินชมสินค้าดีไซเนอร์และคอมมูนิตี้มอลล์ที่ Seenspace หรือ The Commons" },
      { time: "1:30 PM", title: "โอมากาเสะญี่ปุ่นมื้อเที่ยง", activity: "รับประทานอาหารญี่ปุ่นสดใหม่ระดับพรีเมียม" },
      { time: "6:00 PM", title: "รูฟท็อปเลานจ์ยามเย็น", activity: "ชมทัศนียภาพกรุงเทพฯ ยามพระอาทิตย์ตกดิน" },
      { time: "9:00 PM", title: "ค็อกเทลบาร์สุดเอกซ์คลูซีฟ", activity: "จิบเครื่องดื่มคราฟต์ที่สปีคอีซี่บาร์ชื่อดัง" }
    ],
    asok: [
      { time: "8:00 AM", title: "จุดเริ่มต้นการเดินทางอโศก", activity: "เดินทางสะดวกด้วย BTS และ MRT ณ จุดเชื่อมต่ออโศก" },
      { time: "10:30 AM", title: "ทำงานในโคเวิร์กกิ้งสเปซ", activity: "ทำงานอย่างมีประสิทธิภาพที่อาคารสำนักงานชั้นนำ" },
      { time: "12:30 PM", title: "อาหารนานาชาติ Terminal 21", activity: "ทานอาหารอร่อยที่ศูนย์อาหาร Pier 21" },
      { time: "5:00 PM", title: "เดินเล่นสวนเบญจกิตติ", activity: "พักผ่อนในสวนป่าใจกลางเมืองระยะทางเดินสั้นๆ" },
      { time: "8:00 PM", title: "สถานบันเทิงใจกลางเมือง", activity: "สัมผัสแสงสีและร้านอาหารระดับโลกในย่านอโศก" }
    ],
    silom: [
      { time: "7:30 AM", title: "โยคะยามเช้าสวนลุมพินี", activity: "รับอากาศบริสุทธิ์ในสวนสาธารณะใจกลางสีลม" },
      { time: "10:00 AM", title: "ประชุมธุรกิจย่านการเงิน", activity: "พบปะคู่ค้าในศูนย์กลางการเงินระดับประเทศ" },
      { time: "12:30 PM", title: "ราเมง & สตรีทฟู้ดสีลม", activity: "ลิ้มลองอาหารยอดนิยมในซอยคราฟต์" },
      { time: "4:30 PM", title: "ชมศิลปะและย่านประวัติศาสตร์", activity: "เดินชมสถาปัตยกรรมและแกลเลอรีสไตล์คลาสสิก" },
      { time: "7:30 PM", title: "ชมวิวพระอาทิตย์ตกบนตึกสูง", activity: "จิบเครื่องดื่มพร้อมชมวิวเส้นขอบฟ้าสีลม" }
    ],
    "on-nut": [
      { time: "8:00 AM", title: "เริ่มต้นที่ตลาดสดอ่อนนุช", activity: "ซื้อผลไม้สดและกาแฟในราคาสมเหตุสมผล" },
      { time: "10:30 AM", title: "ทำงานในบรรยากาศผ่อนคลาย", activity: "นั่งทำงานสบายๆ ในคาเฟ่ท้องถิ่นอ่อนนุช" },
      { time: "1:00 PM", title: "ตักอิ่มอาหารสตรีทฟู้ด", activity: "ทานอาหารไทยรสจัดจ้านในราคาสบายกระเป๋า" },
      { time: "5:00 PM", title: "เดินเล่นคอมมูนิตี้มอลล์ Habito", activity: "พักผ่อนในบรรยากาศร่มรื่นริมคลอง" },
      { time: "7:30 PM", title: "จิบเครื่องดื่มตลาดสตรีทฟู้ด", activity: "ผ่อนคลายกับดนตรีสดและอาหารค่ำริมสถานี BTS" }
    ],
    ekkamai: [
      { time: "8:30 AM", title: "กาแฟคราฟต์ยามเช้า", activity: "จิบกาแฟคั่วพิเศษในซอยเงียบสงบย่านเอกมัย" },
      { time: "11:00 AM", title: "ครีเอทีฟสเปซ & บูติก", activity: "เดินชมร้านค้าสร้างสรรค์และสตูดิโอออกแบบ" },
      { time: "2:00 PM", title: "พาสัตว์เลี้ยงเดินเล่น", activity: "พักผ่อนในคาเฟ่และพื้นที่ที่เป็นมิตรกับสัตว์เลี้ยง" },
      { time: "5:30 PM", title: "ช็อปปิ้งห้างเอกมัย", activity: "เพลิดเพลินกับร้านค้าปลีกและซูเปอร์มาร์เก็ตญี่ปุ่น" },
      { time: "8:00 PM", title: "บาร์บูติกสุดเก๋", activity: "ฟังดนตรีสดและจิบเครื่องดื่มคราฟต์ในซอยเอกมัย" }
    ],
    sukhumvit: [
      { time: "9:00 AM", title: "ช็อปปิ้งห้าง EmDistrict", activity: "เดินชมสินค้าแบรนด์เนมที่ EmQuartier และ EmSphere" },
      { time: "11:30 AM", title: "พักผ่อนสวนเบญจศิริ", activity: "เดินเล่นริมสระน้ำและต้นไม้ใหญ่ใจกลางสุขุมวิท" },
      { time: "1:30 PM", title: "อาหารนานาชาติระดับโลก", activity: "ทานมื้อเที่ยงที่ร้านอาหารฝรั่งเศสหรืออิตาเลียน" },
      { time: "4:30 PM", title: "สปาหรูผ่อนคลาย", activity: "รับบริการนวดและดูแลสุขภาพระดับห้าดาว" },
      { time: "7:30 PM", title: "ชมวิวเส้นขอบฟ้าใจกลางเมือง", activity: "จิบเครื่องดื่มบนชั้นดาดฟ้าคอนโดมิเนียมหรู" }
    ],
    "rama-9": [
      { time: "8:30 AM", title: "เริ่มต้นวันใหม่ในย่าน New CBD", activity: "เดินทางสะดวกด้วย MRT พระราม 9" },
      { time: "10:30 AM", title: "ทำงานในอาคารสำนักงานล้ำสมัย", activity: "ศูนย์กลางธุรกิจและเทคโนโลยีแห่งใหม่" },
      { time: "1:00 PM", title: "ช็อปปิ้ง Central Rama 9", activity: "เลือกซื้อสินค้าและไอทีในห้างสรรพสินค้าใหญ่" },
      { time: "6:00 PM", title: "ตะลุยสตรีทฟู้ดตลาดจ๊อดแฟร์", activity: "ทานอาหารกลางคืนและอาหารยอดฮิต" },
      { time: "9:00 PM", title: "สถานบันเทิงรัชดาภิเษก", activity: "เพลิดเพลินกับดนตรีและผับสไตล์ทันสมัย" }
    ],
    "bang-na": [
      { time: "9:00 AM", title: "ช็อปปิ้ง Mega Bangna ยามเช้า", activity: "เดินชมห้างสรรพสินค้าขนาดใหญ่ที่สุด" },
      { time: "11:30 AM", title: "ตกแต่งบ้านที่ IKEA Bangna", activity: "เลือกซื้อของแต่งบ้านและไอเดียทันสมัย" },
      { time: "2:00 PM", title: "ย่านโรงเรียนนานาชาติชั้นนำ", activity: "สภาพแวดล้อมที่เหมาะสำหรับครอบครัว" },
      { time: "5:00 PM", title: "กิจกรรมกอล์ฟ & กีฬากลางแจ้ง", activity: "ออกกำลังกายในคลับสุขภาพและสนามกอล์ฟ" },
      { time: "7:30 PM", title: "มื้อค่ำครอบครัวในร้านอาหารกว้างขวาง", activity: "รับประทานอาหารอร่อยในบรรยากาศผ่อนคลาย" }
    ],
    "huai-khwang": [
      { time: "9:00 AM", title: "อาหารจีน & ตลาดห้วยขวาง", activity: "ทานหม่าล่าและอาหารจีนรสจัดจ้าน" },
      { time: "11:30 AM", title: "เดินทางสะดวกด้วย MRT", activity: "เชื่อมต่อเข้าสู่ใจกลางเมืองได้อย่างรวดเร็ว" },
      { time: "3:00 PM", title: "สักการะศาลพระพิฆเนศ", activity: "ชมวัฒนธรรมและความเชื่อท้องถิ่น" },
      { time: "6:30 PM", title: "ช็อปปิ้งตลาดกลางคืนห้วยขวาง", activity: "ซื้อสินค้าเสื้อผ้าและของใช้ราคาถูก" },
      { time: "10:00 PM", title: "อาหารมื้อดึกมีชีวิตชีวา", activity: "ทานอาหารกลางคืนที่เปิดตลอด 24 ชั่วโมง" }
    ],
    "phaya-thai": [
      { time: "8:00 AM", title: "เชื่อมต่อแอร์พอร์ตเรลลิงก์", activity: "เดินทางไปสนามบินสุวรรณภูมิได้อย่างรวดเร็ว" },
      { time: "10:30 AM", title: "ศูนย์กลางการแพทย์ & การศึกษา", activity: "ใกล้โรงพยาบาลชั้นนำและมหาวิทยาลัย" },
      { time: "1:00 PM", title: "คาเฟ่และร้านขนมพญาไท", activity: "จิบกาแฟในบรรยากาศสงบสบาย" },
      { time: "4:30 PM", title: "อนุสาวรีย์ชัยสมรภูมิ", activity: "ศูนย์รวมรถพุ่มและอาหารสตรีทฟู้ด" },
      { time: "7:30 PM", title: "พักผ่อนในคอนโดระดับพรีเมียม", activity: "เพลิดเพลินกับสิ่งอำนวยความสะดวกในโครงการ" }
    ],
    chatuchak: [
      { time: "9:00 AM", title: "ตะลุยตลาดนัดจตุจักร", activity: "เลือกซื้อสินค้านับพันร้านค้าในตลาดนัดระดับโลก" },
      { time: "12:00 PM", title: "ช็อปปิ้ง Central ลาดพร้าว", activity: "เดินชมห้างสรรพสินค้าชั้นนำ" },
      { time: "3:00 PM", title: "ปั่นจักรยานสวนรถไฟ", activity: "พักผ่อนในสวนสาธารณะขนาดใหญ่" },
      { time: "5:30 PM", title: "จุดเชื่อมต่อ BTS/MRT หมอชิต", activity: "เดินทางสะดวกเข้าเมืองและออกต่างจังหวัด" },
      { time: "7:30 PM", title: "ชมพระอาทิตย์ตกดินในสวน", activity: "สูดอากาศบริสุทธิ์ก่อนกลับที่พัก" }
    ],
    "rama-4": [
      { time: "8:30 AM", title: "สำรวจโครงการ One Bangkok", activity: "สัมผัสเมกะโปรเจกต์ระดับโลกแห่งใหม่" },
      { time: "11:00 AM", title: "เดินเล่นสามย่านมิตรทาวน์", activity: "เปิดบริการ 24 ชั่วโมงพร้อมโคเวิร์กกิ้งสเปซ" },
      { time: "1:30 PM", title: "ตะลุยทานอาหารย่านจุฬาฯ", activity: "ชิมสตรีทฟู้ดและร้านดังในตำนาน" },
      { time: "5:00 PM", title: "เชื่อมต่อสวนเบญจกิตติ", activity: "ออกกำลังกายและรับลมธรรมชาติ" },
      { time: "8:00 PM", title: "เชื่อมต่อแม่น้ำเจ้าพระยา", activity: "เดินทางสะดวกสู่ย่านประวัติศาสตร์" }
    ]
  },
  zh: {
    ari: [
      { time: "8:00 AM", title: "晨间冰萃咖啡", activity: "在 Common Room x Babe 品尝有机手冲咖啡" },
      { time: "10:30 AM", title: "高效专注工作", activity: "在 Launchpad 共享办公空间开启高效一天" },
      { time: "1:00 PM", title: "精选融合午餐", activity: "在 Bar Storia del Caffè 享用泰式融合美食" },
      { time: "4:30 PM", title: "绿荫巷弄漫步", activity: "漫步在 Ari Soi 4 绿树成荫的幽静小巷" },
      { time: "7:00 PM", title: "地道温馨晚宴", activity: "在 Landhaus Bakery 品尝手工意面与烘焙" }
    ],
    sathorn: [
      { time: "8:00 AM", title: "高能商务早餐", activity: "在早高峰前在 Rocket Coffeebar 品尝浓缩咖啡" },
      { time: "10:00 AM", title: "商务会议与战略", activity: "在 Glowfish Sathorn 举行客户会议与项目研讨" },
      { time: "12:30 PM", title: "高管精致午餐", activity: "与同事在 Sarnies Suki 享用特色泰式老宅美食" },
      { time: "5:30 PM", title: "蓝毗尼公园慢跑", activity: "在 Lumpini 公园 2.5 公里的绿荫跑道上放松身心" },
      { time: "8:00 PM", title: "奢华晚宴体验", activity: "在 Yen Akat 优雅街区享用米其林星级精致晚宴" }
    ],
    "thong-lo": [
      { time: "8:30 AM", title: "晨间抹茶与精细面点", activity: "在精美精品店享用冷萃抹茶与新鲜法式糕点" },
      { time: "11:00 AM", title: "时尚精品购物", activity: "探索 The Commons 或 Seenspace 潮流社区商场" },
      { time: "1:30 PM", title: "日式主厨日料午餐", activity: "品尝 Thong Lo 知名主厨主理的正宗日式 Omakase" },
      { time: "6:00 PM", title: "高空露台落日酒会", activity: "在豪华高空露台酒吧俯瞰曼谷迷人夜景" },
      { time: "9:00 PM", title: "隐秘酒馆特调", activity: "在特色 Hideout 鸡尾酒吧享受尊贵夜生活" }
    ],
    asok: [
      { time: "8:00 AM", title: "双轨交汇中心启程", activity: "在 Terminal 21 附近开启高效便捷的一天" },
      { time: "10:30 AM", title: "高效商务办公", activity: "在 Asok 高端甲级写字楼共享空间专注办公" },
      { time: "12:30 PM", title: "Terminal 21 美食体验", activity: "在 Pier 21 美食广场享用高性价比地道美食" },
      { time: "5:00 PM", title: "奔嘉吉蒂森林公园漫步", activity: "在城市氧吧公园长廊骑行或漫步" },
      { time: "8:00 PM", title: "都市繁华夜生活", activity: "探索 Asok 汇聚的世界级餐厅与空中酒吧" }
    ],
    silom: [
      { time: "7:30 AM", title: "蓝毗尼晨间瑜伽", activity: "在整洁的大陆绿洲公园呼吸新鲜空气" },
      { time: "10:00 AM", title: "金融中心商务洽谈", activity: "在 Silom CBD 总部大楼举行高层会议" },
      { time: "12:30 PM", title: "特色拉面与地道美食", activity: "在 Silom 巷弄探索知名日式拉面与街头小吃" },
      { time: "4:30 PM", title: "艺术与历史文化漫步", activity: "打卡经典百年建筑与当代艺术画廊" },
      { time: "7:30 PM", title: "高空酒吧天际 sunset", activity: "在王权云顶大楼附近俯瞰璀璨城景" }
    ],
    "on-nut": [
      { time: "8:00 AM", title: "On Nut 本地早市启程", activity: "在新鲜早市与便利超市采购新鲜食材" },
      { time: "10:30 AM", title: "舒适安静办公", activity: "在平价精致独立咖啡馆享受悠闲办公" },
      { time: "1:00 PM", title: "地道夜市风味", activity: "在 BTS 站旁夜市品尝高性价比泰式小吃" },
      { time: "5:00 PM", title: "Habito 运河社区漫步", activity: "在运河旁绿化社区空间享受惬意生活" },
      { time: "7:30 PM", title: "夜市露天酒吧", activity: "在轻快音乐中与朋友享受轻松夜晚" }
    ],
    ekkamai: [
      { time: "8:30 AM", title: "精酿咖啡晨间品鉴", activity: "在安静的高尚住宅巷弄品尝独立烘焙咖啡" },
      { time: "11:00 AM", title: "创意工作室与买手店", activity: "逛探索特色设计画廊与独立买手精品店" },
      { time: "2:00 PM", title: "宠物友好空间漫步", activity: "带爱宠在宠物友好绿意庭院里度过闲适时光" },
      { time: "5:30 PM", title: "Ekkamai 综合体购物", activity: "在 Gateway Ekkamai 或 Big C 超市采购生活所需" },
      { time: "8:00 PM", title: "精酿酒吧与音乐夜晚", activity: "在特色精酿酒馆与朋友人享受高品质夜生活" }
    ],
    sukhumvit: [
      { time: "9:00 AM", title: "EmDistrict 贵妇圈购物", activity: "在 EmQuartier 与 EmSphere 感受世界级奢华购物" },
      { time: "11:30 AM", title: "奔嘉思利公园休憩", activity: "在城中绿洲公园草坪上放松与漫步" },
      { time: "1:30 PM", title: "环球名厨午宴", activity: "在精致法餐或意式餐厅享用名厨主理午餐" },
      { time: "4:30 PM", title: "五星级水疗 Spa", activity: "在尊享 Spa 水疗中心体验泰式顶级放松按摩" },
      { time: "7:30 PM", title: "城芯天际夜景", activity: "在奢华公寓高层观景台俯瞰 Sukhumvit 璀璨天际线" }
    ],
    "rama-9": [
      { time: "8:30 AM", title: "新 CBD 活力晨间", activity: "在捷运 MRT 9 號 Rama 9 站轻松出行" },
      { time: "10:30 AM", title: "新一代科技商务楼宇", activity: "在 G Tower 等地标大楼体验现代办公" },
      { time: "1:00 PM", title: "Central Rama 9 购物中心", activity: "在大型综合体及 IT 广场采购数码与生活品" },
      { time: "6:00 PM", title: "Jodd Fairs 火车夜市", activity: "打卡知名网红火山排骨与多元美食摊位" },
      { time: "9:00 PM", title: "Ratchada 流行夜生活", activity: "在 Live House 与音乐酒馆体验年轻活力" }
    ],
    "bang-na": [
      { time: "9:00 AM", title: "Mega Bangna 超级购物中心", activity: "在全泰最大型购物巨无霸体验一站式购物" },
      { time: "11:30 AM", title: "宜家宜居家具灵感", activity: "在 IKEA 挑选高品质家居用品与饰品" },
      { time: "2:00 PM", title: "国际学校学区圈", activity: "围绕顶尖国际学校为孩子提供优越教育" },
      { time: "5:00 PM", title: "高尔夫与户外俱乐部", activity: "在高端高尔夫球场与体育俱乐部挥杆放松" },
      { time: "7:30 PM", title: "家庭宽敞晚宴", activity: "在绿意庭院餐厅享用丰盛的家庭聚餐" }
    ],
    "huai-khwang": [
      { time: "9:00 AM", title: "地道中华美食与麻辣鲜香", activity: "在 Huai Khwang 探索正宗四川火锅与中华小吃" },
      { time: "11:30 AM", title: "MRT 捷运快捷出行", activity: "坐拥 MRT 蓝色环线，快速直达 Asok 与 Silom" },
      { time: "3:00 PM", title: "象神庙祈福与人文", activity: "在知名象神庙感受独特的信仰文化与人文特色" },
      { time: "6:30 PM", title: "Huai Khwang 夜市采购", activity: "体验充满生活气息的本地夜市与服饰饰品摊" },
      { time: "10:00 PM", title: "深夜宵夜美食天堂", activity: "在 24 小时营业餐馆享受热闹的深夜聚餐" }
    ],
    "phaya-thai": [
      { time: "8:00 AM", title: "机场快线无缝换乘", activity: "快捷连接 Airport Rail Link 直达素万那普机场" },
      { time: "10:30 AM", title: "医疗与高等教育重镇", activity: "毗邻顶尖公立/私立医院与知名大学学府" },
      { time: "1:00 PM", title: "Phaya Thai 精致咖啡", activity: "在幽静咖啡馆享受专注高效的办公与阅读" },
      { time: "4:30 PM", title: "胜利纪念碑繁华圈", activity: "感受交通枢纽的繁华热闹与地道泰式船面" },
      { time: "7:30 PM", title: "品质公寓温馨夜晚", activity: "在高品质现代化公寓里享受安逸的都市生活" }
    ],
    chatuchak: [
      { time: "9:00 AM", title: "恰图恰周末市场寻宝", activity: "在全泰最大周末市场探索手工艺品与古着" },
      { time: "12:00 PM", title: "Central Ladprao 购物", activity: "在北曼谷最大综合体采购时尚与美食" },
      { time: "3:00 PM", title: "火车公园露天骑行", activity: "在绿树如荫的大型公园租自行车露营漫步" },
      { time: "5:30 PM", title: "Mo Chit 双轨交汇", activity: "BTS 蒙奇站与 MRT 乍都乍公园站双轨换乘" },
      { time: "7:30 PM", title: "公园日落夕阳", activity: "在绿意盎然的公园湖畔欣赏迷人落日" }
    ],
    "rama-4": [
      { time: "8:30 AM", title: "One Bangkok 地标探索", activity: "体验曼谷最新世界级综合体地标" },
      { time: "11:00 AM", title: "Samyan Mitrtown 24h 空间", activity: "在 24 小时营业创意空间学习与灵感碰撞" },
      { time: "1:30 PM", title: "朱拉隆功地道美食巡礼", activity: "探索百年学府旁历史悠久的网红泰式美食" },
      { time: "5:00 PM", title: "快捷通达奔嘉吉蒂公园", activity: "在天桥栈道上步跑健身并欣赏城景" },
      { time: "8:00 PM", title: "快捷直达湄南河畔", activity: "方便前往湄南河沿岸高端酒店与文创园区" }
    ]
  }
};

export function getLocalizedDayItinerary(neighborhood: Neighborhood, lang: "en" | "th" | "zh"): ItineraryItem[] {
  if (lang === "en" || !neighborhood) return neighborhood?.dayItinerary || [];
  const locList = LOCALIZED_ITINERARIES[lang]?.[neighborhood.slug];
  if (locList && locList.length > 0) {
    return locList;
  }
  return neighborhood.dayItinerary || [];
}
