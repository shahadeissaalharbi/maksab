// هنا الأرقام بفواصل، مثل 18,420
export const formatNumber = (value) => Number(value ?? 0).toLocaleString("en-US");

// هنا تاريخ اليوم، مثل: الثلاثاء، 27 أكتوبر
export const formatToday = () =>
  new Intl.DateTimeFormat("ar-SA-u-ca-gregory-nu-latn", {
    weekday: "long",
    day: "numeric",
    month: "long",
  }).format(new Date());
