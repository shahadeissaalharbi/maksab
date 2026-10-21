// هنا تصنيفات سوق الجملة، و value نفس النوع في الباك
export const CATEGORIES = Object.freeze({
  ALL: Object.freeze({ value: "all", label: "الكل" }),
  RAW_MATERIAL: Object.freeze({ value: "raw_material", label: "مواد خام", tone: "green" }),
  PACKAGING: Object.freeze({ value: "packaging", label: "تغليف", tone: "yellow" }),
  CONTAINERS: Object.freeze({ value: "containers", label: "علب وعبوات", tone: "blue" }),
});

// هنا التصنيفات كقائمة بالترتيب اللي تطلع فيه بالصفحة
export const CATEGORIES_ARRAY = Object.freeze([
  CATEGORIES.ALL,
  CATEGORIES.RAW_MATERIAL,
  CATEGORIES.PACKAGING,
  CATEGORIES.CONTAINERS,
]);

// هنا أجيب التصنيف من قيمته، ولو ما لقيته أرجع الكل
export const getCategory = (value) =>
  CATEGORIES_ARRAY.find((category) => category.value === value) ?? CATEGORIES.ALL;