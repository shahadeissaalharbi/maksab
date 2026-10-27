// هنا ننسق الأرقام بالأرقام اللاتينية مثل التصميم
export const formatNumber = (value) => 
  Number(value ?? 0).toLocaleString("en-US");

// هنا ننسق المبالغ المالية بخانتين عشريتين (مثل: 1,200.00)
export const formatMoney = (value) =>
  Number(value ?? 0).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

// هنا تاريخ اليوم مثل: الثلاثاء، 12 مارس
export const formatToday = (date = new Date()) =>
  new Intl.DateTimeFormat("ar-SA-u-ca-gregory-nu-latn", {
    weekday: "long",
    day: "numeric",
    month: "long",
  }).format(date);