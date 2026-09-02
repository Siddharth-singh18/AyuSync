import '../network/local_db.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';

class SyncEngine {
  final String backendUrl = 'http://localhost:5000/api';

  Future<void> runSyncLoop() async {
    final db = await LocalDatabase.instance.database;
    
    // Fetch pending mutations in FIFO order
    final pending = await db.query(
      'sync_queue',
      where: 'syncStatus = ? OR syncStatus = ?',
      whereArgs: ['PENDING', 'RETRY'],
      orderBy: 'createdTime ASC',
    );

    if (pending.isEmpty) return;

    for (var mutation in pending) {
      bool success = await _pushMutation(mutation);
      if (success) {
        await db.update(
          'sync_queue',
          {'syncStatus': 'SYNCED'},
          where: 'operationId = ?',
          whereArgs: [mutation['operationId']],
        );
      } else {
        // 20. CONFLICT RESOLUTION UI
        // If conflict (409), mark as CONFLICT to alert UI
        int retries = (mutation['retryCount'] as int) + 1;
        await db.update(
          'sync_queue',
          {'syncStatus': 'CONFLICT', 'retryCount': retries},
          where: 'operationId = ?',
          whereArgs: [mutation['operationId']],
        );
      }
    }
  }

  Future<bool> _pushMutation(Map<String, dynamic> mutation) async {
    try {
      final response = await http.post(
        Uri.parse('$backendUrl/sync'),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode(mutation),
      );
      return response.statusCode == 200 || response.statusCode == 201;
    } catch (e) {
      return false; // Network failure
    }
  }
}
