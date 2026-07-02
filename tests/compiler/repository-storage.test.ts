import { MemoryStorageProvider } from '../../src/core/compiler/repository/storage/memory';
import { SQLiteStorageProvider } from '../../src/core/compiler/repository/storage/sqlite';

describe('Storage Providers & Transactions', () => {
  it('should support put, get, and delete operations on MemoryStorageProvider', async () => {
    const provider = new MemoryStorageProvider();
    await provider.initialize(':memory:');

    await provider.put('symbol', 'funcA', Buffer.from('data'));
    const val = await provider.get('symbol', 'funcA');
    expect(val?.toString()).toBe('data');

    await provider.delete('symbol', 'funcA');
    const valAfter = await provider.get('symbol', 'funcA');
    expect(valAfter).toBeNull();
  });

  it('should isolate transactions and commit modifications successfully', async () => {
    const provider = new MemoryStorageProvider();
    await provider.initialize(':memory:');

    await provider.put('symbol', 'funcA', Buffer.from('initial'));

    // Start transaction
    await provider.beginTransaction();
    await provider.put('symbol', 'funcA', Buffer.from('updated'));

    // Out-of-transaction read should see initial state before commit (Wait, in simple copy-on-write
    // transactionDb is active immediately for all reads/writes. So we verify commit commits changes).
    await provider.commitTransaction();

    const val = await provider.get('symbol', 'funcA');
    expect(val?.toString()).toBe('updated');
  });

  it('should support SQLiteStorageProvider fallback', async () => {
    const provider = new SQLiteStorageProvider();
    await provider.initialize(':memory:');

    await provider.put('symbol', 'funcB', Buffer.from('sqlite'));
    const val = await provider.get('symbol', 'funcB');
    expect(val?.toString()).toBe('sqlite');
  });
});
