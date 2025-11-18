/**
 * Storage Adapter Interface
 * Enables storing files/artifacts from workflow executions
 */

export interface StorageObject {
  key: string;
  bucket?: string;
  contentType?: string;
  metadata?: Record<string, string>;
}

export interface StorageUploadResult {
  success: boolean;
  url?: string;
  key: string;
  error?: string;
}

export interface StorageDownloadResult {
  success: boolean;
  data?: Buffer | string;
  contentType?: string;
  error?: string;
}

export interface IStorageAdapter {
  /**
   * Provider name (e.g., "s3", "gcs", "local")
   */
  readonly provider: string;

  /**
   * Upload data to storage
   */
  upload(
    key: string,
    data: Buffer | string,
    options?: {
      bucket?: string;
      contentType?: string;
      metadata?: Record<string, string>;
    }
  ): Promise<StorageUploadResult>;

  /**
   * Download data from storage
   */
  download(key: string, bucket?: string): Promise<StorageDownloadResult>;

  /**
   * Delete object from storage
   */
  delete(key: string, bucket?: string): Promise<boolean>;

  /**
   * Check if object exists
   */
  exists(key: string, bucket?: string): Promise<boolean>;

  /**
   * Generate signed URL for temporary access
   */
  getSignedUrl?(key: string, bucket?: string, expiresIn?: number): Promise<string>;
}

/**
 * In-Memory Storage Adapter (for testing)
 */
export class InMemoryStorageAdapter implements IStorageAdapter {
  readonly provider = 'memory';
  private storage: Map<string, { data: Buffer | string; contentType?: string }> = new Map();

  async upload(
    key: string,
    data: Buffer | string,
    options?: { contentType?: string }
  ): Promise<StorageUploadResult> {
    this.storage.set(key, {
      data,
      contentType: options?.contentType,
    });

    return {
      success: true,
      key,
      url: `memory://${key}`,
    };
  }

  async download(key: string): Promise<StorageDownloadResult> {
    const stored = this.storage.get(key);

    if (!stored) {
      return {
        success: false,
        error: 'Object not found',
      };
    }

    return {
      success: true,
      data: stored.data,
      contentType: stored.contentType,
    };
  }

  async delete(key: string): Promise<boolean> {
    return this.storage.delete(key);
  }

  async exists(key: string): Promise<boolean> {
    return this.storage.has(key);
  }

  clear(): void {
    this.storage.clear();
  }
}

/**
 * Storage Adapter Registry
 */
class StorageAdapterRegistry {
  private adapters: Map<string, IStorageAdapter> = new Map();
  private defaultProvider = 'memory';

  constructor() {
    // Register in-memory adapter by default
    this.register(new InMemoryStorageAdapter());
  }

  register(adapter: IStorageAdapter): void {
    this.adapters.set(adapter.provider, adapter);
  }

  get(provider: string): IStorageAdapter | undefined {
    return this.adapters.get(provider);
  }

  getDefault(): IStorageAdapter {
    const adapter = this.adapters.get(this.defaultProvider);
    if (!adapter) {
      throw new Error(`Default storage adapter "${this.defaultProvider}" not found`);
    }
    return adapter;
  }

  setDefault(provider: string): void {
    if (!this.adapters.has(provider)) {
      throw new Error(`Storage adapter "${provider}" not registered`);
    }
    this.defaultProvider = provider;
  }

  listProviders(): string[] {
    return Array.from(this.adapters.keys());
  }
}

// Export singleton registry
export const storageRegistry = new StorageAdapterRegistry();
