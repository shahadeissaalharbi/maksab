// هنا معادلة التسعير، نفس اللي في الباك عشان الرقم يطابق
const CENTS = 100;

// أقرب هللة. toPrecision يشيل الغبار الصغير من حساب الكسور، عشان 629.175 تصير 629.18 مثل الباك
export function roundMoney(value) {
  return Math.round(parseFloat((value * CENTS).toPrecision(15))) / CENTS;
}

// هنا أحول اللي كتبه المستخدم لرقم، والفاضي يرجع null (toNumber) 
export function toNumber(text) {
  if (text === "" || text === null || text === undefined) return null;
  const number = Number(text);
  return Number.isFinite(number) ? number : null;
}

// هنا أتأكد من الأرقام، ويرجع رسالة لكل خانة فيها مشكلة
export function validatePricing(values, messages, limits) {
  const errors = {};
  const costFields = ["material", "packaging", "hours", "hourlyRate"];

  for (const field of costFields) {
    const number = toNumber(values[field]);
    if (number === null) errors[field] = messages.REQUIRED;
    else if (number < 0) errors[field] = messages.NEGATIVE;
  }

  const quantity = toNumber(values.quantity);
  if (quantity === null) errors.quantity = messages.REQUIRED;
  else if (quantity <= 0) errors.quantity = messages.QUANTITY;

  const margin = toNumber(values.margin);
  if (margin === null) errors.margin = messages.REQUIRED;
  else if (margin < 0 || margin > limits.MAX_MARGIN) errors.margin = messages.MARGIN;

  return errors;
}

// هنا أحسب كل شي: التكلفة والسعر المقترح والربح
export function calculatePrice(values) {
  const material = toNumber(values.material);
  const packaging = toNumber(values.packaging);
  const hours = toNumber(values.hours);
  const hourlyRate = toNumber(values.hourlyRate);
  const quantity = toNumber(values.quantity);
  const margin = toNumber(values.margin);

  const labor = hours * hourlyRate;
  const totalCost = material + packaging + labor;
  const unitCost = totalCost / quantity;
  const price = unitCost / (1 - margin / 100);

  const costPerUnit = roundMoney(unitCost);
  const suggestedPrice = roundMoney(price);
  const profitPerUnit = roundMoney(suggestedPrice - costPerUnit);

  return {
    material: roundMoney(material),
    packaging: roundMoney(packaging),
    labor: roundMoney(labor),
    totalCost: roundMoney(totalCost),
    costPerUnit,
    suggestedPrice,
    profitPerUnit,
    totalProfit: roundMoney(profitPerUnit * quantity),
  };
}