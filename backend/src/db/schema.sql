-- Shopee 대량 상품 등록 시스템 데이터베이스 스키마

CREATE TABLE products (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(50),
    shop_id BIGINT,
    item_id BIGINT,
    name VARCHAR(255),
    description TEXT,
    category_id INTEGER,
    brand_id INTEGER DEFAULT 0,
    status VARCHAR(20),  -- 'ready', 'uploading', 'success', 'fail'
    error_message TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE product_models (
    id SERIAL PRIMARY KEY,
    product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
    model_name VARCHAR(100),
    price DECIMAL(10, 2),
    stock INTEGER,
    sku VARCHAR(50)
);

CREATE TABLE shopee_tokens (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(50) UNIQUE,
    shop_id BIGINT,
    merchant_id BIGINT,
    access_token TEXT,
    refresh_token TEXT,
    auth_expires_at TIMESTAMP,
    connected_regions JSONB DEFAULT '[]',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
