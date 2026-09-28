import { parseSpecText } from "../src/lib/parse/specParser";

const tws = `Версия Bluetooth: V6.0
Модель чипсета (Bluetooth-решение): Bluetrum AB5656C3 (Zhongke Lanxun)
Поддерживаемые аудиокодеки: SBC, AAC
Протоколы Bluetooth: HFP, A2DP, AVRCP
Размер динамика (драйвера): Ø 13 мм, композитная мембрана
Импеданс (сопротивление): 32 Ом ± 15%
Аккумулятор наушника: 30 мАч
Аккумулятор зарядного кейса: 300 мАч
Параметры зарядки кейса: DC 5V / 500mA
Время зарядки наушников: ≈ 1.5 часа
Общее время работы (с учетом дозарядок от кейса): около 18 часов`;

const bzu = `Qi2.2 Certified 25W Fast Charging
20 pcs N52 Magnets
Material: PC, Magnet, Glass, TPU, PU
Dimension: 65*65*31mm
Input:15V/3A
Output: 25W (Max)
Charging frequency: 360.5KHZ
Induction Distance: 1-3mm
Certificate: qi2.2, CE, ROHS`;

const pb = `Battery Capacity：10000mAh 3.85 V / 38.5Wh
AC Input：AC 100V-240V / 50-60Hz / 0.3A (18W Max)
USB-C Input：5V / 3A, 9V / 2A, 12V / 1.5A (18W Max)
USB-C Output：5V / 3A, 9V / 2.22A, 10V / 2.25A, 12V / 1.67A (22.5W Max)
USB-C Cable Output：5V / 3A, 9V / 2.22A, 10V / 2.25A, 12V / 1.67A (22.5W Max)
iP Cable Output：5 V / 2.4 A (12W Max)
Total Output：5V / 3A (15W Max)`;

for (const [name, text] of [["TWS", tws], ["BZU", bzu], ["POWERBANK", pb]] as const) {
  const r = parseSpecText(text);
  console.log(`\n===== ${name} =====`);
  console.log("category:", r.detectedCategory ?? "не визначено");
  console.log("recognized:");
  for (const f of r.recognized) console.log(`  [${f.confidence}] ${f.label || f.key} = ${f.value}`);
  console.log("patch summary:", JSON.stringify({
    model: r.patch.model,
    totalOutputW: r.patch.totalOutputW,
    input: r.patch.input,
    battery: r.patch.battery,
    dimensions: r.patch.dimensions,
    technologies: r.patch.technologies,
    certifications: r.patch.certifications,
    driver: r.patch.driverSize,
    codecs: r.patch.audioCodecs,
    magnetic: r.patch.magneticForce,
    material: r.patch.material,
    ports: r.patch.ports?.map((p) => `${p.type}/${p.direction} ${p.maxW}W`),
  }));
  console.log("unknown lines:", r.unknownLines.length);
  console.log("warnings:", r.warnings);
}
