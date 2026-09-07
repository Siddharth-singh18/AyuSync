import 'package:flutter/foundation.dart';
import 'package:sqflite/sqflite.dart';
import 'package:path/path.dart';
import 'package:connectivity_plus/connectivity_plus.dart';
import 'dart:convert';
import '../network/api_service.dart';

class SyncEngine {
  static final SyncEngine _instance = SyncEngine._internal();
  factory SyncEngine() => _instance;
  SyncEngine._internal();

  Database? _db;
  final ApiService _apiService = ApiService();

  Future<void> init() async {
    _db = await openDatabase(
      join(await getDatabasesPath(), 'ayusync_offline.db'),
      onCreate: (db, version) {
        return db.execute(
          'CREATE TABLE mutation_queue(id TEXT PRIMARY KEY, entity TEXT, action TEXT, payload TEXT, status TEXT)',
        );
      },
      version: 1,
    );

    Connectivity()
        .onConnectivityChanged
        .listen((List<ConnectivityResult> results) {
      if (!results.contains(ConnectivityResult.none)) {
        syncNow();
      }
    });
  }

  Future<void> queueMutation(String id, String entity, String action,
      Map<String, dynamic> payload) async {
    await _db?.insert(
      'mutation_queue',
      {
        'id': id,
        'entity': entity,
        'action': action,
        'payload': jsonEncode(payload),
        'status': 'PENDING'
      },
      conflictAlgorithm: ConflictAlgorithm.replace,
    );

    final connectivityResult = await Connectivity().checkConnectivity();

    if (!connectivityResult.contains(ConnectivityResult.none)) {
      syncNow();
    }
  }

  Future<void> syncNow() async {
    if (_db == null) return;

    final pending = await _db!
        .query('mutation_queue', where: 'status = ?', whereArgs: ['PENDING']);
    if (pending.isEmpty) return;

    try {
      final mutations = pending.map((p) {
        return {
          'operationId': p['id'],
          'entity': p['entity'],
          'action': p['action'],
          'payload': jsonDecode(p['payload'] as String),
          'deviceId': 'flutter-mobile-client',
          'timestamp': DateTime.now().toIso8601String(),
        };
      }).toList();

      final response = await _apiService.pushSyncBatch(
        workerId: 'ASHA-CG-4902',
        mutations: mutations,
      );

      if (response.isSuccess && response.data != null) {
        final results = response.data!['results'] as List?;
        if (results != null) {
          for (var res in results) {
            if (res is Map &&
                (res['status'] == 'SUCCESS' || res['status'] == 'ALREADY_SYNCED')) {
              await _db!.update(
                'mutation_queue',
                {'status': 'SYNCED'},
                where: 'id = ?',
                whereArgs: [res['operationId']],
              );
            }
          }
        }
      }
    } catch (e) {
      debugPrint('SyncEngine push failed: $e');
    }
  }
}
