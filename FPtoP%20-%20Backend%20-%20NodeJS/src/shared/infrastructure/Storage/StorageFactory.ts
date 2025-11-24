import { StorageStrategy } from './Strategies/StorageStrategy';
import { AzureStorageStrategy } from './Strategies/AzureStorageStrategy';

export class StorageFactory {
  static getStrategy(provider: 'azure' | 's3'): StorageStrategy {
    if (provider === 'azure') {
      return new AzureStorageStrategy();
    } else if (provider === 's3') {
      throw new Error('Unsupported storage provider S3');
    } else {
      throw new Error('Unsupported storage provider');
    }
  }
}
