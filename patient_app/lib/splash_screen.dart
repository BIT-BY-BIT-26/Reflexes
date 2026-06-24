import 'package:flutter/material.dart';
import 'package:lottie/lottie.dart';
import 'package:patient_app/features/auth/login_screen.dart';
import 'package:patient_app/features/auth/provider/auth_provider.dart';
import 'package:patient_app/utils/constants.dart';
import 'package:patient_app/widgets/custom_bottom_nav.dart';
import 'package:provider/provider.dart';

class SplashScreen extends StatefulWidget {
  const SplashScreen({super.key});

  @override
  State<SplashScreen> createState() => _SplashScreenState();
}

class _SplashScreenState extends State<SplashScreen> {
  @override
  void initState() {
    super.initState();

    WidgetsBinding.instance.addPostFrameCallback((_) async {
      // 🕒 Splash ko 3 seconds dikhane ke liye
      await Future.delayed(const Duration(seconds: 3));

      final auth = context.read<AuthProvider>();
      await auth.tryAutoLogin();

      if (!mounted) return; // safety
      // if (auth.isLoggedIn && auth.patientId != null) {
      //   SocketService().ensureConnected(auth.patientId!);
      // }

      if (auth.isLoggedIn) {
        Navigator.pushReplacement(
          context,
          MaterialPageRoute(builder: (_) => const CustomBottomNav()),
        );
      } else {
        Navigator.pushReplacement(
          context,
          MaterialPageRoute(builder: (_) => const Login()),
        );
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          crossAxisAlignment: CrossAxisAlignment.center,
          children: [
            Lottie.asset(
              'assets/animations/prescription.json',
              width: 200,
              height: 200,
              fit: BoxFit.fill,
            ),
            SizedBox(height: 20),
            Text(
              "Welcome to MediTrack",
              style: TextStyle(
                fontSize: 26,
                fontWeight: FontWeight.bold,
                color: Color.fromARGB(255, 7, 164, 179),
              ),
            ),
            SizedBox(height: 8),
            Text(
              "Your smart hospital queue management",
              style: TextStyle(fontSize: 16, color: Colors.grey),
            ),
          ],
        ),
      ),
    );
  }
}
