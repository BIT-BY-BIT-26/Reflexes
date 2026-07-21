import 'package:flutter/material.dart';
import 'package:font_awesome_flutter/font_awesome_flutter.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:patient_app/features/auth/login_screen.dart';
import 'package:patient_app/features/auth/provider/auth_provider.dart';
import 'package:patient_app/features/departments/department_screen.dart';
import 'package:patient_app/features/hospital_route/hospital_route_screen.dart';
import 'package:patient_app/features/hospitals/hospital_profile_page.dart';
import 'package:patient_app/features/hospitals/provider/hospital_provider.dart';
import 'package:patient_app/features/hospitals/provider/review_provider.dart';
import 'package:patient_app/utils/constants.dart';
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
            style: ElevatedButton.styleFrom(backgroundColor: Colors.red),
            onPressed: () async {
              Navigator.of(ctx).pop(); // close dialog

              // 🔥 LOGOUT
              await context.read<AuthProvider>().logout();
              context.read<ReviewProvider>().clearReviews();

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
      backgroundColor: AppColors.background,
      appBar: AppBar(
        backgroundColor: Colors.black,
        title: Text(
          "Hospitals",
          style: GoogleFonts.poppins(
            color: AppColors.white,
            //fontWeight: FontWeight.bold,
            fontSize: 22,
          ),
        ),
        //centerTitle: true,
        actions: [
          IconButton(
            icon: const Icon(Icons.logout),
            onPressed: () {
              _showLogoutDialog(context);
            },
          ),
        ],
      ),

      body: SafeArea(
        child: Column(
          children: [
            const SizedBox(height: 10),

            // =====================
            // STATE DROPDOWN
            // =====================
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16),
              child: DropdownButtonFormField<String>(
                dropdownColor: AppColors.card,
                style: TextStyle(color: AppColors.white),
                value: provider.selectedState,
                decoration: InputDecoration(
                  labelText: "Select State",
                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(18),
                    borderSide: BorderSide(color: AppColors.border),
                  ),
                ),
                items: provider.states
                    .map((e) => DropdownMenuItem(value: e, child: Text(e)))
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
                dropdownColor: AppColors.card,
                style: TextStyle(color: AppColors.white),
                //iconEnabledColor: AppColors.glowBlue,
                value: provider.selectedCity,
                decoration: InputDecoration(
                  labelText: "Select City",

                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(18),
                    borderSide: BorderSide(color: AppColors.border),
                  ),
                ),
                items: provider.cities
                    .map((e) => DropdownMenuItem(value: e, child: Text(e)))
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
                        return Container(
                          margin: const EdgeInsets.symmetric(
                            horizontal: 16,
                            vertical: 8,
                          ),
                          decoration: BoxDecoration(
                          //color: const Color.fromARGB(255, 12, 17, 26),
                          gradient: const LinearGradient(
                            begin: Alignment.topLeft,
                            end: Alignment.bottomRight,
                            colors: [
                              
                              Color(0xFF161D2B),
                              Color(0xFF0E1522),
                              Color.fromARGB(255, 12, 17, 26),
                            ],
                          ),

                          borderRadius: BorderRadius.circular(22),
                          border: Border.all(
                            color: Colors.white.withOpacity(0.08),
                            width: 0.5
                          ),
                            boxShadow: [
                              BoxShadow(
                                color: Colors.black.withOpacity(.25),
                                blurRadius: 18,
                                offset: const Offset(0, 6),
                              ),
                            ],
                          ),
                                                  child: InkWell(
                            borderRadius: BorderRadius.circular(22),

                            onTap: () {
                              Navigator.push(
                                context,
                                MaterialPageRoute(
                                  builder: (_) =>
                                      HospitalProfileScreen(hospitalId: h.id),
                                ),
                              );
                            },

                            child: Padding(
                              padding: const EdgeInsets.symmetric(
                                horizontal: 14,
                                vertical: 13,
                              ),

                              child: Row(
                                children: [
                                  /// LOGO
                                  Container(
                                    height: 56,
                                    width: 56,

                                    decoration: BoxDecoration(
                                      borderRadius: BorderRadius.circular(18),
                                      color: const Color.fromARGB(255, 21, 87, 230).withAlpha(40),
                                    ),

                                    child: ClipRRect(
                                      borderRadius: BorderRadius.circular(18),

                                      child: h.logo.isNotEmpty
                                          ? Image.network(
                                              h.logo,
                                              fit: BoxFit.cover,
                                              errorBuilder: (_, __, ___) {
                                                return Center(
                                                  child: FaIcon(
                                                    FontAwesomeIcons.hospital,
                                                    color: AppColors.glowBlue,
                                                    size: 28,
                                                  ),
                                                );
                                              },
                                            )
                                          : Center(
                                              child: FaIcon(
                                                FontAwesomeIcons.hospital,
                                                color: AppColors.glowBlue,
                                                size: 26,
                                              ),
                                            ),
                                    ),
                                  ),

                                  const SizedBox(width: 16),

                                  Expanded(
                                    child: Column(
                                      crossAxisAlignment:
                                          CrossAxisAlignment.start,
                                      mainAxisAlignment:
                                          MainAxisAlignment.center,

                                      children: [
                                        Text(
                                          h.name,
                                          maxLines: 1,
                                          overflow: TextOverflow.ellipsis,
                                          style:  GoogleFonts.urbanist(
                                            color: Colors.white,
                                            //fontWeight: FontWeight.bold,
                                            fontSize: 17,
                                          ),
                                        ),

                                        const SizedBox(height: 8),

                                        Row(
                                          children: [
                                            const Icon(
                                              Icons.location_on,
                                              color: AppColors.glowBlue,
                                              size: 16,
                                            ),

                                            const SizedBox(width: 5),

                                            Expanded(
                                              child: Text(
                                                "${h.city}, ${h.state}",

                                                style: const TextStyle(
                                                  color: AppColors.grey,
                                                ),
                                              ),
                                            ),
                                          ],
                                        ),
                                      ],
                                    ),
                                  ),

                                  // IconButton(
                                  //   onPressed: () {
                                  //     Navigator.push(
                                  //       context,
                                  //       MaterialPageRoute(
                                  //         builder: (_) =>
                                  //             NavigationMapScreen(
                                  //               hospitalId: h.id,
                                  //             ),
                                  //       ),
                                  //     );
                                  //   },

                                  //   icon: const Icon(
                                  //     Icons.directions,
                                  //     color: AppColors.glowBlue,
                                  //   ),
                                  // ),
                                  const Icon(
                                    Icons.arrow_forward_ios,
                                    color: AppColors.grey,
                                    size: 16,
                                  ),
                                ],
                              ),
                            ),
                          ),
                        );
                      },
                    ),
            ),
          ],
        ),
      ),
    );
  }
}
