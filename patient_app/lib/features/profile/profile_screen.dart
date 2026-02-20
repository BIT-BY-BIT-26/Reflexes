import 'package:flutter/material.dart';
import 'package:patient_app/features/auth/provider/auth_provider.dart';
import 'package:patient_app/features/reports/reports_screen.dart';
import 'package:patient_app/models/patient_model.dart';
import 'package:patient_app/features/profile/provider/patient_profile_provider.dart';
import 'package:provider/provider.dart';

class PatientProfileScreen extends StatefulWidget {
  const PatientProfileScreen({super.key});

  @override
  State<PatientProfileScreen> createState() => _PatientProfileScreenState();
}

class _PatientProfileScreenState extends State<PatientProfileScreen> {

  // Load profile data when screen opens==========================================
  void _showEditProfileSheet(BuildContext context, PatientModel patient) {
    final ageController =
        TextEditingController(text: patient.age?.toString() ?? "");
    final phoneController =
        TextEditingController(text: patient.phone ?? "");
    String? selectedGender = patient.gender;
    String? selectedBlood = patient.bloodGroup;

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (_) {
        return Padding(
          padding: EdgeInsets.only(
            left: 16,
            right: 16,
            top: 20,
            bottom: MediaQuery.of(context).viewInsets.bottom + 20,
          ),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [

              const Text(
                "Edit Profile",
                style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
              ),

              const SizedBox(height: 16),

              TextField(
                controller: ageController,
                keyboardType: TextInputType.number,
                decoration: const InputDecoration(
                  labelText: "Age",
                  border: OutlineInputBorder(),
                ),
              ),

              const SizedBox(height: 12),

              DropdownButtonFormField<String>(
                value: selectedGender,
                decoration: const InputDecoration(
                  labelText: "Gender",
                  border: OutlineInputBorder(),
                ),
                items: ["Male", "Female", "Other"]
                    .map((e) =>
                        DropdownMenuItem(value: e, child: Text(e)))
                    .toList(),
                onChanged: (val) {
                  selectedGender = val;
                },
              ),

              const SizedBox(height: 12),

              DropdownButtonFormField<String>(
                value: selectedBlood,
                decoration: const InputDecoration(
                  labelText: "Blood Group",
                  border: OutlineInputBorder(),
                ),
                items: ["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"]
                    .map((e) =>
                        DropdownMenuItem(value: e, child: Text(e)))
                    .toList(),
                onChanged: (val) {
                  selectedBlood = val;
                },
              ),

              const SizedBox(height: 12),

              TextField(
                controller: phoneController,
                keyboardType: TextInputType.phone,
                decoration: const InputDecoration(
                  labelText: "Phone Number",
                  border: OutlineInputBorder(),
                ),
              ),

              const SizedBox(height: 20),

              ElevatedButton(
                style: ElevatedButton.styleFrom(
                  minimumSize: const Size(double.infinity, 48),
                ),
                onPressed: () async {
                  final token =
                      context.read<AuthProvider>().token!;

                  await context.read<PatientProvider>().updateProfile(
                        token: token,
                        age: ageController.text,
                        gender: selectedGender,
                        bloodGroup: selectedBlood,
                        phone: phoneController.text,
                      );

                  Navigator.pop(context);
                },
                child: const Text("Save Changes"),
              )
            ],
          ),
        );
      },
    );
  }

  

  @override
  void initState() {
    super.initState();
    Future.microtask(() {
      final token = context.read<AuthProvider>().token!;
      context.read<PatientProvider>().fetchProfile(token);
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xffF6F8FB),
      appBar: AppBar(
        title: const Text("Profile"),
        centerTitle: true,
        elevation: 0,
        actions: [
          Consumer<PatientProvider>(
            builder: (context, provider, _) {
              if (provider.patient == null) return const SizedBox();
              return IconButton(
                icon: const Icon(Icons.edit),
                onPressed: () {
                  _showEditProfileSheet(context, provider.patient!);
                },
              );
            },
          )
        ],
      ),
      body: Consumer<PatientProvider>(
        builder: (context, provider, _) {

          if (provider.loading) {
            return const Center(child: CircularProgressIndicator());
          }

          if (provider.error != null) {
            return Center(child: Text(provider.error!));
          }

          final patient = provider.patient;
          if (patient == null) {
            return const Center(child: Text("No profile data found"));
          }

          return SingleChildScrollView(
            padding: const EdgeInsets.all(16),
            child: Column(
              children: [
                _profileCard(patient),
                const SizedBox(height: 16),
                _infoCard(patient),
                const SizedBox(height: 24),
                _quickActions(context),
              ],
            ),
          );
        },
      ),
    );
  }

  // ================= PROFILE CARD =================
  Widget _profileCard(PatientModel patient) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        gradient: const LinearGradient(
          colors: [Colors.blue, Color(0xff5DA9FF)],
        ),
        borderRadius: BorderRadius.circular(16),
      ),
      child: Row(
        children: [
          const CircleAvatar(
            radius: 32,
            backgroundColor: Colors.white,
            child: Icon(Icons.person, size: 36, color: Colors.blue),
          ),
          const SizedBox(width: 16),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  patient.user.name,
                  style: const TextStyle(
                    color: Colors.white,
                    fontSize: 18,
                    fontWeight: FontWeight.bold,
                  ),
                ),
                const SizedBox(height: 4),
                Text(
                  patient.user.email,
                  style: const TextStyle(color: Colors.white70),
                ),
                const SizedBox(height: 8),
                Row(
                  children: [
                    if (patient.bloodGroup != null)
                      _Chip(
                        label: patient.bloodGroup!,
                        icon: Icons.bloodtype,
                      ),
                    const SizedBox(width: 8),
                    const _Chip(
                      label: "Active",
                      icon: Icons.verified_user,
                    ),
                  ],
                ),
              ],
            ),
          )
        ],
      ),
    );
  }

  // ================= INFO CARD =================
  Widget _infoCard(PatientModel patient) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
      ),
      child: Column(
        children: [
          _InfoRow(
            icon: Icons.cake,
            label: "Age",
            value: patient.age != null ? "${patient.age} years" : "-",
          ),
          const Divider(),
          _InfoRow(
            icon: Icons.person,
            label: "Gender",
            value: patient.gender ?? "-",
          ),
          const Divider(),
          _InfoRow(
            icon: Icons.phone,
            label: "Phone Number",
            value: patient.phone ?? "-",
          ),
        ],
      ),
    );
  }

  // ================= QUICK ACTIONS =================
  Widget _quickActions(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text(
          "Quick Actions",
          style: TextStyle(
            fontSize: 16,
            fontWeight: FontWeight.bold,
          ),
        ),
        const SizedBox(height: 12),
        _ActionTile(
          icon: Icons.description,
          title: "My Reports",
          subtitle: "View lab results & diagnostics",
          color: Colors.blue,
          onTap: () {
            Navigator.of(context).push(
              MaterialPageRoute(
                builder: (context) => MyReportsScreen(),
              ),
            );
          },
        ),
        const SizedBox(height: 12),
        _ActionTile(
          icon: Icons.medical_services,
          title: "My Prescriptions",
          subtitle: "Medications & treatment plans",
          color: Colors.green,
          onTap: () {
            Navigator.pushNamed(context, "/my-prescriptions");
          },
        ),
      ],
    );
  }
}

/* ================= REUSABLE WIDGETS ================= */

class _InfoRow extends StatelessWidget {
  final IconData icon;
  final String label;
  final String value;

  const _InfoRow({
    required this.icon,
    required this.label,
    required this.value,
  });

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        CircleAvatar(
          radius: 18,
          backgroundColor: Colors.blue.shade50,
          child: Icon(icon, color: Colors.blue, size: 20),
        ),
        const SizedBox(width: 12),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(label, style: const TextStyle(color: Colors.grey)),
              Text(
                value,
                style: const TextStyle(fontWeight: FontWeight.w600),
              ),
            ],
          ),
        )
      ],
    );
  }
}

class _ActionTile extends StatelessWidget {
  final IconData icon;
  final String title;
  final String subtitle;
  final Color color;
  final VoidCallback onTap;

  const _ActionTile({
    required this.icon,
    required this.title,
    required this.subtitle,
    required this.color,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(16),
      child: Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(16),
        ),
        child: Row(
          children: [
            CircleAvatar(
              radius: 22,
              backgroundColor: color.withOpacity(0.1),
              child: Icon(icon, color: color),
            ),
            const SizedBox(width: 16),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(title,
                      style: const TextStyle(fontWeight: FontWeight.bold)),
                  const SizedBox(height: 4),
                  Text(subtitle,
                      style: const TextStyle(color: Colors.grey)),
                ],
              ),
            ),
            const Icon(Icons.arrow_forward_ios, size: 16),
          ],
        ),
      ),
    );
  }
}

class _Chip extends StatelessWidget {
  final String label;
  final IconData icon;

  const _Chip({required this.label, required this.icon});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
      decoration: BoxDecoration(
        color: Colors.white.withOpacity(0.2),
        borderRadius: BorderRadius.circular(20),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, size: 14, color: Colors.white),
          const SizedBox(width: 4),
          Text(label, style: const TextStyle(color: Colors.white)),
        ],
      ),
    );
  }
}
