import 'package:flutter/material.dart';
import '../widgets/custom_button.dart';
import 'package:intl/intl.dart';

class AppointmentScreen extends StatefulWidget {
  const AppointmentScreen({super.key});

  @override
  State<AppointmentScreen> createState() => _AppointmentScreenState();
}

class _AppointmentScreenState extends State<AppointmentScreen> {
  DateTime? selectedDate;
  String? selectedDoctor;
  String? selectedTime;

  final List<String> doctors = [
    'Dr. Sarah Johnson - Cardiologist',
    'Dr. Michael Chen - General Physician',
    'Dr. Emily Brown - Pediatrician',
  ];

  final List<String> timeSlots = [
    '9:00 AM',
    '10:00 AM',
    '11:00 AM',
    '2:00 PM',
    '3:00 PM',
    '4:00 PM',
  ];

  void _selectDate() async {
    final DateTime? picked = await showDatePicker(
      context: context,
      initialDate: DateTime.now(),
      firstDate: DateTime.now(),
      lastDate: DateTime.now().add(const Duration(days: 30)),
    );
    if (picked != null) {
      setState(() {
        selectedDate = picked;
      });
    }
  }

  void _bookAppointment() {
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(
        content: Text('Appointment booked successfully!'),
      ),
    );
    Navigator.pop(context);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Book Appointment'),
        centerTitle: true,
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Select Doctor',
              style: Theme.of(context).textTheme.titleLarge,
            ),
            const SizedBox(height: 12),
            Card(
              elevation: 0,
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(12),
                side: BorderSide(
                  color: Theme.of(context).colorScheme.outline.withOpacity(0.2),
                ),
              ),
              child: ListView.separated(
                shrinkWrap: true,
                physics: const NeverScrollableScrollPhysics(),
                itemCount: doctors.length,
                separatorBuilder: (context, index) => Divider(
                  color: Theme.of(context).colorScheme.outline.withOpacity(0.1),
                ),
                itemBuilder: (context, index) => RadioListTile(
                  value: doctors[index],
                  groupValue: selectedDoctor,
                  onChanged: (value) {
                    setState(() {
                      selectedDoctor = value as String;
                    });
                  },
                  title: Text(doctors[index]),
                ),
              ),
            ),
            const SizedBox(height: 24),
            Text(
              'Select Date',
              style: Theme.of(context).textTheme.titleLarge,
            ),
            const SizedBox(height: 12),
            InkWell(
              onTap: _selectDate,
              child: Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(
                    color: Theme.of(context).colorScheme.outline.withOpacity(0.2),
                  ),
                ),
                child: Row(
                  children: [
                    Icon(
                      Icons.calendar_today,
                      color: Theme.of(context).colorScheme.primary,
                    ),
                    const SizedBox(width: 12),
                    Text(
                      selectedDate != null
                          ? DateFormat('MMM dd, yyyy').format(selectedDate!)
                          : 'Select a date',
                      style: Theme.of(context).textTheme.bodyLarge,
                    ),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 24),
            if (selectedDate != null) ...[
              Text(
                'Select Time',
                style: Theme.of(context).textTheme.titleLarge,
              ),
              const SizedBox(height: 12),
              Wrap(
                spacing: 8,
                runSpacing: 8,
                children: timeSlots.map((time) {
                  final isSelected = time == selectedTime;
                  return ChoiceChip(
                    label: Text(time),
                    selected: isSelected,
                    onSelected: (selected) {
                      setState(() {
                        selectedTime = selected ? time : null;
                      });
                    },
                  );
                }).toList(),
              ),
            ],
            const SizedBox(height: 32),
            CustomButton(
              onPressed: selectedDoctor != null &&
                      selectedDate != null &&
                      selectedTime != null
                  ? _bookAppointment
                  : null,
              text: 'Book Appointment',
            ),
          ],
        ),
      ),
    );
  }
}