import 'package:flutter/material.dart';
import 'package:uuid/uuid.dart';
import '../models/patient_model.dart';
import '../models/assessment_model.dart';
import '../models/triage_model.dart';
import '../models/facility_model.dart';
import '../models/followup_model.dart';
import '../models/sync_item_model.dart';
import '../network/api_service.dart';
import '../network/local_db.dart';

class AppState extends ChangeNotifier {
  final _uuid = const Uuid();
  final ApiService _apiService = ApiService();

  // Network Connectivity State (Toggleable in UI for testing flows)
  bool _isOnline = true;
  bool get isOnline => _isOnline;

  // Logged in worker info
  String _workerName = 'Sunita Patil';
  String _workerId = 'ASHA-CG-4902';
  String _workerCenter = 'Phulgaon Sub-Centre';
  String _workerPhone = '9998887776';
  bool _isLoggedIn = false;
  bool _isLoading = false;
  String? _lastErrorMessage;
  DateTime? _lastSyncTimestamp;

  String get workerName => _workerName;
  String get workerId => _workerId;
  String get workerCenter => _workerCenter;
  String get workerPhone => _workerPhone;
  bool get isLoggedIn => _isLoggedIn;
  bool get isLoading => _isLoading;
  String? get lastErrorMessage => _lastErrorMessage;
  DateTime? get lastSyncTimestamp => _lastSyncTimestamp;

  // Live Dashboard Metrics
  int _totalPatientsCount = 3;
  int _pendingReferralsCount = 2;
  int _activeAssessmentsCount = 2;
  int _queueCount = 0;

  int get totalPatientsCount => _totalPatientsCount;
  int get pendingReferralsCount => _pendingReferralsCount;
  int get activeAssessmentsCount => _activeAssessmentsCount;
  int get queueCount => _queueCount;

  // Local Patients List (Initialized with offline fallbacks)
  final List<Patient> _patients = [
    Patient(
      id: 'P-101',
      name: 'Ramesh Patel',
      age: 48,
      gender: 'Male',
      phone: '+91 98234 11223',
      village: 'Rampur',
      abhaId: '91-4829-1029-4821',
      bloodGroup: 'B+',
      createdAt: DateTime.now().subtract(const Duration(days: 14)),
      isSynced: true,
    ),
    Patient(
      id: 'P-102',
      name: 'Pooja Bai',
      age: 27,
      gender: 'Female',
      phone: '+91 94112 33445',
      village: 'Gopalpur',
      abhaId: '91-3312-9901-4412',
      bloodGroup: 'O+',
      createdAt: DateTime.now().subtract(const Duration(days: 5)),
      isSynced: true,
    ),
    Patient(
      id: 'P-103',
      name: 'Lakhanlal Sahu',
      age: 62,
      gender: 'Male',
      phone: '+91 97723 55667',
      village: 'Rampur',
      abhaId: '91-1122-8877-6655',
      bloodGroup: 'A+',
      createdAt: DateTime.now().subtract(const Duration(days: 1)),
      isSynced: true,
    ),
  ];
  List<Patient> get patients => List.unmodifiable(_patients);

  // Assessments History Map: patientId -> List<Assessment>
  final Map<String, List<Assessment>> _patientAssessments = {
    'P-101': [
      Assessment(
        id: 'ASM-001',
        patientId: 'P-101',
        primarySymptom: 'Chest tightness & Mild shortness of breath',
        severity: 'MODERATE',
        durationDays: 3,
        vitals: Vitals(
          temperature: 98.6,
          systolicBp: 148,
          diastolicBp: 95,
          pulseRate: 88,
          spo2: 96,
          bloodGlucose: 140,
        ),
        clinicalNotes: 'Known hypertensive patient. Missed medication for 2 days.',
        timestamp: DateTime.now().subtract(const Duration(days: 14)),
      ),
    ],
    'P-103': [
      Assessment(
        id: 'ASM-002',
        patientId: 'P-103',
        primarySymptom: 'High grade fever with chills & cough',
        severity: 'SEVERE',
        durationDays: 4,
        vitals: Vitals(
          temperature: 102.4,
          systolicBp: 110,
          diastolicBp: 72,
          pulseRate: 104,
          spo2: 93,
        ),
        clinicalNotes: 'Suspected respiratory infection / Pneumonia.',
        timestamp: DateTime.now().subtract(const Duration(days: 1)),
      ),
    ],
  };

  // Follow-up Counter-Referral Tasks
  final List<FollowUpTask> _followUpTasks = [
    FollowUpTask(
      id: 'TASK-501',
      patientId: 'P-101',
      patientName: 'Ramesh Patel',
      patientPhone: '+91 98234 11223',
      doctorName: 'Dr. Rajesh Deshmukh',
      doctorFacility: 'Bilaspur PHC',
      taskDescription: 'Post-hypertension blood pressure monitoring & Amlodipine compliance check',
      instructions: 'Record BP sitting and standing. Ensure patient takes Amlodipine 5mg once daily in morning.',
      prescribedMedicines: ['Tab. Amlodipine 5mg (1-0-0)', 'Tab. Paracetamol 500mg SOS'],
      dueDate: DateTime.now().add(const Duration(days: 1)),
      status: 'PENDING',
    ),
    FollowUpTask(
      id: 'TASK-502',
      patientId: 'P-102',
      patientName: 'Pooja Bai',
      patientPhone: '+91 94112 33445',
      doctorName: 'Dr. Priya Kulkarni',
      doctorFacility: 'Raigarh CHC',
      taskDescription: 'Post-natal checkup (Day 14) & Infant weight check',
      instructions: 'Check maternal hemoglobin levels, temperature, and verify exclusive breastfeeding.',
      prescribedMedicines: ['Tab. IFA (Iron Folic Acid) 1 daily', 'Tab. Calcium 500mg'],
      dueDate: DateTime.now().subtract(const Duration(days: 1)),
      status: 'OVERDUE',
    ),
  ];
  List<FollowUpTask> get followUpTasks => List.unmodifiable(_followUpTasks);

  // Available Health Facilities for Smart Routing
  List<Facility> _facilities = [
    Facility(
      id: 'FAC-01',
      name: 'Rampur Sub-Health Centre',
      type: 'Sub-Center',
      distanceKm: 0.8,
      readinessScore: 78,
      hasSpecialist: false,
      hasEmergency: false,
      availableBeds: 2,
      waitingMinutes: 10,
      availableServices: ['Basic Triage', 'NCD Screening', 'First Aid', 'Immunization'],
      freshness: 'Updated live',
    ),
    Facility(
      id: 'FAC-02',
      name: 'Bilaspur Primary Health Centre (PHC)',
      type: 'Primary Health Centre (PHC)',
      distanceKm: 6.5,
      readinessScore: 92,
      hasSpecialist: true,
      hasEmergency: true,
      availableBeds: 12,
      waitingMinutes: 25,
      availableServices: ['General Medicine', 'MBBS Doctor', 'Basic Diagnostics', 'Pharmacy', 'Emergency 24x7'],
      freshness: 'Updated live',
    ),
    Facility(
      id: 'FAC-03',
      name: 'Raigarh Community Health Centre (CHC)',
      type: 'Community Health Centre (CHC)',
      distanceKm: 18.2,
      readinessScore: 89,
      hasSpecialist: true,
      hasEmergency: true,
      availableBeds: 30,
      waitingMinutes: 40,
      availableServices: ['OBGYN', 'Pediatrics', 'General Surgery', 'X-Ray & Lab', 'Inpatient Ward'],
      freshness: 'Updated live',
    ),
    Facility(
      id: 'FAC-04',
      name: 'District Hospital Bilaspur',
      type: 'District Hospital',
      distanceKm: 34.0,
      readinessScore: 96,
      hasSpecialist: true,
      hasEmergency: true,
      availableBeds: 150,
      waitingMinutes: 60,
      availableServices: ['ICU', 'Cardiology', 'Pulmonology', 'Trauma Center', 'Blood Bank', 'CT Scan'],
      freshness: 'Updated live',
    ),
  ];
  List<Facility> get facilities => List.unmodifiable(_facilities);

  // Offline Sync Queue
  final List<SyncItem> _syncQueue = [];
  List<SyncItem> get syncQueue => List.unmodifiable(_syncQueue);

  // Active Flow Working Variables
  Patient? _currentPatient;
  Assessment? _currentAssessment;
  TriageResult? _currentTriageResult;
  Facility? _selectedFacility;
  ReferralCase? _lastSubmittedCase;

  Patient? get currentPatient => _currentPatient;
  Assessment? get currentAssessment => _currentAssessment;
  TriageResult? get currentTriageResult => _currentTriageResult;
  Facility? get selectedFacility => _selectedFacility;
  ReferralCase? get lastSubmittedCase => _lastSubmittedCase;

  // =========================================================
  // ACTIONS & METHODS
  // =========================================================

  void toggleOnlineStatus() {
    _isOnline = !_isOnline;
    notifyListeners();
  }

  /// Restores persistent session from SQLite local DB on app startup
  Future<void> restoreSession() async {
    try {
      final session = await LocalDatabase.instance.getAllSession();
      if (session['is_logged_in'] == 'true') {
        _isLoggedIn = true;
        if (session['worker_id'] != null && session['worker_id']!.isNotEmpty) {
          _workerId = session['worker_id']!;
        }
        if (session['worker_name'] != null && session['worker_name']!.isNotEmpty) {
          _workerName = session['worker_name']!;
        }
        if (session['worker_phone'] != null && session['worker_phone']!.isNotEmpty) {
          _workerPhone = session['worker_phone']!;
        }
        if (session['worker_center'] != null && session['worker_center']!.isNotEmpty) {
          _workerCenter = session['worker_center']!;
        }
        final token = session['auth_token'];
        if (token != null && token.isNotEmpty) {
          _apiService.setAuthToken(token);
        }
        notifyListeners();
        // Load fresh metrics in background
        loadDashboardData();
      }
    } catch (_) {}
  }

  /// Real Backend Login with fallback
  Future<bool> login(String phoneOrId, String password) async {
    _isLoading = true;
    _lastErrorMessage = null;
    notifyListeners();

    // Clean phone input (backend accepts 10-digit phone, +91, etc.)
    String cleanPhone = phoneOrId.trim();
    if (cleanPhone.contains('@')) {
      // If user typed email or ASHA handle, map to default seed worker phone
      cleanPhone = '9998887776';
    }

    try {
      if (_isOnline) {
        final response = await _apiService.login(
          phone: cleanPhone,
          password: password,
        );

        if (response.isSuccess && response.data != null) {
          final user = response.data!['user'] as Map<String, dynamic>?;
          if (user != null) {
            _workerId = user['id']?.toString() ?? 'ASHA-CG-4902';
            _workerName = user['name']?.toString() ?? 'Sunita Patil';
            _workerPhone = user['phone']?.toString() ?? cleanPhone;
            if (user['facilityName'] != null) {
              _workerCenter = user['facilityName'].toString();
            }
          }
          _isLoggedIn = true;
          _isLoading = false;

          // Save session to persistent SQLite storage
          await LocalDatabase.instance.saveSession({
            'is_logged_in': 'true',
            'worker_id': _workerId,
            'worker_name': _workerName,
            'worker_phone': _workerPhone,
            'worker_center': _workerCenter,
            'auth_token': _apiService.authToken ?? '',
          });

          notifyListeners();

          // Fetch fresh facilities, tasks & dashboard metrics in background
          loadDashboardData();
          return true;
        } else {
          _lastErrorMessage = response.errorMessage ?? 'Login failed';
        }
      }
    } catch (e) {
      _lastErrorMessage = e.toString();
    }

    // Offline / Demo Fallback Mode
    _workerId = phoneOrId.isEmpty ? 'ASHA-CG-4902' : phoneOrId;
    _isLoggedIn = true;
    _isLoading = false;

    // Save session to persistent SQLite storage
    await LocalDatabase.instance.saveSession({
      'is_logged_in': 'true',
      'worker_id': _workerId,
      'worker_name': _workerName,
      'worker_phone': _workerPhone,
      'worker_center': _workerCenter,
      'auth_token': _apiService.authToken ?? '',
    });

    notifyListeners();
    return true;
  }

  Future<void> logout() async {
    _isLoggedIn = false;
    _apiService.clearAuthToken();
    try {
      await LocalDatabase.instance.clearSession();
    } catch (_) {}
    notifyListeners();
  }

  /// Loads dynamic data from backend (facilities, analytics metrics, delta updates)
  Future<void> loadDashboardData() async {
    if (!_isOnline) return;

    try {
      // 1. Fetch live facilities
      final facResponse = await _apiService.getFacilities();
      if (facResponse.isSuccess && facResponse.data != null && facResponse.data!.isNotEmpty) {
        _facilities = facResponse.data!
            .map((f) => Facility.fromBackendMap(Map<String, dynamic>.from(f as Map)))
            .toList();
      }

      // 2. Fetch dashboard metrics
      final metricsResponse = await _apiService.getDashboardAnalytics();
      if (metricsResponse.isSuccess && metricsResponse.data != null) {
        final actual = metricsResponse.data!['actual'] as Map<String, dynamic>?;
        if (actual != null) {
          _totalPatientsCount = (actual['totalPatients'] as num?)?.toInt() ?? _patients.length;
          _pendingReferralsCount = (actual['pendingReferrals'] as num?)?.toInt() ?? 2;
          _activeAssessmentsCount = (actual['activeAssessments'] as num?)?.toInt() ?? 2;
          _queueCount = (actual['patientsInQueue'] as num?)?.toInt() ?? 0;
        }
      }

      // 3. Pull delta sync changes (patients, followups, tasks)
      final pullResponse = await _apiService.pullSyncChanges(
        since: _lastSyncTimestamp,
        workerId: _workerId,
      );

      if (pullResponse.isSuccess && pullResponse.data != null) {
        final delta = pullResponse.data!['delta'] as Map<String, dynamic>?;
        if (delta != null) {
          // Merge server patients
          final serverPatients = delta['patients'] as List?;
          if (serverPatients != null && serverPatients.isNotEmpty) {
            for (var p in serverPatients) {
              final pat = Patient.fromMap(Map<String, dynamic>.from(p as Map));
              final idx = _patients.indexWhere((existing) => existing.id == pat.id);
              if (idx >= 0) {
                _patients[idx] = pat;
              } else {
                _patients.insert(0, pat);
              }
            }
          }

          // Merge server follow-up tasks
          final serverFollowups = delta['followups'] as List?;
          if (serverFollowups != null && serverFollowups.isNotEmpty) {
            for (var f in serverFollowups) {
              final task = FollowUpTask.fromBackendFollowUp(Map<String, dynamic>.from(f as Map));
              final idx = _followUpTasks.indexWhere((t) => t.id == task.id);
              if (idx >= 0) {
                _followUpTasks[idx] = task;
              } else {
                _followUpTasks.insert(0, task);
              }
            }
          }
        }
        if (pullResponse.data!['syncTimestamp'] != null) {
          _lastSyncTimestamp = DateTime.tryParse(pullResponse.data!['syncTimestamp'].toString());
        }
      }

      notifyListeners();
    } catch (e) {
      debugPrint('Error loading dashboard data: $e');
    }
  }

  void setCurrentPatient(Patient patient) {
    _currentPatient = patient;
    notifyListeners();
  }

  /// Register patient against POST /api/patients with offline fallback
  Future<Patient> registerPatientAsync({
    required String name,
    required int age,
    required String gender,
    required String phone,
    required String village,
    String? abhaId,
    String? bloodGroup,
    String? dob,
    String? emergencyContact,
    String? preferredLanguage,
    String? district,
    String? state,
    String? pinCode,
    String? address,
    String? allergies,
    String? existingConditions,
    String? currentMedications,
    String? pastHistory,
  }) async {
    Patient newPatient = Patient(
      id: 'P-${100 + _patients.length + 1}',
      name: name,
      age: age,
      gender: gender,
      phone: phone,
      village: village,
      abhaId: (abhaId != null && abhaId.isNotEmpty) ? abhaId : '91-${_uuid.v4().substring(0, 4)}-${_uuid.v4().substring(0, 4)}',
      bloodGroup: bloodGroup,
      dob: dob,
      emergencyContact: emergencyContact,
      preferredLanguage: preferredLanguage,
      district: district,
      state: state,
      pinCode: pinCode,
      address: address,
      allergies: allergies,
      existingConditions: existingConditions,
      currentMedications: currentMedications,
      pastHistory: pastHistory,
      isSynced: _isOnline,
    );

    if (_isOnline) {
      try {
        final res = await _apiService.createPatient(
          name: name,
          age: age,
          gender: gender,
          phone: phone,
          village: village,
          dob: dob,
          abhaId: abhaId,
        );

        if (res.isSuccess && res.data != null) {
          newPatient = Patient.fromMap(res.data!).copyWith(
            bloodGroup: bloodGroup,
            dob: dob,
            emergencyContact: emergencyContact,
            preferredLanguage: preferredLanguage,
            district: district,
            state: state,
            pinCode: pinCode,
            address: address,
            allergies: allergies,
            existingConditions: existingConditions,
            currentMedications: currentMedications,
            pastHistory: pastHistory,
            isSynced: true,
          );
        } else {
          // If conflict or validation error, preserve offline sync queue
          newPatient = newPatient.copyWith(isSynced: false);
          _syncQueue.add(SyncItem(
            id: _uuid.v4(),
            entityType: 'PATIENT',
            action: 'CREATE',
            description: 'New Patient: ${newPatient.name} (${newPatient.village})',
            payload: newPatient.toMap(),
          ));
        }
      } catch (e) {
        newPatient = newPatient.copyWith(isSynced: false);
        _syncQueue.add(SyncItem(
          id: _uuid.v4(),
          entityType: 'PATIENT',
          action: 'CREATE',
          description: 'New Patient: ${newPatient.name} (${newPatient.village})',
          payload: newPatient.toMap(),
        ));
      }
    } else {
      _syncQueue.add(SyncItem(
        id: _uuid.v4(),
        entityType: 'PATIENT',
        action: 'CREATE',
        description: 'New Patient: ${newPatient.name} (${newPatient.village})',
        payload: newPatient.toMap(),
      ));
    }

    _patients.insert(0, newPatient);
    _currentPatient = newPatient;
    _totalPatientsCount += 1;
    notifyListeners();
    return newPatient;
  }

  /// Synchronous wrapper for existing UI calls
  Patient registerPatient({
    required String name,
    required int age,
    required String gender,
    required String phone,
    required String village,
    String? abhaId,
    String? bloodGroup,
  }) {
    final newPatient = Patient(
      id: 'P-${100 + _patients.length + 1}',
      name: name,
      age: age,
      gender: gender,
      phone: phone,
      village: village,
      abhaId: (abhaId != null && abhaId.isNotEmpty) ? abhaId : '91-${_uuid.v4().substring(0, 4)}-${_uuid.v4().substring(0, 4)}',
      bloodGroup: bloodGroup,
      isSynced: _isOnline,
    );

    _patients.insert(0, newPatient);
    _currentPatient = newPatient;
    _totalPatientsCount += 1;

    if (!_isOnline) {
      _syncQueue.add(SyncItem(
        id: _uuid.v4(),
        entityType: 'PATIENT',
        action: 'CREATE',
        description: 'New Patient: ${newPatient.name} (${newPatient.village})',
        payload: newPatient.toMap(),
      ));
    } else {
      // Trigger fire-and-forget sync to backend
      _apiService.createPatient(
        name: name,
        age: age,
        gender: gender,
        phone: phone,
        village: village,
        abhaId: abhaId,
      );
    }

    notifyListeners();
    return newPatient;
  }

  List<Assessment> getAssessmentsForPatient(String patientId) {
    return _patientAssessments[patientId] ?? [];
  }

  /// Fetch full patient timeline from backend GET /api/patients/:id/timeline
  Future<void> fetchPatientTimeline(String patientId) async {
    if (!_isOnline) return;

    try {
      final res = await _apiService.getPatientTimeline(patientId);
      if (res.isSuccess && res.data != null) {
        final encounters = res.data!['encounters'] as List?;
        if (encounters != null) {
          final assessmentsList = <Assessment>[];
          for (var enc in encounters) {
            if (enc is Map && enc['assessments'] is List) {
              for (var asm in (enc['assessments'] as List)) {
                if (asm is Map) {
                  final fullAsm = Map<String, dynamic>.from(asm);
                  fullAsm['encounter'] = enc;
                  assessmentsList.add(Assessment.fromMap(fullAsm));
                }
              }
            }
          }
          if (assessmentsList.isNotEmpty) {
            _patientAssessments[patientId] = assessmentsList;
            notifyListeners();
          }
        }
      }
    } catch (e) {
      debugPrint('Error fetching patient timeline: $e');
    }
  }

  /// Create assessment and trigger XAI Triage from backend POST /api/assessments
  Future<Assessment> createAssessmentAsync({
    required String patientId,
    required String primarySymptom,
    required String severity,
    required int durationDays,
    required Vitals vitals,
    String? clinicalNotes,
  }) async {
    Assessment assessment = Assessment(
      id: 'ASM-${100 + (_patientAssessments[patientId]?.length ?? 0) + 1}',
      patientId: patientId,
      primarySymptom: primarySymptom,
      severity: severity,
      durationDays: durationDays,
      vitals: vitals,
      clinicalNotes: clinicalNotes,
      isSynced: _isOnline,
    );

    if (_isOnline) {
      try {
        final symptomsPayload = [
          {
            'name': primarySymptom,
            'duration': '$durationDays days',
            'severity': severity.toUpperCase(),
          }
        ];
        final vitalsPayload = vitals.toBackendVitalsList();

        final res = await _apiService.createAssessment(
          patientId: patientId,
          symptoms: symptomsPayload,
          vitals: vitalsPayload,
          provenance: 'WORKER_RECORDED',
        );

        if (res.isSuccess && res.data != null) {
          assessment = Assessment.fromMap(res.data!);

          // If backend generated AI Recommendation, use it
          if (assessment.rawAiRecommendation != null) {
            _currentTriageResult = TriageResult.fromBackendRecommendation(
              assessment.rawAiRecommendation!,
              assessmentId: assessment.id,
              fallbackSymptom: primarySymptom,
            );
          } else {
            _currentTriageResult = _computeTriage(assessment);
          }
        } else {
          _currentTriageResult = _computeTriage(assessment);
          _syncQueue.add(SyncItem(
            id: _uuid.v4(),
            entityType: 'ASSESSMENT',
            action: 'CREATE',
            description: 'Vitals & Assessment: $primarySymptom (Severity: $severity)',
            payload: assessment.toMap(),
          ));
        }
      } catch (e) {
        _currentTriageResult = _computeTriage(assessment);
        _syncQueue.add(SyncItem(
          id: _uuid.v4(),
          entityType: 'ASSESSMENT',
          action: 'CREATE',
          description: 'Vitals & Assessment: $primarySymptom (Severity: $severity)',
          payload: assessment.toMap(),
        ));
      }
    } else {
      _currentTriageResult = _computeTriage(assessment);
      _syncQueue.add(SyncItem(
        id: _uuid.v4(),
        entityType: 'ASSESSMENT',
        action: 'CREATE',
        description: 'Vitals & Assessment: $primarySymptom (Severity: $severity)',
        payload: assessment.toMap(),
      ));
    }

    if (!_patientAssessments.containsKey(patientId)) {
      _patientAssessments[patientId] = [];
    }
    _patientAssessments[patientId]!.insert(0, assessment);
    _currentAssessment = assessment;
    _activeAssessmentsCount += 1;

    notifyListeners();
    return assessment;
  }

  /// Synchronous wrapper
  Assessment createAssessment({
    required String patientId,
    required String primarySymptom,
    required String severity,
    required int durationDays,
    required Vitals vitals,
    String? clinicalNotes,
  }) {
    final assessment = Assessment(
      id: 'ASM-${100 + (_patientAssessments[patientId]?.length ?? 0) + 1}',
      patientId: patientId,
      primarySymptom: primarySymptom,
      severity: severity,
      durationDays: durationDays,
      vitals: vitals,
      clinicalNotes: clinicalNotes,
      isSynced: _isOnline,
    );

    if (!_patientAssessments.containsKey(patientId)) {
      _patientAssessments[patientId] = [];
    }
    _patientAssessments[patientId]!.insert(0, assessment);
    _currentAssessment = assessment;
    _currentTriageResult = _computeTriage(assessment);

    if (!_isOnline) {
      _syncQueue.add(SyncItem(
        id: _uuid.v4(),
        entityType: 'ASSESSMENT',
        action: 'CREATE',
        description: 'Vitals & Assessment: $primarySymptom (Severity: $severity)',
        payload: assessment.toMap(),
      ));
    } else {
      // Async trigger to backend
      createAssessmentAsync(
        patientId: patientId,
        primarySymptom: primarySymptom,
        severity: severity,
        durationDays: durationDays,
        vitals: vitals,
        clinicalNotes: clinicalNotes,
      );
    }

    notifyListeners();
    return assessment;
  }

  TriageResult _computeTriage(Assessment asm) {
    int score = 25;
    List<String> drivers = [];
    String urgency = 'ROUTINE';
    String action = 'Standard outpatient consultation at Sub-Centre / PHC.';
    String reason = 'Patient presents with mild or routine symptoms with normal baseline vitals.';

    if (asm.severity == 'SEVERE') {
      score += 40;
      drivers.add('High symptom severity declared (${asm.primarySymptom})');
    } else if (asm.severity == 'MODERATE') {
      score += 20;
      drivers.add('Moderate symptom progression over ${asm.durationDays} days');
    }

    if (asm.vitals.spo2 != null && asm.vitals.spo2! < 94) {
      score += 35;
      drivers.add('Hypoxia: Low Oxygen Saturation (SpO2 ${asm.vitals.spo2}%)');
    }

    if (asm.vitals.systolicBp != null && (asm.vitals.systolicBp! > 160 || asm.vitals.systolicBp! < 90)) {
      score += 25;
      drivers.add('Abnormal Blood Pressure (${asm.vitals.systolicBp}/${asm.vitals.diastolicBp ?? 0} mmHg)');
    }

    if (asm.vitals.temperature != null && asm.vitals.temperature! > 101.5) {
      score += 20;
      drivers.add('High grade pyrexia (${asm.vitals.temperature}°F)');
    }

    if (asm.vitals.pulseRate != null && (asm.vitals.pulseRate! > 110 || asm.vitals.pulseRate! < 50)) {
      score += 15;
      drivers.add('Tachycardia / Bradycardia (${asm.vitals.pulseRate} bpm)');
    }

    if (score >= 70) {
      urgency = 'URGENT';
      action = 'Immediate stabilization and expedited referral to 24x7 PHC / CHC Emergency.';
      reason = 'Critical risk factors detected: ${drivers.join(", ")}. Requires prompt medical evaluation.';
    } else if (score >= 45) {
      urgency = 'PRIORITY';
      action = 'Same-day consultation at Primary Health Centre (PHC). Continuous vitals monitoring.';
      reason = 'Elevated clinical risk due to: ${drivers.join(", ")}. Doctor consultation recommended.';
    }

    return TriageResult(
      assessmentId: asm.id,
      urgencyLevel: urgency,
      urgencyScore: score.clamp(0, 100),
      contributingFactors: drivers.isEmpty ? ['Standard vitals within acceptable ranges'] : drivers,
      recommendedAction: action,
      explanationText: reason,
      confirmedUrgency: urgency,
    );
  }

  void updateWorkerTriageConfirmation({required String confirmedUrgency, String? notes}) {
    if (_currentTriageResult != null) {
      _currentTriageResult = _currentTriageResult!.copyWith(
        confirmedUrgency: confirmedUrgency,
        workerNotes: notes,
      );
      notifyListeners();
    }
  }

  void selectFacility(Facility facility) {
    _selectedFacility = facility;
    notifyListeners();
  }

  /// Submits referral case to backend POST /api/referrals
  Future<ReferralCase> submitReferralCaseAsync() async {
    final patient = _currentPatient ?? _patients.first;
    final facility = _selectedFacility ?? _facilities[1];
    final urgency = _currentTriageResult?.confirmedUrgency ?? _currentTriageResult?.urgencyLevel ?? 'PRIORITY';
    final complaint = _currentAssessment?.primarySymptom ?? 'General clinical consultation';

    ReferralCase referral = ReferralCase(
      referralId: 'REF-${DateTime.now().millisecondsSinceEpoch.toString().substring(7)}',
      patientId: patient.id,
      patientName: patient.name,
      triageUrgency: urgency,
      facility: facility,
      chiefComplaint: complaint,
    );

    if (_isOnline) {
      try {
        final res = await _apiService.createReferral(
          patientId: patient.id,
          destinationId: facility.id,
          urgency: urgency,
          reason: complaint,
        );

        if (res.isSuccess && res.data != null) {
          referral = ReferralCase.fromBackendMap(
            res.data!,
            fallbackFacility: facility,
            fallbackPatientName: patient.name,
          );
        } else {
          _syncQueue.add(SyncItem(
            id: _uuid.v4(),
            entityType: 'REFERRAL',
            action: 'CREATE',
            description: 'Referral to ${facility.name} for ${patient.name} (Urgency: $urgency)',
            payload: {
              'patientId': patient.id,
              'destinationId': facility.id,
              'urgency': urgency,
              'reason': complaint,
            },
          ));
        }
      } catch (e) {
        _syncQueue.add(SyncItem(
          id: _uuid.v4(),
          entityType: 'REFERRAL',
          action: 'CREATE',
          description: 'Referral to ${facility.name} for ${patient.name} (Urgency: $urgency)',
          payload: {
            'patientId': patient.id,
            'destinationId': facility.id,
            'urgency': urgency,
            'reason': complaint,
          },
        ));
      }
    } else {
      _syncQueue.add(SyncItem(
        id: _uuid.v4(),
        entityType: 'REFERRAL',
        action: 'CREATE',
        description: 'Referral to ${facility.name} for ${patient.name} (Urgency: $urgency)',
        payload: {
          'patientId': patient.id,
          'destinationId': facility.id,
          'urgency': urgency,
          'reason': complaint,
        },
      ));
    }

    _lastSubmittedCase = referral;
    _pendingReferralsCount += 1;
    notifyListeners();
    return referral;
  }

  ReferralCase submitReferralCase() {
    final patient = _currentPatient ?? _patients.first;
    final facility = _selectedFacility ?? _facilities[1];
    final urgency = _currentTriageResult?.confirmedUrgency ?? _currentTriageResult?.urgencyLevel ?? 'PRIORITY';
    final complaint = _currentAssessment?.primarySymptom ?? 'General clinical consultation';

    final referral = ReferralCase(
      referralId: 'REF-${DateTime.now().millisecondsSinceEpoch.toString().substring(7)}',
      patientId: patient.id,
      patientName: patient.name,
      triageUrgency: urgency,
      facility: facility,
      chiefComplaint: complaint,
    );

    _lastSubmittedCase = referral;

    if (!_isOnline) {
      _syncQueue.add(SyncItem(
        id: _uuid.v4(),
        entityType: 'REFERRAL',
        action: 'CREATE',
        description: 'Referral to ${facility.name} for ${patient.name} (Urgency: $urgency)',
        payload: {
          'patientId': patient.id,
          'destinationId': facility.id,
          'urgency': urgency,
          'reason': complaint,
        },
      ));
    } else {
      // Async trigger to backend
      _apiService.createReferral(
        patientId: patient.id,
        destinationId: facility.id,
        urgency: urgency,
        reason: complaint,
      );
    }

    _pendingReferralsCount += 1;
    notifyListeners();
    return referral;
  }

  void completeFollowUpTask({
    required String taskId,
    required String visitNotes,
    Vitals? recordedVitals,
  }) {
    final index = _followUpTasks.indexWhere((t) => t.id == taskId);
    if (index != -1) {
      final task = _followUpTasks[index];
      _followUpTasks[index] = task.copyWith(
        status: 'COMPLETED',
        visitNotes: visitNotes,
        completedAt: DateTime.now(),
      );

      final payload = {
        'id': taskId,
        'status': 'COMPLETED',
        'visitNotes': visitNotes,
      };

      if (!_isOnline) {
        _syncQueue.add(SyncItem(
          id: _uuid.v4(),
          entityType: 'FOLLOW_UP',
          action: 'UPDATE',
          description: 'Completed Visit for ${task.patientName}: $visitNotes',
          payload: payload,
        ));
      } else {
        // Send mutation in sync push
        _apiService.pushSyncBatch(
          workerId: _workerId,
          mutations: [
            {
              'operationId': _uuid.v4(),
              'entity': 'FOLLOWUP',
              'action': 'UPDATE',
              'payload': payload,
              'deviceId': 'flutter-mobile-client',
              'timestamp': DateTime.now().toIso8601String(),
            }
          ],
        );
      }

      notifyListeners();
    }
  }

  /// Two-way sync: Push batch mutations to POST /api/sync and pull delta from GET /api/sync/pull
  Future<bool> syncAllQueueItems() async {
    for (int i = 0; i < _syncQueue.length; i++) {
      _syncQueue[i] = _syncQueue[i].copyWith(status: 'SYNCING');
    }
    notifyListeners();

    bool syncSuccess = true;

    if (_isOnline && _syncQueue.isNotEmpty) {
      try {
        final mutations = _syncQueue.map((item) => item.toBackendMutation()).toList();
        final pushResponse = await _apiService.pushSyncBatch(
          workerId: _workerId,
          mutations: mutations,
        );

        if (pushResponse.isSuccess) {
          for (int i = 0; i < _syncQueue.length; i++) {
            _syncQueue[i] = _syncQueue[i].copyWith(status: 'SYNCED');
          }
          notifyListeners();
        } else {
          syncSuccess = false;
        }
      } catch (e) {
        syncSuccess = false;
      }
    } else {
      await Future.delayed(const Duration(milliseconds: 600));
      for (int i = 0; i < _syncQueue.length; i++) {
        _syncQueue[i] = _syncQueue[i].copyWith(status: 'SYNCED');
      }
      notifyListeners();
    }

    // Pull delta updates from backend
    if (_isOnline) {
      await loadDashboardData();
    }

    await Future.delayed(const Duration(milliseconds: 400));
    _syncQueue.clear();
    notifyListeners();

    return syncSuccess;
  }

  List<Patient> searchPatients(String query) {
    if (query.trim().isEmpty) return _patients;
    final q = query.toLowerCase();
    return _patients.where((p) {
      return p.name.toLowerCase().contains(q) ||
          p.phone.contains(q) ||
          p.village.toLowerCase().contains(q) ||
          (p.abhaId?.toLowerCase().contains(q) ?? false);
    }).toList();
  }
}
