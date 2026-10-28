// هنا حالات المخزون، و value نفس اللي يرجعه الباك
export const STOCK_STATUS = Object.freeze({
  IN_STOCK: Object.freeze({ value: "in_stock", label: "متوفر", tone: "green" }),
  OUT_OF_STOCK: Object.freeze({ value: "out_of_stock", label: "نفد", tone: "red" }),
});

// هنا أجيب حالة المخزون من قيمتها، ولو ما لقيتها أعتبرها نفدت
export const getStockStatus = (value) =>
  Object.values(STOCK_STATUS).find((status) => status.value === value) ?? STOCK_STATUS.OUT_OF_STOCK;

// هنا نصوص لوحة المورد في مكان واحد
export const SUPPLIER_TEXT = Object.freeze({
  
  greeting: (name) => `أهلًا ${name}`,
  SUBTITLE: "	منتجاتك ومخزونك، تحت عينك",
  SEARCH_PLACEHOLDER: "البحث في منتجاتك...",
  STAT_TOTAL: "كل المنتجات",
  STAT_IN_STOCK: "متوفرة",
  STAT_OUT_OF_STOCK: "نفدت",
  LOADING: "جاري تحميل منتجاتك...",
  EMPTY: "ما عندك منتجات تطابق بحثك",
  ERROR: "منتجاتك ما وصلت هالمرة، نرجو المحاولة بعد شوي",
  CURRENCY: "ر.س",
  EDIT: "تعديل",
});