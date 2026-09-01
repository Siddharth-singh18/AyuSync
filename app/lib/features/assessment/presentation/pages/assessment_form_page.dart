import 'package:flutter/material.dart';

class AssessmentFormPage extends StatefulWidget {
  final String patientId;
  const AssessmentFormPage({super.key, required this.patientId});

  @override
  State<AssessmentFormPage> createState() => _AssessmentFormPageState();
}

class _AssessmentFormPageState extends State<AssessmentFormPage> {
  final _formKey = GlobalKey<FormState>();

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('New Assessment'),
      ),
      body: Form(
        key: _formKey,
        child: ListView(
          padding: const EdgeInsets.all(16.0),
          children: [
            const Text('Symptoms', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
            TextFormField(
              decoration: const InputDecoration(labelText: 'Primary Symptom', border: OutlineInputBorder()),
            ),
            const SizedBox(height: 16),
            DropdownButtonFormField<String>(
              decoration: const InputDecoration(labelText: 'Severity', border: OutlineInputBorder()),
              items: const [
                DropdownMenuItem(value: 'MILD', child: Text('Mild')),
                DropdownMenuItem(value: 'MODERATE', child: Text('Moderate')),
                DropdownMenuItem(value: 'SEVERE', child: Text('Severe')),
              ],
              onChanged: (val) {},
            ),
            const SizedBox(height: 24),
            const Text('Vitals', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
            Row(
              children: [
                Expanded(child: TextFormField(decoration: const InputDecoration(labelText: 'Temp (°F)'))),
                const SizedBox(width: 16),
                Expanded(child: TextFormField(decoration: const InputDecoration(labelText: 'SpO2 (%)'))),
              ],
            ),
            const SizedBox(height: 32),
            ElevatedButton(
              onPressed: () {
                // TODO: Save to offline queue
              },
              child: const Text('Save Assessment Offline'),
            )
          ],
        ),
      ),
    );
  }
}
