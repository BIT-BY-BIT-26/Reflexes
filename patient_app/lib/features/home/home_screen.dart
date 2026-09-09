import 'package:flutter/material.dart';
import 'package:font_awesome_flutter/font_awesome_flutter.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:patient_app/features/home/components/hospital_card.dart';
import 'package:patient_app/features/home/components/quick_access_card.dart';
import 'package:patient_app/features/auth/provider/auth_provider.dart';
import 'package:patient_app/features/emergency/emergency_confirm_sheet.dart';
import 'package:patient_app/features/emergency/emergency_status_screen.dart';
import 'package:patient_app/features/emergency/provider/emergency_provider.dart';
import 'package:patient_app/features/hospitals/service/hospital_service.dart';
import 'package:patient_app/helpers/location_helper.dart';
import 'package:patient_app/features/hospitals/hospital_profile_page.dart';
import 'package:patient_app/features/hospitals/hospital_screen.dart';
import 'package:patient_app/features/hospitals/provider/hospital_provider.dart';
import 'package:patient_app/features/pharmacy/pharmacy_screen.dart';
import 'package:patient_app/features/voice_assistant/voice_assistant_screen.dart';
import 'package:patient_app/utils/constants.dart';
import 'package:provider/provider.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {

  @override
  void initState() {
    super.initState();

    Future.microtask(() async {
      final provider =
          Provider.of<HospitalProvider>(context, listen: false);

      if (provider.nearbyHospitals.isEmpty) {
        await provider.fetchNearbyHospitals();
      }
    });
  }

  // Nearby radius in KILOMETRES - the backend computes maxDistance: radius * 1000.
  static const double _emergencyRadiusKm = 25;

  bool _preparingEmergency = false;

  void _snack(String message) {
    if (!mounted) return;
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text(message), backgroundColor: AppColors.error),
    );
  }

  /// Emergency quick-access tap.
  ///
  /// If a request is already open we go straight to its status screen - the
  /// backend rejects a second one with 409 anyway, and there is no way to
  /// cancel an emergency once filed.
  Future<void> _onEmergencyTap() async {
    if (_preparingEmergency) return;

    final auth = Provider.of<AuthProvider>(context, listen: false);
    final emergencyProvider =
        Provider.of<EmergencyProvider>(context, listen: false);

    if (auth.token == null) {
      _snack("Please log in to request an ambulance.");
      return;
    }
    final token = auth.token!;

    setState(() => _preparingEmergency = true);

    try {
      // 1. Already have one open? Jump to it.
      await emergencyProvider.loadActive(token);
      if (!mounted) return;

      if (emergencyProvider.hasActive) {
        Navigator.push(context, EmergencyStatusScreen.route());
        return;
      }

      // 2. Where is the patient? LocationHelper handles the disabled /
      //    denied / permanently-denied cases and throws a readable message.
      final position = await LocationHelper.getCurrentLocation();
      if (!mounted) return;

      // 3. Which hospitals are near? $geoNear returns them nearest-first with
      //    a distanceKm attached.
      final hospitals = await HospitalService().getHospitals(
        lat: position.latitude,
        lng: position.longitude,
        radius: _emergencyRadiusKm,
      );
      if (!mounted) return;

      if (hospitals.isEmpty) {
        _snack("No hospitals found near you. Please call emergency services.");
        return;
      }

      // 4. Confirm, then file it. Drop the spinner first - otherwise the
      //    sheet opens on top of a loading scrim that is no longer loading.
      setState(() => _preparingEmergency = false);

      final draft = await EmergencyConfirmSheet.show(context, hospitals);
      if (draft == null || !mounted) return;

      setState(() => _preparingEmergency = true);

      final sent = await emergencyProvider.sendEmergency(
        token: token,
        hospitalId: draft.hospital.id,
        latitude: position.latitude,
        longitude: position.longitude,
        reason: draft.reason,
        message: draft.message,
      );
      if (!mounted) return;

      if (sent) {
        Navigator.push(context, EmergencyStatusScreen.route());
      } else {
        _snack(emergencyProvider.error ?? "Could not send emergency request.");
      }
    } catch (e) {
      _snack(e.toString().replaceFirst("Exception: ", ""));
    } finally {
      if (mounted) setState(() => _preparingEmergency = false);
    }
  }
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        backgroundColor: Colors.black,
        actions: [
          Icon(
            Icons.notifications_sharp,
            color:AppColors.primaryBlue
          ),
          SizedBox(width: 18,)
        ],
        title: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          mainAxisSize: MainAxisSize.min,
          children: [
            const Text(
              "Welcome Back ",
              style: TextStyle(fontSize: 12, fontWeight: FontWeight.w400,color: Colors.white70),
            ),
            Text(
              "Ishani",
              style: GoogleFonts.abel(
                fontSize: 20,
                fontWeight:FontWeight.bold,
                color: Colors.white,
              ),
            )
          ],
        ),
      ),
      body: Stack(
        children: [
          Padding(
        padding: const EdgeInsets.all(12.0),
        child: SingleChildScrollView(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Container(
                decoration: BoxDecoration(
                  boxShadow: [
                      BoxShadow(
                        color: Colors.black.withOpacity(0.5),
                        blurRadius: 10,
                        spreadRadius: 3,
                        offset: Offset(2, 6),
                      ),
                    ],
                  borderRadius: BorderRadius.circular(20),
                  border: Border.all(
                    color: const Color.fromARGB(255, 5, 64, 111),
                    width: 0.5,
                  ),
                ),
                child: ClipRRect(
                  borderRadius: BorderRadius.circular(20),
                  child: Stack(
                    children: [
                      Image.asset(
                        "assets/animations/home.jpg",
                        height: 210,
                        width: double.infinity,
                        fit: BoxFit.fill,
                      ),
          
                      Positioned(
                        top: 20,
                        left: 18,
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              "Skip the Wait\nBook with Ease",
                              style: GoogleFonts.nunito(
                                color: Colors.white,
                                fontSize: 20,
                                fontWeight: FontWeight.w700,
                              ),
                            ),
                            SizedBox(height: 6),
                            Text(
                              "book appintments and\nmonitor queue in real time",
                              style: TextStyle(
                                color: Colors.blueGrey[200],
                                fontSize: 11,
                              ),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                ),
              ),
              SizedBox(height: 20),
              Text(
                "Quick access",
                style: GoogleFonts.inter(
                  fontSize: 16,
                  color: Colors.white,
                ),
              ),
              SizedBox(height: 10),
              SingleChildScrollView(
                scrollDirection:Axis.horizontal,
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children:[
                    GestureDetector(
                      onTap: () {
                        // Navigate to the desired screen when the card is tapped
                        Navigator.push(
                          context,
                          MaterialPageRoute(builder: (context) => HospitalScreen()),
                        );
                      },
                      child: QuickAccessCard(
                        size: 25,
                        iconPath: FontAwesomeIcons.hospital,
                        text: "Find Hospitals",
                      ),
                    ),
                    QuickAccessCard(
                      size: 25,
                      iconPath: FontAwesomeIcons.userDoctor,
                              
                      text: "Top Doctors",
                    ),
                    GestureDetector(
                      onTap: _onEmergencyTap,
                      child: QuickAccessCard(
                        size: 25,
                        iconPath: FontAwesomeIcons.truckMedical,
                        text: "Emergency",
                      ),
                    ),
                    GestureDetector(
                      onTap: () {
                        Navigator.push(context, PharmacyScreen.route());
                      },
                      child: QuickAccessCard(
                        size: 25,
                        iconPath: FontAwesomeIcons.pills,
                        text: "Pharmacy",
                      ),
                    ),
                    GestureDetector(
                      onTap: () {
                        Navigator.push(context, VoiceAssistantScreen.route());
                      },
                      child: QuickAccessCard(
                        size: 25,
                        iconPath: FontAwesomeIcons.microphone,
                        text: "AI Assistant",
                      ),
                    ),
                  ]
                  
                ),
              ),
              SizedBox(height: 20),
              Row(
                children: [
                  Expanded(
                    child: Text(
                      "Nearby Hospitals",
                      style: GoogleFonts.inter(
                        fontSize: 16,
                        color: Colors.white,
                      ),
                    ),
                  ),
                  TextButton(
                    onPressed: () {
                      // navigate to full hospital screen
                      Navigator.push(
                        context,
                        MaterialPageRoute(
                          builder: (_) => HospitalScreen(),
                        ),
                      );
                    },
                    child: Text(
                      "View All",
                      style: TextStyle(color: AppColors.primaryBlue),
                    ),
                  ),
                ],
              ),
              SizedBox(height: 10),
              Consumer<HospitalProvider>(
                builder: (context, provider, child) {
                  if (provider.loading) {
                    return Center(child: CircularProgressIndicator());
                  }
                  if (provider.nearbyHospitals.isEmpty) {
                    return Text(
                      "No hospitals found nearby",
                      style: TextStyle(color: Colors.white70),
                    );
                  }
    
                  final top3 = provider.nearbyHospitals.take(3).toList();
    
                  return Column(
                    children: [
                      ...top3.map((h) {
                        return Padding(
                          padding: const EdgeInsets.only(bottom: 12),
                          child: HospitalCard(
                            imagePath: "assets/animations/hospitals.jpg",
                            hospitalName: h.name,
                            distance: "${h.distanceKm?.toStringAsFixed(1) ?? '--'} km away", // later real distance add kar sakte ho
                            availability:h.isActive == true ? "Available Now" : "Currently Unavailable",
                            onView: () {},
                          ),
                        );
                      }),
    
                      SizedBox(height: 10),
                    ],
                  );
                },
              ),
              // Text(
              //   "Nearby Hospitals",
              //   style: GoogleFonts.inter(
              //     fontSize: 16,
              //     color: Colors.white,
              //   ),
              // ),
              // SizedBox(height: 10),
              // HospitalCard(
              //   imagePath: "assets/animations/hospitals.jpg",
              //   hospitalName: "City Hospital",
              //   distance: "2.5 km away",
              //   availability: "Available Now",
              //   onView: () {
              //     // Handle view action
              //   },
              // ),
              // SizedBox(height: 12),
              // HospitalCard(
              //   imagePath: "assets/animations/hospitals.jpg",
              //   hospitalName: "City Hospital",
              //   distance: "2.5 km away",
              //   availability: "Available Now",
              //   onView: () {
              //     // Handle view action
              //   },
              // ),
              // SizedBox(height: 12),
              // HospitalCard(
              //   imagePath: "assets/animations/hospitals.jpg",
              //   hospitalName: "City Hospital",
              //   distance: "2.5 km away",
              //   availability: "Available Now",
              //   onView: () {
              //     // Handle view action
              //   },
              // ),
            ],
          ),
        ),
      ),
          // Acquiring GPS + fetching nearby hospitals takes a moment; without
          // this the Emergency card feels dead on tap.
          if (_preparingEmergency)
            Container(
              color: Colors.black54,
              child: const Center(child: CircularProgressIndicator()),
            ),
        ],
      ),
    );
  }
}
