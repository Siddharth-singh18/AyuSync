import 'package:sqflite/sqflite.dart';
import 'package:path/path.dart';

class LocalDatabase {
  static final LocalDatabase instance = LocalDatabase._init();
  static Database? _database;

  LocalDatabase._init();

  Future<Database> get database async {
    if (_database != null) return _database!;
    _database = await _initDB('ayusync.db');
    return _database!;
  }

  Future<Database> _initDB(String filePath) async {
    final dbPath = await getDatabasesPath();
    final path = join(dbPath, filePath);

    return await openDatabase(
      path,
      version: 1,
      onCreate: _createDB,
      onOpen: (db) async {
        await _createSessionTable(db);
      },
    );
  }

  Future _createDB(Database db, int version) async {
    const idType = 'TEXT PRIMARY KEY';
    const textType = 'TEXT NOT NULL';
    const intType = 'INTEGER NOT NULL';
    const boolType = 'BOOLEAN NOT NULL';

    // 18. OFFLINE-FIRST MOBILE ARCHITECTURE
    // Store pending mutations locally
    await db.execute('''
CREATE TABLE sync_queue (
  operationId $idType,
  entityId $textType,
  entity $textType,
  operation $textType,
  payload $textType,
  createdTime $textType,
  retryCount $intType,
  syncStatus $textType
)
''');

    await db.execute('''
CREATE TABLE patients (
  id $idType,
  name $textType,
  age $intType,
  gender $textType,
  isSynced $boolType
)
''');

    await _createSessionTable(db);
  }

  Future _createSessionTable(Database db) async {
    await db.execute('''
CREATE TABLE IF NOT EXISTS app_session (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL
)
''');
  }

  Future<void> saveSession(Map<String, String> sessionData) async {
    final db = await instance.database;
    final batch = db.batch();
    sessionData.forEach((key, value) {
      batch.insert(
        'app_session',
        {'key': key, 'value': value},
        conflictAlgorithm: ConflictAlgorithm.replace,
      );
    });
    await batch.commit(noResult: true);
  }

  Future<Map<String, String>> getAllSession() async {
    final db = await instance.database;
    final records = await db.query('app_session');
    final map = <String, String>{};
    for (final row in records) {
      map[row['key'] as String] = row['value'] as String;
    }
    return map;
  }

  Future<void> clearSession() async {
    final db = await instance.database;
    await db.delete('app_session');
  }

  Future<void> queueMutation(Map<String, dynamic> mutation) async {
    final db = await instance.database;
    await db.insert('sync_queue', mutation);
  }

  Future<void> close() async {
    final db = await instance.database;
    db.close();
  }
}
