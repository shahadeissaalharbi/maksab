-- هنا أحدث جداول Railway القديمة لنفس أسماء كود development
-- آمن لو انشغل أكثر من مرة: كل خطوة تشيك قبل ما تغير

-- 1) users: أسماء الأعمدة الجديدة + أعمدة بيانات النشاط
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns
             WHERE table_name = 'users' AND column_name = 'full_name') THEN
    ALTER TABLE users RENAME COLUMN full_name TO name;
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.columns
             WHERE table_name = 'users' AND column_name = 'password') THEN
    ALTER TABLE users RENAME COLUMN password TO password_hash;
  END IF;
END $$;

ALTER TABLE users ADD COLUMN IF NOT EXISTS phone VARCHAR(20);
ALTER TABLE users ADD COLUMN IF NOT EXISTS business_name VARCHAR(150);
ALTER TABLE users ADD COLUMN IF NOT EXISTS address_text TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS latitude DECIMAL(10, 8);
ALTER TABLE users ADD COLUMN IF NOT EXISTS longitude DECIMAL(11, 8);

-- 2) categories: الجدول + التصنيفات الثلاثة لو الجدول فاضي
CREATE TABLE IF NOT EXISTS categories (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  type VARCHAR(50) NOT NULL DEFAULT 'raw_material'
);

INSERT INTO categories (name, type)
SELECT v.name, v.type
FROM (VALUES
  ('مواد خام', 'raw_material'),
  ('تغليف', 'packaging'),
  ('علب وعبوات', 'containers')
) AS v(name, type)
WHERE NOT EXISTS (SELECT 1 FROM categories);

-- 3) products: أعمدة ريم الجديدة
ALTER TABLE products ADD COLUMN IF NOT EXISTS supplier_id INT REFERENCES users(id);
ALTER TABLE products ADD COLUMN IF NOT EXISTS category_id INT REFERENCES categories(id) ON DELETE SET NULL;
ALTER TABLE products ADD COLUMN IF NOT EXISTS stock_quantity INT NOT NULL DEFAULT 0;
ALTER TABLE products ADD COLUMN IF NOT EXISTS unit VARCHAR(50);
ALTER TABLE products ADD COLUMN IF NOT EXISTS moq INT DEFAULT 1;
ALTER TABLE products ADD COLUMN IF NOT EXISTS stock_status VARCHAR(50) DEFAULT 'in_stock';
ALTER TABLE products ADD COLUMN IF NOT EXISTS image_url VARCHAR(255);
ALTER TABLE products ADD COLUMN IF NOT EXISTS created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE products ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;