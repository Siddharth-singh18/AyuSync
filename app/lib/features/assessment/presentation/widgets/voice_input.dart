import 'package:flutter/material.dart';

class VernacularVoiceInput extends StatefulWidget {
  final Function(String) onTranscriptionResult;
  
  const VernacularVoiceInput({super.key, required this.onTranscriptionResult});

  @override
  State<VernacularVoiceInput> createState() => _VernacularVoiceInputState();
}

class _VernacularVoiceInputState extends State<VernacularVoiceInput> {
  bool _isListening = false;
  String _currentLanguage = 'hi-IN'; // Default Hindi

  void _toggleListening() {
    setState(() {
      _isListening = !_isListening;
    });
    
    if (_isListening) {
      // 50. BHASHINI / VOICE INTEGRATION (Mocked)
      // Call Bhashini API or on-device speech-to-text here
      Future.delayed(const Duration(seconds: 2), () {
        if (!mounted) return;
        setState(() {
          _isListening = false;
        });
        widget.onTranscriptionResult("बुखार और खांसी (Fever and cough)");
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: Colors.blue.withOpacity(0.05),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: Colors.blue.shade200),
      ),
      child: Row(
        children: [
          DropdownButton<String>(
            value: _currentLanguage,
            underline: const SizedBox(),
            items: const [
              DropdownMenuItem(value: 'hi-IN', child: Text('हिन्दी')),
              DropdownMenuItem(value: 'bn-IN', child: Text('বাংলা')),
              DropdownMenuItem(value: 'te-IN', child: Text('తెలుగు')),
              DropdownMenuItem(value: 'en-IN', child: Text('English')),
            ],
            onChanged: (val) {
              if (val != null) setState(() => _currentLanguage = val);
            },
          ),
          const Spacer(),
          Text(
            _isListening ? 'Listening...' : 'Tap to speak',
            style: TextStyle(
              color: _isListening ? Colors.red : Colors.grey.shade700,
              fontStyle: FontStyle.italic,
            ),
          ),
          const SizedBox(width: 12),
          FloatingActionButton.small(
            onPressed: _toggleListening,
            backgroundColor: _isListening ? Colors.red : Colors.blue,
            elevation: 0,
            child: Icon(_isListening ? Icons.stop : Icons.mic, color: Colors.white),
          ),
        ],
      ),
    );
  }
}
