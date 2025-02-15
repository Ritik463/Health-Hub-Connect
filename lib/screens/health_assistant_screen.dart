import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';
import '../widgets/custom_button.dart';

class HealthAssistantScreen extends StatefulWidget {
  const HealthAssistantScreen({super.key});

  @override
  State<HealthAssistantScreen> createState() => _HealthAssistantScreenState();
}

class _HealthAssistantScreenState extends State<HealthAssistantScreen> {
  final TextEditingController _symptomsController = TextEditingController();
  String? _response;
  bool _isLoading = false;

  Future<void> _getHealthAdvice() async {
    setState(() {
      _isLoading = true;
      _response = null;
    });

    try {
      // Using the free HuggingFace Inference API with a medical model
      final response = await http.post(
        Uri.parse('https://api-inference.huggingface.co/models/medical-qa-model'),
        headers: {
          'Content-Type': 'application/json',
        },
        body: jsonEncode({
          'inputs': _symptomsController.text,
        }),
      );

      if (response.statusCode == 200) {
        setState(() {
          _response = jsonDecode(response.body)[0]['generated_text'];
        });
      } else {
        throw Exception('Failed to get health advice');
      }
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Error: ${e.toString()}')),
      );
    } finally {
      setState(() {
        _isLoading = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Health Assistant'),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(24),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            Text(
              'Describe your symptoms',
              style: Theme.of(context).textTheme.titleLarge,
            ),
            const SizedBox(height: 16),
            TextField(
              controller: _symptomsController,
              maxLines: 4,
              decoration: InputDecoration(
                hintText: 'E.g. I have a headache and fever...',
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(12),
                ),
              ),
            ),
            const SizedBox(height: 24),
            CustomButton(
              onPressed: _isLoading ? null : () => _getHealthAdvice(),
              text: _isLoading ? 'Getting Advice...' : 'Get Health Advice',
            ),
            if (_response != null) ...[
              const SizedBox(height: 32),
              Card(
                child: Padding(
                  padding: const EdgeInsets.all(16),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'Recommendation:',
                        style: Theme.of(context).textTheme.titleMedium,
                      ),
                      const SizedBox(height: 8),
                      Text(_response!),
                      const SizedBox(height: 16),
                      const Text(
                        'Note: This is AI-generated advice and should not replace professional medical consultation.',
                        style: TextStyle(
                          fontSize: 12,
                          color: Colors.grey,
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ],
          ],
        ),
      ),
    );
  }
}