import 'package:flutter/material.dart';
import 'package:patient_app/features/auth/login_screen.dart';
import 'package:patient_app/features/auth/provider/auth_provider.dart';
import 'package:patient_app/features/departments/department_screen.dart';
import 'package:patient_app/features/hospital_route/hospital_route_screen.dart';
import 'package:patient_app/features/hospitals/provider/hospital_provider.dart';
import 'package:provider/provider.dart';

class HospitalScreen extends StatefulWidget {
  const HospitalScreen({super.key});

  @override
  State<HospitalScreen> createState() => _HospitalScreenState();
}

class _HospitalScreenState extends State<HospitalScreen> {
  @override
  void initState() {
    super.initState();

    // 🔹 Load states + hospitals once screen opens
    Future.microtask(() {
      context.read<HospitalProvider>().init();
    });
  }
  
  void _showLogoutDialog(BuildContext context) {
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text("Logout"),
        content: const Text("Are you sure you want to logout?"),
        actions: [
          TextButton(
            onPressed: () {
              Navigator.of(ctx).pop(); // dialog close
            },
            child: const Text("Cancel"),
          ),
          ElevatedButton(
            style: ElevatedButton.styleFrom(
              backgroundColor: Colors.red,
            ),
            onPressed: () async {
              Navigator.of(ctx).pop(); // close dialog

              // 🔥 LOGOUT
              await context.read<AuthProvider>().logout();

              // 🔁 Redirect to login & clear stack
              if (!mounted) return;
              Navigator.of(context).pushAndRemoveUntil(
                MaterialPageRoute(builder: (_) => const Login()),
                (route) => false,
              );
            },
            child: const Text("Logout"),
          ),
        ],
      ),
    );
  }


  @override
  Widget build(BuildContext context) {
    final provider = context.watch<HospitalProvider>();

    return Scaffold(
      appBar: AppBar(
      title: const Text("Hospitals"),
      centerTitle: true,
      actions: [
        IconButton(
          icon: const Icon(Icons.logout),
          onPressed: () {
            _showLogoutDialog(context);
          },
        ),
      ],
    ),

      
      body: Column(
        children: [
          const SizedBox(height: 10),

          // =====================
          // STATE DROPDOWN
          // =====================
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16),
            child: DropdownButtonFormField<String>(
              value: provider.selectedState,
              decoration: const InputDecoration(
                labelText: "Select State",
                border: OutlineInputBorder(),
              ),
              items: provider.states
                  .map(
                    (e) => DropdownMenuItem(
                      value: e,
                      child: Text(e),
                    ),
                  )
                  .toList(),
              onChanged: (val) {
                if (val != null) {
                  provider.onStateSelected(val);
                }
              },
            ),
          ),

          const SizedBox(height: 12),

          // =====================
          // CITY DROPDOWN
          // =====================
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16),
            child: DropdownButtonFormField<String>(
              value: provider.selectedCity,
              decoration: const InputDecoration(
                labelText: "Select City",
                border: OutlineInputBorder(),
              ),
              items: provider.cities
                  .map(
                    (e) => DropdownMenuItem(
                      value: e,
                      child: Text(e),
                    ),
                  )
                  .toList(),
              onChanged: (val) {
                if (val != null) {
                  provider.onCitySelected(val);
                }
              },
            ),
          ),

          const SizedBox(height: 16),

          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16),
            child: Row(
              children: [
                Expanded(
                  child: OutlinedButton.icon(
                    icon: const Icon(Icons.my_location),
                    label: const Text("Hospitals near me"),
                    onPressed: () {
                      context.read<HospitalProvider>().fetchNearbyHospitals();
                    },
                  ),
                ),
              ],
            ),
          ),

          const SizedBox(height: 16),
          

          // =====================
          // HOSPITAL LIST
          // =====================
          Expanded(
            child: provider.loading
                ? const Center(child: CircularProgressIndicator())
                : provider.hospitals.isEmpty
                    ? const Center(
                        child: Text(
                          "No hospitals yet",
                          style: TextStyle(fontSize: 16),
                        ),
                      )
                    : ListView.builder(
                        itemCount: provider.hospitals.length,
                        itemBuilder: (context, index) {
                          final h = provider.hospitals[index];
                          return Card(
                            margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 6),
                            child: ListTile(
                              title: Text(h.name),
                              //subtitle: Text("${h.city}, ${h.state}"),
                              subtitle: Text(
                                h.distanceKm != null
                                    ? "${h.city}, ${h.state} • ${h.distanceKm} km away"
                                    : "${h.city}, ${h.state}",
                              ),

                              //trailing: const Icon(Icons.arrow_forward_ios, size: 16),

                              trailing: Row(
                                  mainAxisSize: MainAxisSize.min,
                                  children: [
                                    // 🗺️ Directions button
                                    IconButton(
                                      icon: const Icon(Icons.directions),
                                      onPressed: () {
                                        Navigator.push(
                                          context,
                                          MaterialPageRoute(
                                            builder: (_) => NavigationMapScreen(
                                              hospitalId: h.id,
                                              //hospitalName: h.name,
                                            ),
                                          ),
                                        );
                                      },
                                    ),

                                    const Icon(Icons.arrow_forward_ios, size: 16),
                                  ],
                                ),


                              onTap: () {
                                Navigator.push(
                                  context,
                                  MaterialPageRoute(
                                    builder: (_) => DepartmentScreen(
                                      hospitalId: h.id, 
                                    ),
                                  ),
                                );
                              },
                            ),
                          );
                        },
                      ),
          ),
        ],
      ),
    );
  }
}
