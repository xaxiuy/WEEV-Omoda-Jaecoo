export interface Env {
  DB: D1Database;
  JWT_SECRET: string;
  JWT_REFRESH_SECRET: string;
  R2_BUCKET: R2Bucket;
}

export interface HonoContext {
  userId?: string;
  role?: string;
  brandId?: string;
  brandRole?: string;
}
