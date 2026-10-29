// هنا تصنيفات سوق الجملة، و value نفس النوع في الباك
export const CATEGORIES = {
  ALL: { value: "all", label: "الكل" },
  RAW_MATERIAL: { value: "raw_material", label: "مواد خام", tone: "green" },
  PACKAGING: { value: "packaging", label: "تغليف", tone: "yellow" },
  CONTAINERS: { value: "containers", label: "علب وعبوات", tone: "blue" },
};

// هنا التصنيفات كقائمة بالترتيب اللي تطلع فيه بالصفحة
export const CATEGORIES_ARRAY = [
  CATEGORIES.ALL,
  CATEGORIES.RAW_MATERIAL,
  CATEGORIES.PACKAGING,
  CATEGORIES.CONTAINERS,
];

// هنا أجيب التصنيف من قيمته، ولو ما لقيته أرجع الكل
export const getCategory = (value) =>
  CATEGORIES_ARRAY.find((category) => category.value === value) || CATEGORIES.ALL;